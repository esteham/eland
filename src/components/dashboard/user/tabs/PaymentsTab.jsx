import { useState, useEffect } from "react";
import api from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";

const PaymentsTab = ({ lang, t }) => {
  const [activeTab, setActiveTab] = useState("applications");
  const [paymentsApplications, setPaymentsApplications] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [ldtPayments, setLdtPayments] = useState([]);
  const [loadingLdtPayments, setLoadingLdtPayments] = useState(false);
  const [visibleApps, setVisibleApps] = useState(3);
  const [visibleLdt, setVisibleLdt] = useState(3);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoadingPayments(true);
      try {
        const { data } = await api.get("/applications");
        setPaymentsApplications(data);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setPaymentsApplications([]);
      } finally {
        setLoadingPayments(false);
      }
    };
    fetchPayments();

    const fetchLdtPayments = async () => {
      setLoadingLdtPayments(true);
      try {
        const { data } = await api.get("/land-tax-payments");
        setLdtPayments(data);
      } catch (error) {
        console.error("Error fetching LDT payments:", error);
        setLdtPayments([]);
      } finally {
        setLoadingLdtPayments(false);
      }
    };
    fetchLdtPayments();
  }, []);

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
        lang === LANGS.BN
          ? "ইনভয়েস ডাউনলোড ব্যর্থ। আবার চেষ্টা করুন।"
          : "Failed to download invoice. Please try again."
      );
    }
  };

  if (loadingPayments || loadingLdtPayments) {
    return <p>{t("loading")}</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-5">
        {t("paymentsHeader")}
      </h2>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("applications")}
          className={`px-4 py-2 ${
            activeTab === "applications"
              ? "rounded-md bg-gray-600 text-white hover:bg-gray-700"
              : "text-gray-500"
          }`}
        >
          Application Payments
        </button>
        <button
          onClick={() => setActiveTab("ldt")}
          className={`px-4 py-2 ${
            activeTab === "ldt"
              ? "rounded-md bg-gray-600 text-white hover:bg-gray-700"
              : "text-gray-500"
          }`}
        >
          LDT Payment History
        </button>
      </div>

      {/* Application Payments Section */}
      {activeTab === "applications" && (
        <div>
          {paymentsApplications.length === 0 ? (
            <p className="text-gray-600">{t("noPayments")}</p>
          ) : (
            <div className="space-y-4">
              {paymentsApplications.slice(0, visibleApps).map((app) => (
                <div
                  key={app.id}
                  className="border rounded p-4 flex justify-between items-center"
                >
                  <div>
                    <p>
                      <strong>{t("typeLabel")}:</strong> {app.type}
                    </p>
                    <p>
                      <strong>{t("feeAmount")}:</strong> {app.fee_amount}
                    </p>
                    <p>
                      <strong>{t("paymentStatus")}:</strong>{" "}
                      <span className="uppercase font-semibold text-green-600">
                        {app.payment_status}
                      </span>
                    </p>
                  </div>
                  <div>
                    {app.payment_status === "paid" ? (
                      <button
                        onClick={() => handleDownloadInvoice(app.id)}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        {t("downloadInvoice")}
                      </button>
                    ) : (
                      <p className="text-red-600 font-semibold">
                        {t("paymentPending")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {paymentsApplications.length > visibleApps && (
                <button
                  onClick={() => setVisibleApps((prev) => prev + 10)}
                  className="px-2 py-1 rounded-md bg-gray-600 text-white hover:bg-gray-700"
                >
                  {t("showMore")}
                </button>
              )}
              {visibleApps > 3 && (
                <button
                  onClick={() => setVisibleApps(3)}
                  className="px-2 py-1 rounded-md bg-gray-600 text-white hover:bg-gray-700"
                >
                  {t("showLess")}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* LDT Payments Section */}
      {activeTab === "ldt" && (
        <div>
          {ldtPayments.length === 0 ? (
            <p className="text-gray-600">{t("noPayments")}</p>
          ) : (
            <div className="space-y-4">
              {ldtPayments.slice(0, visibleLdt).map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded p-4 flex justify-between items-center"
                >
                  <div className="flex-1">
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
                      {payment.land_tax_registration?.khatiyan_number}-
                      {payment.land_tax_registration?.dag_number}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDownloadLdtInvoice(payment.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {t("downloadInvoice")}
                    </button>
                  </div>
                </div>
              ))}
              {ldtPayments.length > visibleLdt && (
                <button
                  onClick={() => setVisibleLdt((prev) => prev + 10)}
                  className="px-2 py-1 rounded-md bg-gray-600 text-white hover:bg-gray-700"
                >
                  {t("showMore")}
                </button>
              )}
              {visibleLdt > 3 && (
                <button
                  onClick={() => setVisibleLdt(3)}
                  className="px-2 py-1 rounded-md bg-gray-600 text-white hover:bg-gray-700"
                >
                  {t("showLess")}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;
