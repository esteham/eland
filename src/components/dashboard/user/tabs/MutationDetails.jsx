import { useState, useEffect, useCallback } from "react";
import api from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";
import PaymentBox from "./PaymentBox";

const MutationDetails = ({ lang, mutationId, onBack }) => {
  const [mutation, setMutation] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMutation = useCallback(async () => {
    if (!mutationId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/mutations/${mutationId}`);
      setMutation(data);
    } catch (error) {
      console.error("Error fetching mutation details:", error);
      alert(
        lang === LANGS.BN
          ? "মিউটেশন বিস্তারিত লোড করতে ব্যর্থ হয়েছে।"
          : "Failed to load mutation details."
      );
    } finally {
      setLoading(false);
    }
  }, [mutationId, lang]);

  useEffect(() => {
    fetchMutation();
  }, [fetchMutation]);

  const handlePrint = () => {
    setTimeout(() => window.print(), 0);
  };

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return (
        d.toLocaleDateString() +
        " " +
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      return "—";
    }
  };

  const statusClass = (status) => {
    const map = {
      approved: "bg-green-50 text-green-700 ring-green-200",
      pending: "bg-yellow-50 text-yellow-700 ring-yellow-200",
      pending_payment: "bg-blue-50 text-blue-700 ring-blue-200",
      rejected: "bg-red-50 text-red-700 ring-red-200",
      flagged: "bg-orange-50 text-orange-700 ring-orange-200",
    };
    return `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${
      map[status] || "bg-slate-50 text-slate-700 ring-slate-200"
    }`;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-5 w-64 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-28 bg-slate-200 rounded-xl" />
            <div className="h-28 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-40 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!mutation) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <p>
          {lang === LANGS.BN ? "মিউটেশন পাওয়া যায়নি।" : "Mutation not found."}
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 print:hidden"
        >
          {lang === LANGS.BN ? "ফিরে যান" : "Back"}
        </button>
      </div>
    );
  }

  const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-[13px] text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 max-w-[65%] text-right break-words">
        {value ?? "—"}
      </span>
    </div>
  );

  return (
    <>
      {/* PRINT-ONLY CSS: show only .print-area on print; hide everything else (e.g. sidebar) */}
      <style>{`
        @media print {
          html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* hide everything by default */
          body * { visibility: hidden !important; }
          /* show only the details section */
          .print-area, .print-area * { visibility: visible !important; }
          /* position the print area to fill the page, remove app spacing */
          .print-area {
            position: absolute !important;
            inset: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            background: white !important;
          }
          /* optional: page size & margins */
          @page { size: A4; margin: 12mm; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto print:max-w-none print:p-0 print-area">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 print:border-0 print:shadow-none print:rounded-none print:p-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                  <path
                    d="M15 19l-7-7 7-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {lang === LANGS.BN ? "ফিরে যান" : "Back"}
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                  <path
                    d="M6 9V5h12v4M6 14H5a2 2 0 01-2-2v-1a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2h-1M8 18h8v1H8z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                {lang === LANGS.BN ? "প্রিন্ট" : "Print"}
              </button>
            </div>

            <div className="text-right">
              <h2 className="text-xl font-bold text-blue-600 print:text-black">
                {lang === LANGS.BN ? "মিউটেশন বিস্তারিত" : "Mutation Details"}
              </h2>
              <div className="mt-1 flex items-center justify-end gap-2">
                <span className="text-xs text-slate-500">
                  #{mutation.id ?? "—"}
                </span>
                <span
                  className={`${statusClass(
                    mutation.status
                  )} print:border print:ring-0 print:bg-transparent print:text-black`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current/70 print:hidden" />
                  {mutation.status || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Info */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border print:shadow-none print:rounded-none print:p-3">
            <h3 className="mb-2 font-semibold text-blue-600 print:text-black flex items-center gap-2">
              <span className="h-5 w-5 grid place-items-center rounded-md bg-blue-50 text-blue-700 ring-1 ring-blue-100 print:hidden">
                🧾
              </span>
              {lang === LANGS.BN ? "মিউটেশন তথ্য" : "Mutation Info"}
            </h3>
            <InfoRow
              label={lang === LANGS.BN ? "মিউটেশন টাইপ" : "Mutation Type"}
              value={mutation.mutation_type || "N/A"}
            />
            <InfoRow
              label={lang === LANGS.BN ? "কারণ" : "Reason"}
              value={mutation.reason || "N/A"}
            />
            <InfoRow
              label={lang === LANGS.BN ? "ফি পরিমাণ" : "Fee Amount"}
              value={
                mutation.fee_amount != null
                  ? `${mutation.fee_amount} BDT`
                  : "N/A"
              }
            />
            <InfoRow
              label={lang === LANGS.BN ? "রিমার্কস" : "Remarks"}
              value={mutation.remarks || "N/A"}
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border print:shadow-none print:rounded-none print:p-3">
            <h3 className="mb-2 font-semibold text-blue-600 print:text-black flex items-center gap-2">
              <span className="h-5 w-5 grid place-items-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 print:hidden">
                📍
              </span>
              {lang === LANGS.BN
                ? "আবেদন/জমির তথ্য"
                : "Application / Land Info"}
            </h3>
            <InfoRow
              label={lang === LANGS.BN ? "খতিয়ান নম্বর" : "Khatiyan Number"}
              value={mutation.khatian_number || "N/A"}
            />
            <InfoRow
              label={lang === LANGS.BN ? "দাগ নম্বর" : "Dag Number"}
              value={mutation.dag_number || "N/A"}
            />
            <InfoRow
              label={lang === LANGS.BN ? "জমির ধরন" : "Land Type"}
              value={mutation.land_type || "N/A"}
            />
            <InfoRow
              label={lang === LANGS.BN ? "জমির পরিমাণ" : "Land Area"}
              value={
                mutation.land_area != null
                  ? `${mutation.land_area} sq ft`
                  : "N/A"
              }
            />
          </section>
        </div>

        {/* Reviewer & Timestamps */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border print:shadow-none print:rounded-none print:p-3">
          <h3 className="mb-2 font-semibold text-blue-600 print:text-black flex items-center gap-2">
            <span className="h-5 w-5 grid place-items-center rounded-md bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 print:hidden">
              ⏱️
            </span>
            {lang === LANGS.BN ? "অবস্থা ও সময়" : "Status & Timing"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 px-4 py-3 print:bg-transparent print:px-0 print:py-0">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {lang === LANGS.BN ? "তৈরি হয়েছে" : "Created At"}
              </div>
              <div className="mt-0.5 text-sm font-medium text-slate-900">
                {formatDateTime(mutation.created_at)}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3 print:bg-transparent print:px-0 print:py-0">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {lang === LANGS.BN ? "রিভিউ হয়েছে" : "Reviewed At"}
              </div>
              <div className="mt-0.5 text-sm font-medium text-slate-900">
                {mutation.reviewed_at
                  ? formatDateTime(mutation.reviewed_at)
                  : "—"}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3 print:bg-transparent print:px-0 print:py-0">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {lang === LANGS.BN ? "রিভিউয়ার" : "Reviewer"}
              </div>
              <div className="mt-0.5 text-sm font-medium text-slate-900">
                {mutation.reviewer?.name || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        {Array.isArray(mutation.documents) && mutation.documents.length > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border print:shadow-none print:rounded-none print:p-3">
            <h3 className="mb-2 font-semibold text-blue-600 print:text-black flex items-center gap-2">
              <span className="h-5 w-5 grid place-items-center rounded-md bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100 print:hidden">
                📎
              </span>
              {lang === LANGS.BN ? "ডকুমেন্টস" : "Documents"}
            </h3>
            <ul className="divide-y divide-slate-200 print:divide-none">
              {mutation.documents.map((doc, index) => (
                <li
                  key={index}
                  className="py-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-6 w-6 grid place-items-center rounded-md bg-slate-100 text-slate-600 print:hidden">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                        <path
                          d="M8 7h8M8 11h8M8 15h5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span className="text-sm text-slate-800 truncate">
                      {doc.name || doc.path?.split("/").pop() || "document"}
                    </span>
                  </div>
                  <a
                    href={`/storage/${doc.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-700 hover:underline print:hidden"
                  >
                    {lang === LANGS.BN ? "খুলুন" : "Open"}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Payment (hide on print) */}
        {mutation.status === "pending_payment" && (
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm print:hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-blue-800">
                  {lang === LANGS.BN ? "পেমেন্ট প্রয়োজন" : "Payment Required"}
                </h3>
                <p className="text-sm text-blue-800/80">
                  {lang === LANGS.BN
                    ? "আবেদন সম্পন্ন করতে পেমেন্ট সম্পূর্ণ করুন।"
                    : "Complete the payment to finish your application."}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <PaymentBox
                mutationId={mutation.id}
                lang={lang}
                onSuccess={fetchMutation}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MutationDetails;
