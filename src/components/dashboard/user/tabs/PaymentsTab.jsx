import { useState, useEffect } from "react";
import api from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";

const PaymentsTab = ({ lang, t }) => {
  const [activeTab, setActiveTab] = useState("applications");

  const [paymentsApplications, setPaymentsApplications] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const [mutations, setMutations] = useState([]);
  const [loadingMutations, setLoadingMutations] = useState(false);

  const [ldtPayments, setLdtPayments] = useState([]);
  const [loadingLdtPayments, setLoadingLdtPayments] = useState(false);

  const [visibleApps, setVisibleApps] = useState(3);
  const [visibleMutations, setVisibleMutations] = useState(3);
  const [visibleLdt, setVisibleLdt] = useState(3);

  // ---- Fetchers ----
  useEffect(() => {
    const fetchPayments = async () => {
      setLoadingPayments(true);
      try {
        const { data } = await api.get("/applications");
        // newest first (by id)
        setPaymentsApplications(
          (data || []).sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0))
        );
      } catch (error) {
        console.error("Error fetching payments:", error);
        setPaymentsApplications([]);
      } finally {
        setLoadingPayments(false);
      }
    };

    const fetchMutations = async () => {
      setLoadingMutations(true);
      try {
        const response = await api.get("/mutations");
        const list = response?.data?.data || [];
        setMutations(list.sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0)));
      } catch (error) {
        console.error("Error fetching mutations:", error);
        setMutations([]);
      } finally {
        setLoadingMutations(false);
      }
    };

    const fetchLdtPayments = async () => {
      setLoadingLdtPayments(true);
      try {
        const { data } = await api.get("/land-tax-payments");
        const list = data || [];
        setLdtPayments(
          list.sort((a, b) => {
            const da = a?.paid_at ? +new Date(a.paid_at) : 0;
            const db = b?.paid_at ? +new Date(b.paid_at) : 0;
            return db - da;
          })
        );
      } catch (error) {
        console.error("Error fetching LDT payments:", error);
        setLdtPayments([]);
      } finally {
        setLoadingLdtPayments(false);
      }
    };

    fetchPayments();
    fetchMutations();
    fetchLdtPayments();
  }, []);

  // ---- Downloads ----
  const handleDownloadInvoice = async (appId) => {
    try {
      const response = await api.get(`/applications/${appId}/invoice`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_application_${appId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert(
        lang === LANGS.BN
          ? "ইনভয়েস ডাউনলোড ব্যর্থ। আবার চেষ্টা করুন।"
          : "Failed to download invoice. Please try again."
      );
    }
  };

  const handleDownloadLdtInvoice = async (paymentId) => {
    try {
      const response = await api.get(
        `/land-tax-payments/${paymentId}/invoice`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_ldt_payment_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert(
        lang === LANGS.BN
          ? "ইনভয়েস ডাউনলোড ব্যর্থ। আবার চেষ্টা করুন।"
          : "Failed to download invoice. Please try again."
      );
    }
  };

  const handleDownloadMutationInvoice = async (mutationId) => {
    try {
      const response = await api.get(`/mutations/${mutationId}/invoice`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_mutation_${mutationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading mutation invoice:", error);
      alert(
        lang === LANGS.BN
          ? "ইনভয়েস ডাউনলোড ব্যর্থ। আবার চেষ্টা করুন।"
          : "Failed to download invoice. Please try again."
      );
    }
  };

  // ---- Helpers ----
  const currency = (n) => (n == null ? "—" : `${n} BDT`);
  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString() : "N/A";
  const isLoading = loadingPayments || loadingMutations || loadingLdtPayments;

  // latest id for subtle NEW chip (top item only)
  const latestAppId = paymentsApplications[0]?.id;
  const latestMutationId = mutations[0]?.id;
  const latestLdtId = ldtPayments[0]?.id;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {t("paymentsHeader")}
        </h2>
      </header>

      {/* Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-2 p-2">
          <TabButton
            active={activeTab === "applications"}
            onClick={() => setActiveTab("applications")}
          >
            Khatiyan And Maps
          </TabButton>
          <TabButton
            active={activeTab === "mutations"}
            onClick={() => setActiveTab("mutations")}
          >
            Mutation Payment
          </TabButton>
          <TabButton
            active={activeTab === "ldt"}
            onClick={() => setActiveTab("ldt")}
          >
            LDT Payment History
          </TabButton>
        </div>

        <div className="border-t border-slate-200 p-4 sm:p-5">
          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {!isLoading && activeTab === "applications" && (
            <SectionList
              lang={lang}
              emptyText={t("noPayments")}
              items={paymentsApplications.slice(0, visibleApps)}
              total={paymentsApplications.length}
              onMore={() => setVisibleApps((p) => p + 10)}
              onLess={() => setVisibleApps(3)}
              canMore={paymentsApplications.length > visibleApps}
              canLess={visibleApps > 3}
              renderItem={(app, idx) => (
                <Card key={app.id}>
                  <div className="flex-1 min-w-0">
                    <CardTitle>
                      <span className="font-semibold">{t("typeLabel")}:</span>{" "}
                      {app.type || "—"}
                      {idx === 0 && app.id === latestAppId && <NewBadge />}
                    </CardTitle>
                    <CardMeta>
                      <MetaRow
                        label={t("feeAmount")}
                        value={currency(app.fee_amount)}
                      />
                      <MetaRow
                        label={t("paymentStatus")}
                        value={
                          <StatusPill
                            status={(app.payment_status || "").toLowerCase()}
                          >
                            {app.payment_status || "—"}
                          </StatusPill>
                        }
                      />
                    </CardMeta>
                  </div>
                  <div className="shrink-0">
                    {app.payment_status === "paid" ? (
                      <PrimaryButton
                        onClick={() => handleDownloadInvoice(app.id)}
                      >
                        {t("downloadInvoice")}
                      </PrimaryButton>
                    ) : (
                      <span className="text-sm font-semibold text-red-600">
                        {t("paymentPending")}
                      </span>
                    )}
                  </div>
                </Card>
              )}
            />
          )}

          {!isLoading && activeTab === "mutations" && (
            <SectionList
              lang={lang}
              emptyText={t("noPayments")}
              items={mutations.slice(0, visibleMutations)}
              total={mutations.length}
              onMore={() => setVisibleMutations((p) => p + 10)}
              onLess={() => setVisibleMutations(3)}
              canMore={mutations.length > visibleMutations}
              canLess={visibleMutations > 3}
              renderItem={(m, idx) => (
                <Card key={m.id}>
                  <div className="flex-1 min-w-0">
                    <CardTitle>
                      <span className="font-semibold">Mutation ID:</span> {m.id}
                      {idx === 0 && m.id === latestMutationId && <NewBadge />}
                    </CardTitle>
                    <CardMeta>
                      <MetaRow
                        label="Mutation Type"
                        value={m.mutation_type || "—"}
                      />
                      <MetaRow
                        label={t("feeAmount")}
                        value={currency(m.fee_amount)}
                      />
                      <MetaRow
                        label={t("paymentStatus")}
                        value={
                          <StatusPill
                            status={(m.payment_status || "").toLowerCase()}
                          >
                            {m.payment_status || "—"}
                          </StatusPill>
                        }
                      />
                      <MetaRow
                        label="Submitted At"
                        value={formatDate(m.created_at)}
                      />
                    </CardMeta>
                  </div>
                  <div className="shrink-0">
                    {m.payment_status === "paid" ? (
                      <PrimaryButton
                        onClick={() => handleDownloadMutationInvoice(m.id)}
                      >
                        {t("downloadInvoice")}
                      </PrimaryButton>
                    ) : (
                      <span className="text-sm font-semibold text-red-600">
                        {t("paymentPending")}
                      </span>
                    )}
                  </div>
                </Card>
              )}
            />
          )}

          {!isLoading && activeTab === "ldt" && (
            <SectionList
              lang={lang}
              emptyText={t("noPayments")}
              items={ldtPayments.slice(0, visibleLdt)}
              total={ldtPayments.length}
              onMore={() => setVisibleLdt((p) => p + 10)}
              onLess={() => setVisibleLdt(3)}
              canMore={ldtPayments.length > visibleLdt}
              canLess={visibleLdt > 3}
              renderItem={(p, idx) => (
                <Card key={p.id}>
                  <div className="flex-1 min-w-0">
                    <CardTitle>
                      <span className="font-semibold">Payment ID:</span> {p.id}
                      {idx === 0 && p.id === latestLdtId && <NewBadge />}
                    </CardTitle>
                    <CardMeta>
                      <MetaRow label="Year" value={p.year ?? "—"} />
                      <MetaRow label="Amount" value={currency(p.amount)} />
                      <MetaRow
                        label="Status"
                        value={
                          <StatusPill status={(p.status || "").toLowerCase()}>
                            {p.status || "—"}
                          </StatusPill>
                        }
                      />
                      <MetaRow label="Paid At" value={formatDate(p.paid_at)} />
                      <MetaRow
                        label="Registration"
                        value={
                          p.land_tax_registration
                            ? `${p.land_tax_registration.khatiyan_number}-${p.land_tax_registration.dag_number}`
                            : "—"
                        }
                      />
                    </CardMeta>
                  </div>
                  <div className="shrink-0">
                    <PrimaryButton
                      onClick={() => handleDownloadLdtInvoice(p.id)}
                    >
                      {t("downloadInvoice")}
                    </PrimaryButton>
                  </div>
                </Card>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;

/* ================== UI Helpers ================== */

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={
      active
        ? "px-3 py-1.5 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow hover:from-blue-700 hover:to-indigo-700"
        : "px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
    }
  >
    {children}
  </button>
);

const Card = ({ children }) => (
  <div className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
    {/* Accent bar */}
    <div className="pointer-events-none inset-x-0 top-0 h-1  from-blue-600 via-indigo-600 to-purple-600 opacity-70" />
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      {children}
    </div>
  </div>
);

const CardTitle = ({ children }) => (
  <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
    {children}
  </h4>
);

const CardMeta = ({ children }) => (
  <div className="mt-1 text-sm text-slate-700 space-y-1.5">{children}</div>
);

const MetaRow = ({ label, value }) => (
  <div className="flex flex-wrap items-center gap-x-2">
    <span className="text-slate-500">{label}:</span>
    <span className="font-medium text-slate-800">{value}</span>
  </div>
);

const PrimaryButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors"
  >
    {children}
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M7 10l5 5 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
);

const StatusPill = ({ status, children }) => {
  // normalize few common values
  const s = (status || "").toLowerCase();
  const map = {
    paid: "bg-green-50 text-green-700 ring-green-200",
    success: "bg-green-50 text-green-700 ring-green-200",
    pending: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    unpaid: "bg-red-50 text-red-700 ring-red-200",
    failed: "bg-red-50 text-red-700 ring-red-200",
  };
  const cls = map[s] || "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${cls}`}
    >
      {children}
    </span>
  );
};

const NewBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-red-600/10 px-2 py-0.5 text-[11px] font-bold uppercase text-red-700 ring-1 ring-red-200">
    <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
    New
  </span>
);

const SectionList = ({
  emptyText,
  items,
  total,
  onMore,
  onLess,
  canMore,
  canLess,
  renderItem,
}) => {
  if (!total) {
    return <p className="text-slate-600">{emptyText}</p>;
  }
  return (
    <div className="space-y-4">
      {items.map((it, idx) => renderItem(it, idx))}
      <div className="pt-1 flex items-center gap-2">
        {canMore && (
          <button
            onClick={onMore}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
          >
            Show more
          </button>
        )}
        {canLess && (
          <button
            onClick={onLess}
            className="px-3 py-1.5 rounded-lg bg-slate-600 text-white hover:bg-slate-700"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="relative rounded-2xl border border-slate-200 bg-white p-4 overflow-hidden">
    <div className="absolute inset-x-0 top-0 h-1 bg-slate-200" />
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-40 bg-slate-200 rounded" />
      <div className="h-3 w-72 bg-slate-200 rounded" />
      <div className="h-3 w-56 bg-slate-200 rounded" />
      <div className="flex justify-end">
        <div className="h-8 w-28 bg-slate-200 rounded-lg" />
      </div>
    </div>
  </div>
);
