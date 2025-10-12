import { useState, useEffect } from "react";
import api from "../../../../api";
import toast from "react-hot-toast";

const LDTTab = ({ lang, t, user }) => {
  const [ldtRegistrations, setLdtRegistrations] = useState([]);
  const [selectedRegistrations, setSelectedRegistrations] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [calculations, setCalculations] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paying, setPaying] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [showPaymentMethodSelector, setShowPaymentMethodSelector] =
    useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [payerIdentifier, setPayerIdentifier] = useState("");
  const [transactionId, setTransactionId] = useState("");
  // const [ldtPayments, setLdtPayments] = useState([]);
  // const [showHistoryModal, setShowHistoryModal] = useState(false);
  // const [loadingPayments, setLoadingPayments] = useState(false);

  const handlePayLdt = async () => {
    if (selectedRegistrations.length === 0) {
      alert(
        lang === "BN"
          ? "কোনো ল্যান্ড সিলেক্ট করুন।"
          : "Please select at least one land."
      );
      return;
    }

    if (kycStatus !== "success") {
      alert(lang === "BN" ? "KYC আপডেট করা হয়নি।" : "KYC not updated.");
      return;
    }

    const hasUnapproved = selectedRegistrations.some((id) => {
      const reg = ldtRegistrations.find((r) => r.id === id);
      return reg.status !== "approved";
    });
    if (hasUnapproved) {
      toast.error(
        "Your registered land hasn’t been approved yet. You can pay once it’s approved. For assistance, call 01XXXXXXXXX."
      );
      return;
    }

    try {
      const { data } = await api.post("/land-tax-payments/calculate", {
        registration_ids: selectedRegistrations,
      });
      setCalculations(data.calculations);
      setTotalAmount(data.total_amount);
      setShowPayModal(true);
    } catch (error) {
      alert(error.response?.data?.error || "Error calculating tax.");
    }
  };

  const handleConfirmPayment = async () => {
    setPaying(true);
    try {
      await api.post("/land-tax-payments/pay", {
        registration_ids: selectedRegistrations,
        payment_method: paymentMethod,
        payer_identifier: payerIdentifier,
        transaction_id: transactionId,
      });
      alert(lang === "BN" ? "পেমেন্ট সফল হয়েছে।" : "Payment successful.");
      setShowPayModal(false);
      setShowPaymentMethodSelector(false);
      setSelectedRegistrations([]);
      setPaymentMethod("");
      setPayerIdentifier("");
      setTransactionId("");
      fetchPayments(); // Refresh payments
    } catch (error) {
      alert(error.response?.data?.error || "Payment failed.");
    } finally {
      setPaying(false);
    }
  };

  const handlePaymentClick = () => {
    setShowPaymentMethodSelector(true);
  };

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const { data } = await api.get("/land-tax-payments");

      setLdtPayments(data);
    } catch (error) {
      console.error("Error fetching LDT payments:", error);
      setLdtPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    try {
      const response = await api.get(
        `/land-tax-payments/${paymentId}/invoice`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_ldt_payment_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert(
        lang === "BN"
          ? "ইনভয়েস ডাউনলোড ব্যর্থ। আবার চেষ্টা করুন।"
          : "Failed to download invoice. Please try again."
      );
    }
  };

  useEffect(() => {
    let intervalId;
    const fetchLdt = async () => {
      try {
        const { data } = await api.get("/user/land-tax-registrations");
        setLdtRegistrations(data);
      } catch (error) {
        console.error("Error fetching LDT registrations:", error);
        setLdtRegistrations([]);
      }
    };
    fetchLdt();
    intervalId = setInterval(fetchLdt, 10000);

    const fetchKyc = async () => {
      try {
        const { data } = await api.get("/user/kyc");
        setKycStatus(data.kyc?.status);
      } catch (error) {
        setKycStatus(null);
      }
    };
    fetchKyc();

    fetchPayments();
    return () => intervalId && clearInterval(intervalId);
  }, []);

  if (ldtRegistrations.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t("ldtHeader")}
        </h2>
        <p className="text-gray-600 mb-4">{t("ldtDesc")}</p>
        <p className="text-gray-600">
          {t("noLdtRegistrations")}
          <a className="text-red-400" href="/land-tax">
            {" "}
            &nbsp; Register Here
          </a>
        </p>
        <div className="flex gap-3 mt-4">
          <button className="px-4 py-2 rounded-md border">{t("payLdt")}</button>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-4 py-2 rounded-md border"
          >
            {t("viewHistory")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("ldtHeader")}
        </h2>
        <a
          className=" text-red-500 rounded-md border px-4 py-1 hover:bg-gray-300"
          href="/land-tax"
        >
          {" "}
          New Register Here
        </a>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3 mt-6">
          <div className="flex gap-62">
            <p className="text-gray-600 mb-2">{t("ldtDesc")}</p>
            <div className="item-end">
              <a
                onClick={handlePayLdt}
                rel="noopener noreferrer"
                className="text-green-500 rounded-md border px-4 py-1 hover:bg-gray-300"
              >
                {t("payLdt")}
              </a>{" "}
              <a
                href="/dashboard?tab=payments"
                rel="noopener noreferrer"
                className="text-blue-500 rounded-md border px-4 py-1 hover:bg-gray-300"
              >
                {t("paymentStatus")}
              </a>
            </div>
          </div>

          {/* <button
          onClick={() => setShowHistoryModal(true)}
          className="px-4 py-2 rounded-md border"
        >
          {t("viewHistory")}
        </button> */}
        </div>
        {ldtRegistrations.map((reg) => (
          <div
            key={reg.id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={selectedRegistrations.includes(reg.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRegistrations([
                      ...selectedRegistrations,
                      reg.id,
                    ]);
                  } else {
                    setSelectedRegistrations(
                      selectedRegistrations.filter((id) => id !== reg.id)
                    );
                  }
                }}
                className="mt-1 mr-3"
              />
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <tbody className="[&_tr:nth-child(even)]:bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold bg-gray-100 w-56">
                        {t("registrationId")}
                      </th>
                      <td className="px-4 py-2">{reg?.id ?? "—"}</td>
                    </tr>
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold bg-gray-100">
                        {t("land")}
                      </th>
                      <td className="px-4 py-2">{reg?.land_type ?? "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold bg-gray-100">
                        {t("dagNumber")}
                      </th>
                      <td className="px-4 py-2">{reg?.dag_number ?? "—"}</td>
                    </tr>
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold bg-gray-100">
                        {t("khatiyanNumber")}
                      </th>
                      <td className="px-4 py-2">
                        {reg?.khatiyan_number ?? "—"}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold bg-gray-100">
                        {t("landArea")}
                      </th>
                      <td className="px-4 py-2">
                        {reg?.land_area ?? "—"} &nbsp;({t("area")})
                      </td>
                    </tr>
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold bg-gray-100">
                        {t("registrationDate")}
                      </th>
                      <td className="px-4 py-2">{reg?.reviewed_at}</td>
                    </tr>
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold bg-gray-100">
                        {t("status")}
                      </th>
                      <td className="px-4 py-2">
                        <span className="uppercase text-xs font-semibold inline-block px-2 py-1 border rounded ">
                          {reg?.status ?? "—"}
                        </span>
                      </td>
                    </tr>

                    {reg?.status === "flagged" && (
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold bg-gray-100">
                          {t("notes")}
                        </th>
                        <td className="px-4 py-2">
                          <span className="text-red-600">
                            {reg?.notes ?? "—"}
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div>{/* Add actions if needed */}</div>
          </div>
        ))}
      </div>

      {showPayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Tax Calculation</h3>
            <div className="space-y-2 mb-4">
              {calculations.map((calc, index) => (
                <div key={index} className="border-b pb-2">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <th className="text-left pr-3 py-1">State:</th>
                        <td className="py-1">{calc.state}</td>
                      </tr>
                      <tr>
                        <th className="text-left pr-3 py-1">Khatiyan:</th>
                        <td className="py-1">{calc.khatiyan_number}</td>
                      </tr>
                      <tr>
                        <th className="text-left pr-3 py-1">Dag:</th>
                        <td className="py-1">{calc.dag_number}</td>
                      </tr>
                      <tr>
                        <th className="text-left pr-3 py-1">Area:</th>
                        <td className="py-1">{calc.area} sq ft</td>
                      </tr>
                      <tr>
                        <th className="text-left pr-3 py-1">Type:</th>
                        <td className="py-1">{calc.type}</td>
                      </tr>
                      <tr>
                        <th className="text-left pr-3 py-1">Rate:</th>
                        <td className="py-1">{calc.rate} BDT</td>
                      </tr>
                      <tr>
                        <th className="text-left pr-3 py-1">Amount:</th>
                        <td className="py-1">{calc.amount} BDT</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
            <p className="text-xl font-bold mb-4">Total: {totalAmount} BDT</p>
            {!showPaymentMethodSelector ? (
              <div className="flex gap-3">
                <button
                  onClick={handlePaymentClick}
                  disabled={paying}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {paying ? "Processing..." : "Confirm Payment"}
                </button>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select a method</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Card/Bank">Card/Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">
                    Payer Identifier
                  </label>
                  <input
                    type="text"
                    value={payerIdentifier}
                    onChange={(e) => setPayerIdentifier(e.target.value)}
                    placeholder={
                      paymentMethod === "bKash" || paymentMethod === "Nagad"
                        ? "Enter phone number"
                        : "Enter card or bank number"
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">
                    Transaction ID (optional)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmPayment}
                    disabled={paying || !paymentMethod || !payerIdentifier}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {paying ? "Processing..." : "Confirm Payment"}
                  </button>
                  <button
                    onClick={() => setShowPaymentMethodSelector(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">LDT Payment History</h3>
            {loadingPayments ? (
              <p>Loading payments...</p>
            ) : ldtPayments.length === 0 ? (
              <p>No payments found.</p>
            ) : (
              <div className="space-y-4">
                {ldtPayments.map((payment) => (
                  <div key={payment.id} className="border rounded p-4">
                    <p>
                      <strong>Payment ID:</strong> {payment.id}
                    </p>
                    <p>
                      <strong>Year:</strong> {payment.year}
                    </p>
                    <p>
                      <strong>Amount:</strong> {payment.amount} BDT
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`uppercase text-sm font-semibold ${
                          payment.status === "paid"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </p>
                    <p>
                      <strong>Paid At:</strong>{" "}
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Registration:</strong>{" "}
                      {payment.land_tax_registration?.khatiyan_number} -{" "}
                      {payment.land_tax_registration?.dag_number}
                    </p>
                    <button
                      onClick={() => handleDownloadInvoice(payment.id)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Download Invoice
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default LDTTab;
