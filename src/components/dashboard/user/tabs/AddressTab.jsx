import { useState, useEffect } from "react";
import { useAuth } from "../../../../auth/AuthContext";
import api from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";

const AddressTab = ({ lang, t, user }) => {
  const { updateUser } = useAuth();
  const [permanentAddress, setPermanentAddress] = useState({
    address_line_1: "",
    address_line_2: "",
    city: "",
    postal_code: "",
    country: "",
  });
  const [mailingAddress, setMailingAddress] = useState({
    address_line_1: "",
    address_line_2: "",
    city: "",
    postal_code: "",
    country: "",
  });
  const [isEditingPermanent, setIsEditingPermanent] = useState(false);
  const [isEditingMailing, setIsEditingMailing] = useState(false);
  const [districts, setDistricts] = useState([]);

  // Load user data into addresses
  useEffect(() => {
    if (user) {
      setPermanentAddress(
        user.permanent_address || {
          address_line_1: "",
          address_line_2: "",
          city: "",
          postal_code: "",
          country: lang === LANGS.BN ? "বাংলাদেশ" : "Bangladesh",
        }
      );
      setMailingAddress(
        user.mailing_address || {
          address_line_1: "",
          address_line_2: "",
          city: "",
          postal_code: "",
          country: lang === LANGS.BN ? "বাংলাদেশ" : "Bangladesh",
        }
      );
    }
  }, [user, lang]);

  // Fetch districts
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const { data } = await api.get("/locations/districts");
        setDistricts(data);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };
    fetchDistricts();
  }, []);

  const handleSavePermanent = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/me", {
        permanent_address: permanentAddress,
      });
      updateUser(data.user);
      setIsEditingPermanent(false);
    } catch (error) {
      console.error("Error updating permanent address:", error);
    }
  };

  const handleSaveMailing = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/me", {
        mailing_address: mailingAddress,
      });
      updateUser(data.user);
      setIsEditingMailing(false);
    } catch (error) {
      console.error("Error updating mailing address:", error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t("addressInformation")}
      </h2>

      <div className="space-y-6">
        {/* Permanent Address */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("permanentAddress")}
          </h3>
          {isEditingPermanent ? (
            <form onSubmit={handleSavePermanent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("addressLine1")}
                </label>
                <input
                  type="text"
                  value={permanentAddress.address_line_1}
                  onChange={(e) =>
                    setPermanentAddress({
                      ...permanentAddress,
                      address_line_1: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("addressLine2")}
                </label>
                <input
                  type="text"
                  value={permanentAddress.address_line_2}
                  onChange={(e) =>
                    setPermanentAddress({
                      ...permanentAddress,
                      address_line_2: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("city")}
                  </label>
                  <select
                    value={permanentAddress.city}
                    onChange={(e) =>
                      setPermanentAddress({
                        ...permanentAddress,
                        city: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">{t("selectDistrict")}</option>
                    {districts.map((district) => (
                      <option
                        key={district.id}
                        value={
                          lang === LANGS.BN
                            ? district.name_bn
                            : district.name_en
                        }
                      >
                        {lang === LANGS.BN
                          ? district.name_bn
                          : district.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("postalCode")}
                  </label>
                  <input
                    type="text"
                    value={permanentAddress.postal_code}
                    onChange={(e) =>
                      setPermanentAddress({
                        ...permanentAddress,
                        postal_code: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("country")}
                  </label>
                  <input
                    type="text"
                    value={permanentAddress.country}
                    onChange={(e) =>
                      setPermanentAddress({
                        ...permanentAddress,
                        country: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
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
                  onClick={() => setIsEditingPermanent(false)}
                  className="px-4 py-2 rounded-md border"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="space-y-2">
                <p className="text-sm text-gray-900">
                  {permanentAddress.address_line_1}
                </p>
                {permanentAddress.address_line_2 && (
                  <p className="text-sm text-gray-900">
                    {permanentAddress.address_line_2}
                  </p>
                )}
                <p className="text-sm text-gray-900">
                  {permanentAddress.city}, {permanentAddress.postal_code}
                </p>
                <p className="text-sm text-gray-900">
                  {permanentAddress.country}
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setIsEditingPermanent(true)}
                  className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {t("edit")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mailing Address */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("mailingAddress")}
          </h3>
          {isEditingMailing ? (
            <form onSubmit={handleSaveMailing} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("addressLine1")}
                </label>
                <input
                  type="text"
                  value={mailingAddress.address_line_1}
                  onChange={(e) =>
                    setMailingAddress({
                      ...mailingAddress,
                      address_line_1: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("addressLine2")}
                </label>
                <input
                  type="text"
                  value={mailingAddress.address_line_2}
                  onChange={(e) =>
                    setMailingAddress({
                      ...mailingAddress,
                      address_line_2: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("city")}
                  </label>
                  <select
                    value={mailingAddress.city}
                    onChange={(e) =>
                      setMailingAddress({
                        ...mailingAddress,
                        city: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">{t("selectDistrict")}</option>
                    {districts.map((district) => (
                      <option
                        key={district.id}
                        value={
                          lang === LANGS.BN
                            ? district.name_bn
                            : district.name_en
                        }
                      >
                        {lang === LANGS.BN
                          ? district.name_bn
                          : district.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("postalCode")}
                  </label>
                  <input
                    type="text"
                    value={mailingAddress.postal_code}
                    onChange={(e) =>
                      setMailingAddress({
                        ...mailingAddress,
                        postal_code: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("country")}
                  </label>
                  <input
                    type="text"
                    value={mailingAddress.country}
                    onChange={(e) =>
                      setMailingAddress({
                        ...mailingAddress,
                        country: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
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
                  onClick={() => setIsEditingMailing(false)}
                  className="px-4 py-2 rounded-md border"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="space-y-2">
                <p className="text-sm text-gray-900">
                  {mailingAddress.address_line_1}
                </p>
                {mailingAddress.address_line_2 && (
                  <p className="text-sm text-gray-900">
                    {mailingAddress.address_line_2}
                  </p>
                )}
                <p className="text-sm text-gray-900">
                  {mailingAddress.city}, {mailingAddress.postal_code}
                </p>
                <p className="text-sm text-gray-900">
                  {mailingAddress.country}
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setIsEditingMailing(true)}
                  className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {t("edit")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressTab;
