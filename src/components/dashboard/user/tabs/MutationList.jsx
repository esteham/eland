import { useState, useEffect, useMemo } from "react";
import api from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";
import MutationForm from "./MutationForm";
import MutationDetails from "./MutationDetails";

const MutationList = ({ lang, t, user }) => {
  const [mutations, setMutations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleItems, setVisibleItems] = useState(3);
  const [showForm, setShowForm] = useState(false);
  const [selectedMutationId, setSelectedMutationId] = useState(null);

  const fetchMutations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/mutations");
      setMutations(data?.data || []);
    } catch (error) {
      console.error("Error fetching mutations:", error);
      setMutations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMutations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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

  // Desc sort (newest first)
  const sortedMutations = useMemo(() => {
    const copy = [...mutations];
    copy.sort((a, b) => {
      const ta = a?.created_at ? +new Date(a.created_at) : 0;
      const tb = b?.created_at ? +new Date(b.created_at) : 0;
      if (tb !== ta) return tb - ta;
      const ia = isFinite(Number(a?.id)) ? Number(a.id) : 0;
      const ib = isFinite(Number(b?.id)) ? Number(b.id) : 0;
      return ib - ia;
    });
    return copy;
  }, [mutations]);

  // Latest item id for NEW badge
  const latestId = sortedMutations[0]?.id;

  const statusStyle = (status) => {
    const map = {
      approved: "bg-green-50 text-green-700 ring-green-200",
      pending: "bg-yellow-50 text-yellow-700 ring-yellow-200",
      pending_payment: "bg-blue-50 text-blue-700 ring-blue-200",
      rejected: "bg-red-50 text-red-700 ring-red-200",
      flagged: "bg-orange-50 text-orange-700 ring-orange-200",
    };
    const cls = map[status] || "bg-slate-50 text-slate-700 ring-slate-200";
    return `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${cls}`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Header lang={lang} t={t} onNew={() => setShowForm(true)} />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (showForm) {
    return (
      <MutationForm
        lang={lang}
        onSuccess={() => {
          setShowForm(false);
          fetchMutations();
        }}
        onBack={() => setShowForm(false)}
      />
    );
  }

  if (selectedMutationId) {
    return (
      <MutationDetails
        lang={lang}
        mutationId={selectedMutationId}
        onBack={() => setSelectedMutationId(null)}
      />
    );
  }

  const visible = sortedMutations.slice(0, visibleItems);

  return (
    <div className="space-y-4">
      <Header lang={lang} t={t} onNew={() => setShowForm(true)} />

      {sortedMutations.length === 0 ? (
        <EmptyState lang={lang} t={t} onNew={() => setShowForm(true)} />
      ) : (
        <>
          <div className="space-y-3">
            {visible.map((m) => {
              const khatian =
                m.khatian_number || m.application?.khatiyan_number || "N/A";
              const dag = m.dag_number || "N/A";
              const landType = m.land_type || "N/A";
              const area = m.land_area ? `${m.land_area} sq ft` : "N/A";
              const docsCount = Array.isArray(m.documents)
                ? m.documents.length
                : 0;

              const isLatest = m.id === latestId;

              return (
                <div
                  key={m.id}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* NEW badge (red) */}
                  {isLatest && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-600/10 px-2 py-0.5 text-[11px] font-bold uppercase text-red-700 ring-1 ring-red-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                      New
                    </span>
                  )}

                  {/* Content */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-slate-900">
                        {lang === LANGS.BN
                          ? "খতিয়ান নম্বর"
                          : "Khatiyan Number"}
                        :{" "}
                        <span className="font-medium text-slate-700">
                          {khatian}
                        </span>
                      </h3>

                      {/* STACKED LINES */}
                      <div className="text-sm text-slate-600 space-y-1">
                        <div>
                          <strong className="text-slate-700">
                            {lang === LANGS.BN ? "দাগ নম্বর:" : "Dag Number:"}
                          </strong>{" "}
                          {dag}
                        </div>
                        <div>
                          <strong className="text-slate-700">
                            {lang === LANGS.BN ? "জমির ধরন:" : "Land Type:"}
                          </strong>{" "}
                          {landType}
                        </div>
                        <div>
                          <strong className="text-slate-700">
                            {lang === LANGS.BN ? "জমির আয়তন:" : "Land Area:"}
                          </strong>{" "}
                          {area}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={statusStyle(m.status)}>
                          {t("status")}: {m.status || "—"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {lang === LANGS.BN ? "আবেদন:" : "Applied:"}{" "}
                          {formatDateTime(m.created_at)}
                        </span>
                        {docsCount > 0 && (
                          <span className="text-xs text-slate-500">
                            {lang === LANGS.BN ? "ডকুমেন্টস:" : "Documents:"}{" "}
                            {docsCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 sm:items-end">
                      <button
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors"
                        onClick={() => setSelectedMutationId(m.id)}
                      >
                        {lang === LANGS.BN ? "বিস্তারিত দেখুন" : "View Details"}
                      </button>

                      {m.status === "pending_payment" && (
                        <button
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          onClick={() => setSelectedMutationId(m.id)}
                        >
                          {lang === LANGS.BN ? "পেমেন্ট করুন" : "Pay"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination controls */}
          <div className="pt-2">
            {sortedMutations.length > visibleItems && (
              <button
                onClick={() => setVisibleItems((prev) => prev + 5)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors"
              >
                {t("showMore")}
              </button>
            )}
            {visibleItems > 3 && (
              <button
                onClick={() => setVisibleItems(3)}
                className="ml-2 px-3 py-1.5 rounded-lg bg-slate-600 text-white hover:bg-slate-700 transition-colors"
              >
                {t("showLess")}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MutationList;

/* ---------- Small presentational helpers ---------- */

const Header = ({ lang, t, onNew }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
      {t("mutations")}
    </h2>
    <button
      onClick={onNew}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow hover:from-blue-700 hover:to-indigo-700"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {lang === LANGS.BN ? "নতুন মিউটেশন আবেদন" : "Apply for Mutation"}
    </button>
  </div>
);

const EmptyState = ({ lang, onNew }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
    <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-blue-50 text-blue-700 grid place-items-center ring-1 ring-blue-100">
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-slate-900">
      {lang === LANGS.BN ? "কোনো মিউটেশন পাওয়া যায়নি" : "No mutations yet"}
    </h3>
    <p className="mt-1 text-sm text-slate-600">
      {lang === LANGS.BN
        ? "প্রথম আবেদনের জন্য নিচের বোতাম ক্লিক করুন।"
        : "Click below to submit your first application."}
    </p>
    <div className="mt-4">
      <button
        onClick={onNew}
        className="px-4 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700"
      >
        {lang === LANGS.BN ? "এখনই আবেদন করুন" : "Apply now"}
      </button>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="relative rounded-2xl border border-slate-200 bg-white p-4 overflow-hidden">
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-40 bg-slate-200 rounded" />
      <div className="h-3 w-72 bg-slate-200 rounded" />
      <div className="h-3 w-56 bg-slate-200 rounded" />
      <div className="flex gap-2">
        <div className="h-5 w-24 bg-slate-200 rounded-full" />
        <div className="h-5 w-20 bg-slate-200 rounded-full" />
      </div>
      <div className="flex justify-end">
        <div className="h-8 w-28 bg-slate-200 rounded-lg" />
      </div>
    </div>
  </div>
);
