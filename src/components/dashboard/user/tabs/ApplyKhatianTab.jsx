import { useState, useEffect } from "react";
import api from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";

const ApplyKhatianTab = ({ lang, t }) => {
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await api.get("/applications");
        setApplications(data);
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
      const response = await api.get(documentUrl, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const docType = appType === "khatian_request" ? "khatian" : "mouza_map";
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

  return (
    <div>
      <div>
        <button className="text-xl font-semibold text-gray-900">
          {t("yourSubmittedApps")}
        </button>
        {loadingApplications ? (
          <p>{t("loadingApplications")}</p>
        ) : applications.length === 0 ? (
          <p className="mt-4">
            {t("noApplications")}{" "}
            <span>
              <a
                href="/land"
                rel="noopener noreferrer"
                className="text-red-500 rounded-md border px-3 py-1 hover:bg-gray-300"
              >
                {t("startNewApplication")}
                <br />
              </a>
            </span>
          </p>
        ) : (
          <div className="space-y-4">
            <div className="text-end">
              <a
                href="/land"
                rel="noopener noreferrer"
                className="text-green-500 rounded-md border px-4 py-1 hover:bg-gray-300"
              >
                {t("startNewApplication")}
              </a>{" "}
              <a
                href="/dashboard?tab=payments"
                rel="noopener noreferrer"
                className="text-blue-500 rounded-md border px-4 py-1 hover:bg-gray-300"
              >
                {t("paymentStatus")}
              </a>
            </div>

            {applications.map((app) => (
              <div
                key={app.id}
                className="border rounded p-4 flex justify-between items-center"
              >
                <div>
                  <p>
                    <strong>{t("typeLabel")}:</strong> {app.type}
                  </p>
                  <p>
                    <strong>{t("descriptionLabel")}:</strong>{" "}
                    {app.description || "N/A"}
                  </p>

                  <div className="flex">
                    <strong>{t("paymentStatus")}:</strong>&nbsp;
                    <span className="uppercase font-semibold text-green-600">
                      {app.payment_status}
                    </span>
                  </div>

                  <br />

                  <p className="text-red-500 text-xs">
                    <strong>N.B.</strong>: {t("nbNote")}
                  </p>
                </div>
                <div>
                  {app.payment_status === "paid" ? (
                    app.type === "khatian_request" ? (
                      app.dag && app.dag.document_url ? (
                        <button
                          onClick={() =>
                            handleDownloadDocument(
                              app.dag.document_url,
                              app.id,
                              app.type
                            )
                          }
                          className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                        >
                          {t("downloadKhatian")}
                        </button>
                      ) : (
                        <p>{t("noDocument")}</p>
                      )
                    ) : app.type === "mouza_map_request" ? (
                      app.mouza_map && app.mouza_map.document_url ? (
                        <button
                          onClick={() =>
                            handleDownloadDocument(
                              app.mouza_map.document_url,
                              app.id,
                              app.type
                            )
                          }
                          className="px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700"
                        >
                          {t("downloadMouzaMap")}
                        </button>
                      ) : (
                        <p>{t("noDocument")}</p>
                      )
                    ) : (
                      <p>{t("noDocument")}</p>
                    )
                  ) : (
                    <p className="text-red-600 font-semibold">
                      {t("payFirst")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t("applyForKhatian")}
        </h2>
        <div className="space-y-3">
          <p className="text-gray-600">{t("startNewNote")}</p>
          <div className="flex gap-3">
            <a
              href="/land"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-md border"
            >
              {t("startNewApplication")}
              <br />
            </a>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ApplyKhatianTab;
