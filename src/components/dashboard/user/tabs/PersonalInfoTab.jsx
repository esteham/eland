import { useState, useEffect } from "react";
import { useAuth } from "../../../../auth/AuthContext";
import api from "../../../../api";

const PersonalInfoTab = ({ t, user }) => {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  // Load user data into form
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/me", formData);
      updateUser(data.user);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return isEditing ? (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t("editProfileInformation")}
      </h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("fullName")}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("emailAddress")}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("phoneNumber")}
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t("saveChanges")}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 rounded-md border"
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    </div>
  ) : (
    <div>
      <h1 className="text-xl font-bold text-gray-1000 mb-6">
        {t("profileInformation")}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-l font-medium text-gray-700">
              {t("fullName")}
            </label>
            <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
          </div>
          <div>
            <label className="block text-l font-medium text-gray-700">
              {t("emailAddress")}
            </label>
            <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-l font-medium text-gray-700">
              {t("phoneNumber")}
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {user?.phone || t("notProvided")}
            </p>
          </div>
          <div>
            <label className="block text-l font-medium text-gray-700">
              {t("role")}
            </label>
            <p className="mt-1 text-sm text-gray-900 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {t("edit")}
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
