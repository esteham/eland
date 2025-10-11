import { useState, useEffect } from "react";
import api from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";

const ProfileKYCTab = ({ lang, t, user }) => {
  const [kycData, setKycData] = useState(null);
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [uploadingKyc, setUploadingKyc] = useState(false);
  const [kycErrors, setKycErrors] = useState({});
  const [showKycForm, setShowKycForm] = useState(false);

  useEffect(() => {
    let intervalId;
    const fetchKyc = async () => {
      try {
        const { data } = await api.get("/user/kyc");
        setKycData(data.kyc);
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Error fetching KYC:", err);
        }
        setKycData(null);
      }
    };
    fetchKyc();
    intervalId = setInterval(fetchKyc, 10000);

    return () => intervalId && clearInterval(intervalId);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t("profileKycHeader")}
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between border rounded p-3">
          <div>
            <div className="font-medium">{t("email")}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          {user?.email_verified_at ? (
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {t("emailVerified")}
            </div>
          ) : (
            <button className="px-3 py-1 rounded border">
              {t("sendVerification")}
            </button>
          )}
        </div>
        <div className="flex items-center justify-between border rounded p-3">
          <div>
            <div className="font-medium">{t("phone")}</div>
            <div className="text-xs text-gray-500">
              {user?.phone || t("notProvided")}
            </div>
          </div>
          <button className="px-3 py-1 rounded border">{t("sendOtp")}</button>
        </div>

        {/* KYC Upload Section */}
        <div className="flex items-center justify-between border rounded p-4">
          <div className="font-medium mb-2">{t("nid")}</div>
          <div className="text-xs text-gray-500">
            {kycData?.status === "success" ? (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("kycUpdated")} (Status: {kycData.status})
              </div>
            ) : kycData?.status === "pending" ? (
              <div className="flex items-center gap-2 text-yellow-600 font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("kycPending")} (Status: {kycData.status})
              </div>
            ) : (
              <>
                {!showKycForm ? (
                  <button
                    onClick={() => setShowKycForm(true)}
                    className="px-4 py-2 rounded-md text-black font-bold bg-red-500 hover:bg-blue-700"
                  >
                    {t("kycUpdate")}
                  </button>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setUploadingKyc(true);
                      setKycErrors({});
                      const formData = new FormData();
                      if (idFront) formData.append("id_front", idFront);
                      if (idBack) formData.append("id_back", idBack);
                      try {
                        const { data } = await api.post(
                          "/user/kyc/upload",
                          formData,
                          {
                            headers: {
                              "Content-Type": "multipart/form-data",
                            },
                          }
                        );
                        setKycData(data.kyc);
                        alert(
                          lang === LANGS.BN
                            ? "কেওয়াইসি ডকুমেন্ট সফলভাবে আপলোড হয়েছে, কর্তৃপক্ষ আপনার রেজিস্ট্রেশন পর্যালোচনা করবেন এবং ৭ কার্যদিবসের মধ্যে অনুমোদন বা বাতিলের সিদ্ধান্ত জানাবেন। আপনার KYC আপডেট করার জন্য ধন্যবাদ।"
                            : "KYC documents uploaded successfully, The authority will review your registration and approve or reject it within 7 working days. Thank you for update your KYC."
                        );
                        setIdFront(null);
                        setIdBack(null);
                        setShowKycForm(false);
                      } catch (err) {
                        setKycErrors(err?.response?.data?.errors || {});
                      } finally {
                        setUploadingKyc(false);
                      }
                    }}
                  >
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("idFront")}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setIdFront(e.target.files[0])}
                        className="mt-1 block w-full"
                        required
                        disabled={kycData?.status === "success"}
                      />
                      {kycErrors.id_front && (
                        <p className="text-sm text-red-600 mt-1">
                          {kycErrors.id_front[0]}
                        </p>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("idBack")}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setIdBack(e.target.files[0])}
                        className="mt-1 block w-full"
                        required
                        disabled={kycData?.status === "success"}
                      />
                      {kycErrors.id_back && (
                        <p className="text-sm text-red-600 mt-1">
                          {kycErrors.id_back[0]}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={uploadingKyc || kycData?.status === "success"}
                      className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                    >
                      {uploadingKyc ? t("uploading") : t("upload")}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
          {kycData && kycData.status === "rejected" && (
            <div className="mt-4 text-sm text-red-600">
              {t("reason")}: {kycData.rejection_reason}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileKYCTab;
