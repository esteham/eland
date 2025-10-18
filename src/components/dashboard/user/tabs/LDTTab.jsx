import { useState, useEffect } from "react";
import api from "../../../../api";
import toast from "react-hot-toast";

const LDTTab = ({ lang, t }) => {
  const [ldtRegistrations, setLdtRegistrations] = useState([]);
  const [selectedRegistrations, setSelectedRegistrations] = useState([]);

  // KYC & payments
  const [kycStatus, setKycStatus] = useState(null);

  // Calculate & Pay
  const [showPayModal, setShowPayModal] = useState(false);
  const [calculations, setCalculations] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showPaymentMethodSelector, setShowPaymentMethodSelector] =
    useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [payerIdentifier, setPayerIdentifier] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paying, setPaying] = useState(false);

  // ------- Helpers -------
  const currency = (n) =>
    n == null ? "—" : `${Number(n).toLocaleString()} BDT`;
  const statusPill = (status) => {
    const map = {
      approved: "bg-green-50 text-green-700 ring-green-200",
      pending: "bg-yellow-50 text-yellow-700 ring-yellow-200",
      flagged: "bg-orange-50 text-orange-700 ring-orange-200",
      rejected: "bg-red-50 text-red-700 ring-red-200",
    };
    return `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${
      map[status] || "bg-slate-50 text-slate-700 ring-slate-200"
    }`;
  };

  // ------- Fetchers -------
  useEffect(() => {
    let intervalId;

    const fetchLdt = async () => {
      try {
        const { data } = await api.get("/user/land-tax-registrations");
        setLdtRegistrations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching LDT registrations:", error);
        setLdtRegistrations([]);
      }
    };

    const fetchKyc = async () => {
      try {
        const { data } = await api.get("/user/kyc");
        setKycStatus(data?.kyc?.status ?? null);
      } catch (error) {
        setKycStatus(null);
      }
    };

    const fetchPayments = async () => {
      setLoadingPayments(true);
      try {
        const { data } = await api.get("/land-tax-payments");
        setLdtPayments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching LDT payments:", error);
        setLdtPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchLdt();
    fetchKyc();
    fetchPayments();
    intervalId = setInterval(fetchLdt, 10000); // auto-refresh regs

    return () => intervalId && clearInterval(intervalId);
  }, []);

  // ------- Actions -------
  const handlePayLdt = async () => {
    if (selectedRegistrations.length === 0) {
      toast.error(
        lang === "BN"
          ? "কোনো ল্যান্ড সিলেক্ট করুন।"
          : "Please select at least one land."
      );
      return;
    }

    if (kycStatus !== "success") {
      toast.error(lang === "BN" ? "KYC আপডেট করা হয়নি।" : "KYC not updated.");
      return;
    }

    const hasUnapproved = selectedRegistrations.some((id) => {
      const reg = ldtRegistrations.find((r) => r.id === id);
      return reg?.status !== "approved";
    });
    if (hasUnapproved) {
      toast.error(
        lang === "BN"
          ? "আপনার রেজিস্টার্ড ল্যান্ড এখনও অনুমোদিত নয়। অনুমোদনের পরে পেমেন্ট করুন। সহায়তা: 01XXXXXXXXX"
          : "Your registered land hasn’t been approved yet. You can pay once it’s approved. For assistance, call 01XXXXXXXXX."
      );
      return;
    }

    try {
      const { data } = await api.post("/land-tax-payments/calculate", {
        registration_ids: selectedRegistrations,
      });
      setCalculations(data?.calculations || []);
      setTotalAmount(data?.total_amount || 0);
      setShowPayModal(true);
      setShowPaymentMethodSelector(false);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Error calculating tax.");
    }
  };

  const handleConfirmPayment = async () => {
    setPaying(true);
    try {
      await api.post("/land-tax-payments/pay", {
        registration_ids: selectedRegistrations,
        payment_method: paymentMethod,
        payer_identifier: payerIdentifier,
        transaction_id: transactionId || null,
      });

      toast.success(
        lang === "BN" ? "পেমেন্ট সফল হয়েছে।" : "Payment successful."
      );
      setShowPayModal(false);
      setShowPaymentMethodSelector(false);
      setSelectedRegistrations([]);
      setPaymentMethod("");
      setPayerIdentifier("");
      setTransactionId("");

      // refresh registrations to reflect any post-payment state
      const { data } = await api.get("/user/land-tax-registrations");
      setLdtRegistrations(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Payment failed.");
    } finally {
      setPaying(false);
    }
  };

  // ------- Empty State -------
  if (ldtRegistrations.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          {t("ldtHeader")}
        </h2>
        <p className="text-slate-600">{t("ldtDesc")}</p>
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-700">{t("noLdtRegistrations")}</p>
          <a
            href="/land-tax"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Register Here
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {t("ldtHeader")}
        </h2>
        <a
          href="/land-tax"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
        >
          + New Register
        </a>
      </div>

      {/* KYC banner */}
      {kycStatus !== "success" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <div className="flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <p>
              {lang === "BN"
                ? "পেমেন্টের আগে আপনার KYC সম্পূর্ণ করুন।"
                : "Please complete your KYC before payment."}
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{t("ldtDesc")}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePayLdt}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            disabled={selectedRegistrations.length === 0}
          >
            {t("payLdt")} ({selectedRegistrations.length})
          </button>
          <a
            href="/dashboard?tab=payments"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-900"
          >
            {t("paymentStatus")}
          </a>
        </div>
      </div>

      {/* Registrations */}
      <div className="space-y-3">
        {ldtRegistrations.map((reg) => {
          const checked = selectedRegistrations.includes(reg.id);
          return (
            <div
              key={reg.id}
              className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* top accent bar */}
              <div className=" inset-x-0 top-0 h-1 from-blue-600 via-indigo-600 to-purple-600 opacity-70" />

              <div className="flex gap-4">
                {/* Checkbox */}
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setSelectedRegistrations((prev) =>
                        e.target.checked
                          ? [...prev, reg.id]
                          : prev.filter((id) => id !== reg.id)
                      )
                    }
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      {t("registrationId")}:{" "}
                      <span className="font-medium text-slate-700">
                        {reg?.id ?? "—"}
                      </span>
                    </h3>
                    <span className={statusPill(reg?.status)}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current/70" />
                      {reg?.status ?? "—"}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <InfoRow
                      label={t("land")}
                      value={reg?.land_type ?? "N/A"}
                    />
                    <InfoRow
                      label={t("landArea")}
                      value={`${reg?.land_area ?? "—"} (${t("area")})`}
                    />
                    <InfoRow
                      label={t("khatiyanNumber")}
                      value={reg?.khatiyan_number ?? "—"}
                    />
                    <InfoRow
                      label={t("dagNumber")}
                      value={reg?.dag_number ?? "—"}
                    />
                    <InfoRow
                      label={t("registrationDate")}
                      value={reg?.reviewed_at ?? "—"}
                    />
                  </div>

                  {reg?.status === "flagged" && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <strong className="mr-1">{t("notes")}:</strong>
                      <span>{reg?.notes ?? "—"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/50 backdrop-blur-sm">
          <div className="w-[95vw] max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="relative rounded-t-2xl p-5">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
              <h3 className="text-lg font-bold text-slate-900">
                {lang === "BN" ? "ট্যাক্স ক্যালকুলেশন" : "Tax Calculation"}
              </h3>
              <p className="text-sm text-slate-600">
                {lang === "BN"
                  ? "নির্বাচিত জমির ট্যাক্স সারাংশ"
                  : "Summary for selected lands"}
              </p>
            </div>

            <div className="px-5 pb-5">
              {/* Summary list */}
              <div className="space-y-3">
                {calculations.map((calc, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 p-3"
                  >
                    <div className="text-sm grid grid-cols-2 gap-x-3 gap-y-1">
                      <span className="text-slate-500">State:</span>
                      <span className="font-medium text-slate-800">
                        {calc.state}
                      </span>

                      <span className="text-slate-500">Khatiyan:</span>
                      <span className="font-medium text-slate-800">
                        {calc.khatiyan_number}
                      </span>

                      <span className="text-slate-500">Dag:</span>
                      <span className="font-medium text-slate-800">
                        {calc.dag_number}
                      </span>

                      <span className="text-slate-500">Area:</span>
                      <span className="font-medium text-slate-800">
                        {calc.area} sq ft
                      </span>

                      <span className="text-slate-500">Type:</span>
                      <span className="font-medium text-slate-800">
                        {calc.type}
                      </span>

                      <span className="text-slate-500">Rate:</span>
                      <span className="font-medium text-slate-800">
                        {currency(calc.rate)}
                      </span>

                      <span className="text-slate-500">Amount:</span>
                      <span className="font-semibold text-slate-900">
                        {currency(calc.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">
                  {lang === "BN" ? "মোট পরিশোধযোগ্য" : "Total Due"}
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {currency(totalAmount)}
                </span>
              </div>

              {/* Step actions */}
              {!showPaymentMethodSelector ? (
                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowPayModal(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    {lang === "BN" ? "বাতিল" : "Cancel"}
                  </button>
                  <button
                    onClick={() => setShowPaymentMethodSelector(true)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    {lang === "BN" ? "পেমেন্টে যান" : "Proceed to Pay"}
                  </button>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {lang === "BN" ? "পেমেন্ট মেথড" : "Payment Method"}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">
                        {lang === "BN"
                          ? "একটি মেথড নির্বাচন করুন"
                          : "Select a method"}
                      </option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Card/Bank">Card/Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {lang === "BN"
                        ? "পেয়ার আইডেন্টিফায়ার"
                        : "Payer Identifier"}
                    </label>
                    <input
                      type="text"
                      value={payerIdentifier}
                      onChange={(e) => setPayerIdentifier(e.target.value)}
                      placeholder={
                        paymentMethod === "bKash" || paymentMethod === "Nagad"
                          ? lang === "BN"
                            ? "ফোন নম্বর দিন"
                            : "Enter phone number"
                          : lang === "BN"
                          ? "কার্ড/ব্যাংক নম্বর দিন"
                          : "Enter card or bank number"
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {lang === "BN"
                        ? "ট্রানজ্যাকশন আইডি (ঐচ্ছিক)"
                        : "Transaction ID (optional)"}
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder={
                        lang === "BN"
                          ? "ট্রানজ্যাকশন আইডি দিন"
                          : "Enter transaction ID"
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowPaymentMethodSelector(false)}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      {lang === "BN" ? "পেছনে" : "Back"}
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={paying || !paymentMethod || !payerIdentifier}
                      className="rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {paying
                        ? lang === "BN"
                          ? "প্রসেস হচ্ছে..."
                          : "Processing..."
                        : lang === "BN"
                        ? "পেমেন্ট কনফার্ম"
                        : "Confirm Payment"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LDTTab;

/* ---------- Tiny UI helpers ---------- */
const InfoRow = ({ label, value }) => (
  <div className="flex items-center gap-2">
    <span className="text-slate-500">{label}:</span>
    <span className="font-medium text-slate-800">{value}</span>
  </div>
);
