import { useState } from "react";
import api from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";

const SecurityTab = ({ lang, t }) => {
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdErrors, setPwdErrors] = useState({});
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdErrors({});
    try {
      await api.post("/me/change-password", pwdForm);
      setPwdForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      setShowPwdForm(false);
      alert(
        lang === LANGS.BN
          ? "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে"
          : "Password updated successfully"
      );
    } catch (err) {
      setPwdErrors(err?.response?.data?.errors || {});
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t("securitySettings")}
      </h2>

      {!showPwdForm ? (
        <button
          className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowPwdForm(true)}
        >
          {t("changePassword")}
        </button>
      ) : (
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("currentPassword")}
            </label>
            <div className="relative">
              <input
                type={showCurrentPwd ? "text" : "password"}
                className="mt-1 block w-full border rounded-md px-3 py-2 pr-16"
                value={pwdForm.current_password}
                onChange={(e) =>
                  setPwdForm({
                    ...pwdForm,
                    current_password: e.target.value,
                  })
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                {showCurrentPwd ? t("hide") : t("show")}
              </button>
            </div>
            {pwdErrors.current_password && (
              <p className="text-sm text-red-600 mt-1">
                {pwdErrors.current_password[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("newPassword")}
            </label>
            <div className="relative">
              <input
                type={showNewPwd ? "text" : "password"}
                className="mt-1 block w-full border rounded-md px-3 py-2 pr-16"
                value={pwdForm.password}
                onChange={(e) =>
                  setPwdForm({ ...pwdForm, password: e.target.value })
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPwd(!showNewPwd)}
                className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                {showNewPwd ? t("hide") : t("show")}
              </button>
            </div>
            {pwdErrors.password && (
              <p className="text-sm text-red-600 mt-1">
                {pwdErrors.password[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("confirmNewPassword")}
            </label>
            <div className="relative">
              <input
                type={showConfirmPwd ? "text" : "password"}
                className="mt-1 block w-full border rounded-md px-3 py-2 pr-16"
                value={pwdForm.password_confirmation}
                onChange={(e) =>
                  setPwdForm({
                    ...pwdForm,
                    password_confirmation: e.target.value,
                  })
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                {showConfirmPwd ? t("hide") : t("show")}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
            >
              {pwdLoading ? t("saving") : t("savePassword")}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPwdForm(false);
                setPwdErrors({});
                setPwdForm({
                  current_password: "",
                  password: "",
                  password_confirmation: "",
                });
                setShowCurrentPwd(false);
                setShowNewPwd(false);
                setShowConfirmPwd(false);
              }}
              className="px-4 py-2 rounded-md border"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 space-x-2">
        <button className="px-4 py-2 rounded-md border">
          {t("enable2FA")}
        </button>
      </div>
    </div>
  );
};

export default SecurityTab;
