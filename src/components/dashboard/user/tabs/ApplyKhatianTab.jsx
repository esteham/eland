import { useState, useEffect, useMemo } from "react";
import api from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";

const ApplyKhatianTab = ({ lang, t }) => {
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await api.get("/applications");
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoadingApplications(false);
      }
    };
    fetchApplications();
  }, []);

  const handleDownloadDocument = async (documentUrl, appId, appType) => {
    try {
      const response = await api.get(documentUrl, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      const docType = appType === "khatian_request" ? "khatian" : "mouza_map";
      link.href = url;
      link.setAttribute("download", `${docType}_application_${appId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert(
        lang === LANGS.BN
          ? "ডকুমেন্ট ডাউনলোড ব্যর্থ। আবার চেষ্টা করুন।"
          : "Failed to download document. Please try again."
      );
    }
  };

  // ---- UI helpers ----
  const typeBadge = (status) => {
    const map = {
      paid: "bg-green-50 text-green-700 ring-green-200",
      pending: "bg-yellow-50 text-yellow-700 ring-yellow-200",
      failed: "bg-red-50 text-red-700 ring-red-200",
    };
    return `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${
      map[status] || "bg-slate-50 text-slate-700 ring-slate-200"
    }`;
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

  // Newest first; prefer created_at then id
  const sortedApps = useMemo(() => {
    const copy = [...applications];
    copy.sort((a, b) => {
      const ta = a?.created_at ? +new Date(a.created_at) : Number(a?.id) || 0;
      const tb = b?.created_at ? +new Date(b.created_at) : Number(b?.id) || 0;
      return tb - ta;
    });
    return copy;
  }, [applications]);

  const latestId = sortedApps[0]?.id;

  // ---- Loading / Empty ----
  if (loadingApplications) {
    return (
      <div>
        <Header t={t} />
        <div className="mt-4 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (sortedApps.length === 0) {
    return (
      <div>
        <Header t={t} />
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-700">{t("noApplications")}</p>
          <a
            href="/land"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {t("startNewApplication")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header t={t} />
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <a
          href="/land"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
        >
          {t("startNewApplication")}
        </a>
        <a
          href="/dashboard?tab=payments"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-900"
        >
          {t("paymentStatus")}
        </a>
      </div>

      <div className="mt-4 space-y-3">
        {sortedApps.map((app) => {
          const isLatest = app.id === latestId;
          const isPaid = app.payment_status === "paid";
          const hasKhatian =
            app.type === "khatian_request" && app.dag?.document_url;
          const hasMouza =
            app.type === "mouza_map_request" && app.mouza_map?.document_url;

          return (
            <div
              key={app.id}
              className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* top accent bar */}
              <div className=" inset-x-0 top-0 h-1  from-blue-600 via-indigo-600 to-purple-600 opacity-70" />

              {/* NEW badge */}
              {isLatest && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-600/10 px-2 py-0.5 text-[11px] font-bold uppercase text-red-700 ring-1 ring-red-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                  New
                </span>
              )}

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    {t("typeLabel")}:{" "}
                    <span className="font-medium text-slate-700">
                      {app.type}
                    </span>
                  </h3>

                  {app.description && (
                    <div className="flex mt-2">
                      <p className="text-sm font-semibold text-slate-700">
                        {t("descriptionLabel")}:{" "}
                      </p>
                      <sapn className="text-sm text-slate-600">
                        &nbsp;{app.description}
                      </sapn>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center mt-3 gap-2 text-sm">
                    <span className={typeBadge(app.payment_status)}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current/70" />
                      {t("paymentStatus")}: {app.payment_status}
                    </span>
                    {app.created_at && (
                      <span className="text-xs text-slate-500">
                        {formatDateTime(app.created_at)}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-red-600">
                    <strong>N.B.</strong>: {t("nbNote")}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  {isPaid ? (
                    app.type === "khatian_request" ? (
                      hasKhatian ? (
                        <button
                          onClick={() =>
                            handleDownloadDocument(
                              app.dag.document_url,
                              app.id,
                              app.type
                            )
                          }
                          className="text-sm rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                          {t("downloadKhatian")}
                        </button>
                      ) : (
                        <span className="text-sm text-slate-500">
                          {t("noDocument")}
                        </span>
                      )
                    ) : app.type === "mouza_map_request" ? (
                      hasMouza ? (
                        <button
                          onClick={() =>
                            handleDownloadDocument(
                              app.mouza_map.document_url,
                              app.id,
                              app.type
                            )
                          }
                          className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                          {t("downloadMouzaMap")}
                        </button>
                      ) : (
                        <span className="text-sm text-slate-500">
                          {t("noDocument")}
                        </span>
                      )
                    ) : (
                      <span className="text-sm text-slate-500">
                        {t("noDocument")}
                      </span>
                    )
                  ) : (
                    <span className="text-sm font-semibold text-red-600">
                      {t("payFirst")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplyKhatianTab;

/* ---------- Small UI pieces ---------- */
const Header = ({ t }) => (
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
      {t("yourSubmittedApps")}
    </h2>
  </div>
);

const SkeletonCard = () => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
    <div className="absolute inset-x-0 top-0 h-1 bg-slate-200" />
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-40 bg-slate-200 rounded" />
      <div className="h-3 w-72 bg-slate-200 rounded" />
      <div className="h-3 w-56 bg-slate-200 rounded" />
      <div className="flex gap-2">
        <div className="h-5 w-28 bg-slate-200 rounded-full" />
        <div className="h-5 w-24 bg-slate-200 rounded-full" />
      </div>
      <div className="flex justify-end">
        <div className="h-8 w-32 bg-slate-200 rounded-lg" />
      </div>
    </div>
  </div>
);
