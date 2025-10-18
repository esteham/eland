// src/components/MutationForm.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // ⬅️ for redirect
import {
  createMutation,
  uploadMutationDocuments,
  payMutation,
  getDivisions,
  getDistricts,
  getUpazilas,
  getMouzas,
} from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";

// Fees
const APPLICATION_FEE = 25; // BDT
const MUTATION_FEES = {
  agricultural: 1000, // BDT
  "non-agricultural": 1200, // BDT
};

// Clean initial state (easy reset)
const INITIAL_FORM = {
  application_id: "",
  mutation_type: "",
  reason: "",
  fee_amount: "",
  documents: {
    khatian: [],
    deed: [],
    buyer_nid: [],
    previous_owner_nid: [],
  },
  division_id: "",
  district_id: "",
  upazila_id: "",
  mouza_id: "",
  mouza_name: "",
  khatian_number: "",
  dag_number: "",
  buyer_name: "",
  buyer_nid: "",
  buyer_address: "",
  previous_owner_name: "",
  previous_owner_nid: "",
  previous_owner_address: "",
  deed_number: "",
  deed_date: "",
  registry_office: "",
  land_type: "",
  contact_number: "",
};

const MutationForm = ({
  lang,
  onSuccess,
  onBack,
  redirectTo = "/dashboard?tab=mutations",
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false); // network in-flight
  const [submitting, setSubmitting] = useState(false); // brief spinner after payment before success modal
  const [errors, setErrors] = useState({});

  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");

  // ⚠️ UI-only fields (never send PIN/CVV to backend)
  const [paymentFields, setPaymentFields] = useState({
    mobileNumber: "",
    pin: "",
    accountNumber: "",
    branch: "",
    passcode: "",
    cardNumber: "",
    cvv: "",
    expiryDate: "",
    cardPin: "",
  });

  // Dropdown data
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [mouzas, setMouzas] = useState([]);

  // ref for native validation
  const formRef = useRef(null);

  // Helpers
  const getName = (arr, id) => {
    const found = arr.find((x) => String(x.id) === String(id));
    return found ? found.name_bn || found.name_en || "" : "";
  };

  // ------------ Loaders for geo dropdowns -------------
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getDivisions();
        setDivisions(data || []);
      } catch (e) {
        console.error("Error fetching divisions:", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!formData.division_id) {
      setDistricts([]);
      setUpazilas([]);
      setMouzas([]);
      return;
    }
    (async () => {
      try {
        const { data } = await getDistricts(formData.division_id);
        setDistricts(data || []);
        setUpazilas([]);
        setMouzas([]);
        setFormData((p) => ({
          ...p,
          district_id: "",
          upazila_id: "",
          mouza_id: "",
        }));
      } catch (e) {
        console.error("Error fetching districts:", e);
      }
    })();
  }, [formData.division_id]);

  useEffect(() => {
    if (!formData.district_id) {
      setUpazilas([]);
      setMouzas([]);
      return;
    }
    (async () => {
      try {
        const { data } = await getUpazilas(formData.district_id);
        setUpazilas(data || []);
        setMouzas([]);
        setFormData((p) => ({ ...p, upazila_id: "", mouza_id: "" }));
      } catch (e) {
        console.error("Error fetching upazilas:", e);
      }
    })();
  }, [formData.district_id]);

  useEffect(() => {
    if (!formData.upazila_id) {
      setMouzas([]);
      return;
    }
    (async () => {
      try {
        const { data } = await getMouzas(formData.upazila_id);
        setMouzas(data || []);
        setFormData((p) => ({ ...p, mouza_id: "", mouza_name: "" }));
      } catch (e) {
        console.error("Error fetching mouzas:", e);
      }
    })();
  }, [formData.upazila_id]);

  // ------------ Form handlers -------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "land_type" && value) {
        const mutationFee = MUTATION_FEES[value] || 0;
        updated.fee_amount = String(APPLICATION_FEE + mutationFee);
      }

      if (name === "mouza_id" && value) {
        const m = mouzas.find((x) => String(x.id) === String(value));
        updated.mouza_name = m ? m.name_bn || m.name_en || "" : "";
      }

      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading || submitting) return;

    // ensure browser validation passes before showing review
    if (formRef.current && !formRef.current.reportValidity()) return;

    // ensure fee is computed
    if (!formData.fee_amount && formData.land_type) {
      const mutationFee = MUTATION_FEES[formData.land_type] || 0;
      setFormData((p) => ({
        ...p,
        fee_amount: String(APPLICATION_FEE + mutationFee),
      }));
    }

    setShowReviewModal(true);
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setPaymentMethod("");
    setPaymentDone(false);
    setPaymentFields({
      mobileNumber: "",
      pin: "",
      accountNumber: "",
      branch: "",
      passcode: "",
      cardNumber: "",
      cvv: "",
      expiryDate: "",
      cardPin: "",
    });
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert(
        lang === LANGS.BN
          ? "পেমেন্ট মেথড নির্বাচন করুন"
          : "Please select a payment method"
      );
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Collect files
      const allDocuments = [
        ...formData.documents.khatian,
        ...formData.documents.deed,
        ...formData.documents.buyer_nid,
        ...formData.documents.previous_owner_nid,
      ];

      // Payload for create
      const mutationData = {
        application_id: formData.application_id || null,
        mutation_type: formData.mutation_type,
        reason: formData.reason,
        fee_amount: parseFloat(formData.fee_amount || 0),
        division_id: formData.division_id,
        district_id: formData.district_id,
        upazila_id: formData.upazila_id,
        mouza_id: formData.mouza_id,
        mouza_name: formData.mouza_name,
        khatian_number: formData.khatian_number,
        dag_number: formData.dag_number,
        buyer_name: formData.buyer_name,
        buyer_nid: formData.buyer_nid,
        buyer_address: formData.buyer_address,
        previous_owner_name: formData.previous_owner_name,
        previous_owner_nid: formData.previous_owner_nid,
        previous_owner_address: formData.previous_owner_address,
        deed_number: formData.deed_number,
        deed_date: formData.deed_date,
        registry_office: formData.registry_office,
        land_type: formData.land_type,
        contact_number: formData.contact_number,
        documents: [],
        payment_method: paymentMethod,
      };

      // 1) Create mutation row
      const { data: mutationResponse } = await createMutation(mutationData);
      const mutationId = mutationResponse?.mutation?.id;
      setTrackingNumber(mutationId);

      // 2) Only send a safe identifier (never send PIN/CVV)
      let payerIdentifier = "";
      if (paymentMethod === "bkash" || paymentMethod === "nagad") {
        payerIdentifier = paymentFields.mobileNumber;
      } else if (paymentMethod === "bank") {
        payerIdentifier = paymentFields.accountNumber;
      } else if (paymentMethod === "card") {
        payerIdentifier = paymentFields.cardNumber;
      }

      await payMutation(mutationId, {
        payment_method: paymentMethod,
        payer_identifier: payerIdentifier, // server should hash/store safely
        transaction_id: null,
        amount: parseFloat(formData.fee_amount || 0),
      });

      // 3) Upload docs (optional)
      if (allDocuments.length > 0) {
        const docFormData = new FormData();
        allDocuments.forEach((file) => {
          docFormData.append("documents[]", file);
        });
        await uploadMutationDocuments(mutationId, docFormData);
      }

      // Success UX:
      setPaymentDone(true);
      setShowPaymentModal(false);

      // brief submitting spinner, then success modal with message
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setShowSuccessModal(true);
      }, 700);
    } catch (error) {
      console.error("Payment or submission failed:", error);
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(
          lang === LANGS.BN
            ? "পেমেন্ট বা জমা ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
            : "Payment or submission failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessOk = () => {
    const toastMsg =
      lang === LANGS.BN
        ? "পেমেন্ট সফল ও আবেদন জমা হয়েছে"
        : "Payment successful & application submitted";
    resetForm();
    if (onSuccess) onSuccess();
    navigate(redirectTo, {
      replace: true,
      state: { toast: toastMsg },
    });
  };

  // Review rows helper
  const Row = ({ label, value }) => (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="mx-auto bg-white p-6 rounded-lg shadow-xl">
      {/* Submitting overlay */}
      {submitting && (
        <div className="fixed inset-0 z-[999] grid place-items-center bg-black/40">
          <div className="rounded-xl bg-white px-6 py-4 shadow-lg text-center">
            <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p className="text-gray-700 font-medium">
              {lang === LANGS.BN
                ? "জমা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন..."
                : "Submitting, please wait..."}
            </p>
          </div>
        </div>
      )}
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold mb-4">
          {lang === LANGS.BN
            ? "নতুন মিউটেশন আবেদন"
            : "New Mutation Application"}
        </h2>
        <button
          onClick={onBack}
          className="mb-4  px-4 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          {lang === LANGS.BN ? "ফিরে যান" : "Back"}
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Location Information */}
        <div className="bg-white p-5 rounded-xl shadow-xl/30 space-y-4">
          <h3 className="text-lg text-blue-600 font-medium mb-2">
            {lang === LANGS.BN ? "অবস্থান তথ্য" : "Location Information"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Division */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "বিভাগ" : "Division"}
              </label>
              <select
                name="division_id"
                value={formData.division_id}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              >
                <option value="">
                  {lang === LANGS.BN
                    ? "বিভাগ নির্বাচন করুন"
                    : "Select Division"}
                </option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name_bn || division.name_en}
                  </option>
                ))}
              </select>
              {errors.division_id && (
                <p className="text-red-500 text-sm">{errors.division_id[0]}</p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "জেলা" : "District"}
              </label>
              <select
                name="district_id"
                value={formData.district_id}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.division_id || loading}
              >
                <option value="">
                  {lang === LANGS.BN ? "জেলা নির্বাচন করুন" : "Select District"}
                </option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name_bn || district.name_en}
                  </option>
                ))}
              </select>
              {errors.district_id && (
                <p className="text-red-500 text-sm">{errors.district_id[0]}</p>
              )}
            </div>

            {/* Upazila */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "উপজেলা" : "Upazila"}
              </label>
              <select
                name="upazila_id"
                value={formData.upazila_id}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.district_id || loading}
              >
                <option value="">
                  {lang === LANGS.BN
                    ? "উপজেলা নির্বাচন করুন"
                    : "Select Upazila"}
                </option>
                {upazilas.map((upazila) => (
                  <option key={upazila.id} value={upazila.id}>
                    {upazila.name_bn || upazila.name_en}
                  </option>
                ))}
              </select>
              {errors.upazila_id && (
                <p className="text-red-500 text-sm">{errors.upazila_id[0]}</p>
              )}
            </div>

            {/* Mouza */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "মৌজা" : "Mouza"}
              </label>
              <select
                name="mouza_id"
                value={formData.mouza_id}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.upazila_id || loading}
              >
                <option value="">
                  {lang === LANGS.BN ? "মৌজা নির্বাচন করুন" : "Select Mouza"}
                </option>
                {mouzas.map((mouza) => (
                  <option key={mouza.id} value={mouza.id}>
                    {mouza.name_bn || mouza.name_en}
                  </option>
                ))}
              </select>
              {errors.mouza_id && (
                <p className="text-red-500 text-sm">{errors.mouza_id[0]}</p>
              )}
            </div>
          </div>

          {/* Land Info */}
          <h3 className="mt-4 text-lg text-blue-600 font-medium mb-2">
            {lang === LANGS.BN ? "জমির তথ্য" : "Land Information"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Khatian */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "খতিয়ান নম্বর" : "Khatian Number"}
              </label>
              <input
                type="text"
                name="khatian_number"
                value={formData.khatian_number}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
              {errors.khatian_number && (
                <p className="text-red-500 text-sm">
                  {errors.khatian_number[0]}
                </p>
              )}
            </div>

            {/* Dag */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "দাগ নম্বর" : "Dag Number"}
              </label>
              <input
                type="text"
                name="dag_number"
                value={formData.dag_number}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
              {errors.dag_number && (
                <p className="text-red-500 text-sm">{errors.dag_number[0]}</p>
              )}
            </div>
          </div>

          {/* Land Docs */}
          <h4 className="mt-4 text-md font-medium mb-2">
            {lang === LANGS.BN
              ? "জমির তথ্য ডকুমেন্টস"
              : "Land Information Documents"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Khatian file */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "খতিয়ান" : "Khatian"}
              </label>
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    documents: {
                      ...prev.documents,
                      khatian: Array.from(e.target.files || []),
                    },
                  }))
                }
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={loading}
              />
            </div>

            {/* Deed file */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "দলিল" : "Deed"}
              </label>
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    documents: {
                      ...prev.documents,
                      deed: Array.from(e.target.files || []),
                    },
                  }))
                }
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="bg-white p-5 rounded-xl shadow-xl/30 space-y-4">
          <h3 className="text-lg text-blue-600 font-medium mb-2">
            {lang === LANGS.BN
              ? "ক্রেতা/নতুন মালিকের তথ্য"
              : "Buyer/New Owner Information"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "নাম" : "Name"}
              </label>
              <input
                type="text"
                name="buyer_name"
                value={formData.buyer_name}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
              {errors.buyer_name && (
                <p className="text-red-500 text-sm">{errors.buyer_name[0]}</p>
              )}
            </div>

            {/* NID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "এনআইডি নম্বর" : "NID Number"}
              </label>
              <input
                type="text"
                name="buyer_nid"
                value={formData.buyer_nid}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
              {errors.buyer_nid && (
                <p className="text-red-500 text-sm">{errors.buyer_nid[0]}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "ঠিকানা" : "Address"}
              </label>
              <textarea
                name="buyer_address"
                value={formData.buyer_address}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                rows="2"
                required
                disabled={loading}
              />
              {errors.buyer_address && (
                <p className="text-red-500 text-sm">
                  {errors.buyer_address[0]}
                </p>
              )}
            </div>
          </div>

          <h4 className="text-md font-medium mb-2">
            {lang === LANGS.BN
              ? "ক্রেতা/নতুন মালিকের ডকুমেন্ট"
              : "Buyer/New Owner Documents"}
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {lang === LANGS.BN ? "এনআইডি কার্ড" : "NID Card"}
            </label>
            <input
              type="file"
              multiple
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  documents: {
                    ...prev.documents,
                    buyer_nid: Array.from(e.target.files || []),
                  },
                }))
              }
              className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={loading}
            />
          </div>
        </div>

        {/* Previous Owner */}
        <div className="bg-white p-5 rounded-xl shadow-xl/30 space-y-4">
          <h3 className="text-lg text-blue-600 font-medium mb-2">
            {lang === LANGS.BN
              ? "পূর্ববর্তী মালিকের তথ্য"
              : "Previous Owner Information"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "নাম" : "Name"}
              </label>
              <input
                type="text"
                name="previous_owner_name"
                value={formData.previous_owner_name}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
              {errors.previous_owner_name && (
                <p className="text-red-500 text-sm">
                  {errors.previous_owner_name[0]}
                </p>
              )}
            </div>

            {/* NID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "এনআইডি নম্বর" : "NID Number"}
              </label>
              <input
                type="text"
                name="previous_owner_nid"
                value={formData.previous_owner_nid}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
              {errors.previous_owner_nid && (
                <p className="text-red-500 text-sm">
                  {errors.previous_owner_nid[0]}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "ঠিকানা" : "Address"}
              </label>
              <textarea
                name="previous_owner_address"
                value={formData.previous_owner_address}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                rows="2"
                required
                disabled={loading}
              />
              {errors.previous_owner_address && (
                <p className="text-red-500 text-sm">
                  {errors.previous_owner_address[0]}
                </p>
              )}
            </div>
          </div>

          <h4 className="text-md font-medium mb-2">
            {lang === LANGS.BN
              ? "পূর্ববর্তী মালিকের ডকুমেন্ট"
              : "Previous Owner Documents"}
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {lang === LANGS.BN ? "এনআইডি কার্ড" : "NID Card"}
            </label>
            <input
              type="file"
              multiple
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  documents: {
                    ...prev.documents,
                    previous_owner_nid: Array.from(e.target.files || []),
                  },
                }))
              }
              className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={loading}
            />
          </div>
        </div>

        {/* Deed */}
        <div className="bg-white p-5 rounded-xl shadow-xl/30 space-y-4">
          <h3 className="text-lg text-blue-600 font-medium mb-2">
            {lang === LANGS.BN ? "জমির দলিল তথ্য" : "Land Deed Information"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Deed no */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "দলিল নম্বর" : "Deed Number"}
              </label>
              <input
                type="text"
                name="deed_number"
                value={formData.deed_number}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
              {errors.deed_number && (
                <p className="text-red-500 text-sm">{errors.deed_number[0]}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "তারিখ" : "Date"}
              </label>
              <input
                type="date"
                name="deed_date"
                value={formData.deed_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
              {errors.deed_date && (
                <p className="text-red-500 text-sm">{errors.deed_date[0]}</p>
              )}
            </div>

            {/* Registry office */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {lang === LANGS.BN ? "রেজিস্ট্রি অফিস" : "Registry Office"}
              </label>
              <input
                type="text"
                name="registry_office"
                value={formData.registry_office}
                onChange={handleInputChange}
                className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
              {errors.registry_office && (
                <p className="text-red-500 text-sm">
                  {errors.registry_office[0]}
                </p>
              )}
            </div>
          </div>

          {/* Land Type */}
          <h3 className="text-lg text-blue-600 font-medium mb-2">
            {lang === LANGS.BN ? "জমির ধরন" : "Type of Land"}
          </h3>
          <div>
            <select
              name="land_type"
              value={formData.land_type}
              onChange={handleInputChange}
              className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            >
              <option value="">
                {lang === LANGS.BN ? "ধরন নির্বাচন করুন" : "Select Type"}
              </option>
              <option value="agricultural">
                {lang === LANGS.BN ? "কৃষিজমি" : "Agricultural"}
              </option>
              <option value="non-agricultural">
                {lang === LANGS.BN ? "অকৃষিজমি" : "Non-agricultural"}
              </option>
            </select>
            {errors.land_type && (
              <p className="text-red-500 text-sm">{errors.land_type[0]}</p>
            )}
          </div>
        </div>

        {/* Contact + Mutation type + Reason */}
        <div className="bg-white p-5 rounded-xl shadow-xl/30 space-y-4">
          <h3 className="text-lg text-blue-600 font-medium mb-2">
            {lang === LANGS.BN ? "যোগাযোগ নম্বর" : "Contact Number"}
          </h3>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {lang === LANGS.BN ? "মোবাইল নম্বর" : "Mobile Number"}
            </label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            />
            {errors.contact_number && (
              <p className="text-red-500 text-sm">{errors.contact_number[0]}</p>
            )}
          </div>

          {/* Mutation Type */}
          <label className="block text-sm font-medium text-gray-700">
            {lang === LANGS.BN ? "মিউটেশনের ধরন" : "Mutation Type"}
          </label>
          <select
            name="mutation_type"
            value={formData.mutation_type}
            onChange={handleInputChange}
            className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
          >
            <option value="">
              {lang === LANGS.BN ? "ধরন নির্বাচন করুন" : "Select type"}
            </option>
            <option value="sale">
              {lang === LANGS.BN ? "বিক্রয়" : "Sale"}
            </option>
            <option value="inheritance">
              {lang === LANGS.BN ? "উত্তরাধিকার" : "Inheritance"}
            </option>
            <option value="gift">{lang === LANGS.BN ? "উপহার" : "Gift"}</option>
            <option value="partition">
              {lang === LANGS.BN ? "বিভাজন" : "Partition"}
            </option>
            <option value="decree">
              {lang === LANGS.BN ? "আদেশ" : "Decree"}
            </option>
          </select>
          {errors.mutation_type && (
            <p className="text-red-500 text-sm">{errors.mutation_type[0]}</p>
          )}

          {/* Reason */}
          <label className="block text-sm font-medium text-gray-700">
            {lang === LANGS.BN ? "কারণ" : "Reason"}
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            className="mt-1 block w-full border p-1 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            disabled={loading}
          />
          {errors.reason && (
            <p className="text-red-500 text-sm">{errors.reason[0]}</p>
          )}
        </div>

        {/* Fees Summary */}
        <div className="bg-white p-5 rounded-xl shadow-xl/30 space-y-4">
          <h3 className="text-lg text-blue-600 font-medium mb-2">
            {lang === LANGS.BN ? "ফি সারাংশ" : "Fees Summary"}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{lang === LANGS.BN ? "আবেদন ফি" : "Application Fee"}:</span>
              <span>{APPLICATION_FEE} BDT</span>
            </div>
            <div className="flex justify-between">
              <span>{lang === LANGS.BN ? "মিউটেশন ফি" : "Mutation Fee"}:</span>
              <span>
                {formData.land_type
                  ? MUTATION_FEES[formData.land_type] || 0
                  : 0}{" "}
                BDT
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>{lang === LANGS.BN ? "মোট" : "Total"}:</span>
              <span>{formData.fee_amount || 0} BDT</span>
            </div>
          </div>
        </div>

        {/* Submit → open Review Modal */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? lang === LANGS.BN
              ? "প্রসেস হচ্ছে..."
              : "Processing..."
            : lang === LANGS.BN
            ? "জমা দিন"
            : "Submit"}
        </button>
      </form>

      {/* Review Modal */}
      {showReviewModal && (
        <div
          className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm p-4 grid place-items-center animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/15 grid place-items-center ring-1 ring-white/20">
                <span className="text-xl">📝</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold tracking-tight">
                  {lang === LANGS.BN
                    ? "জমা দেওয়ার আগে তথ্য যাচাই করুন"
                    : "Review Your Application"}
                </h3>
                <p className="text-white/85 text-sm">
                  {lang === LANGS.BN
                    ? "সব তথ্য সঠিক হলে ‘Pay now’ চাপুন। ভুল থাকলে ‘Back to form’ চাপুন।"
                    : "If everything looks correct, click ‘Pay now’. Otherwise click ‘Back to form’ to edit."}
                </p>
              </div>

              {/* Close (optional) */}
              <button
                type="button"
                className="ml-2 shrink-0 rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                onClick={() => setShowReviewModal(false)}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path
                    d="M6 6l12 12M18 6l-12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Top summary strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {lang === LANGS.BN ? "মিউটেশন ধরন" : "Mutation Type"}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {formData.mutation_type || "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {lang === LANGS.BN ? "জমির ধরন" : "Land Type"}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {formData.land_type === "agricultural"
                      ? lang === LANGS.BN
                        ? "কৃষিজমি"
                        : "Agricultural"
                      : formData.land_type === "non-agricultural"
                      ? lang === LANGS.BN
                        ? "অকৃষিজমি"
                        : "Non-agricultural"
                      : "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {lang === LANGS.BN ? "মোট ফি" : "Total Fee"}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {formData.fee_amount || 0} BDT
                    </span>
                    <span className="text-xs text-slate-500">
                      ({lang === LANGS.BN ? "আবেদন" : "Application"}{" "}
                      {APPLICATION_FEE} +{" "}
                      {lang === LANGS.BN ? "মিউটেশন" : "Mutation"}{" "}
                      {formData.land_type
                        ? MUTATION_FEES[formData.land_type] || 0
                        : 0}
                      )
                    </span>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location */}
                <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <h4 className="mb-3 font-medium text-slate-900 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-md bg-blue-50 text-blue-700 grid place-items-center ring-1 ring-blue-100">
                      🌐
                    </span>
                    {lang === LANGS.BN ? "অবস্থান" : "Location"}
                  </h4>
                  <div className="space-y-1">
                    <Row
                      label={lang === LANGS.BN ? "বিভাগ" : "Division"}
                      value={getName(divisions, formData.division_id)}
                    />
                    <Row
                      label={lang === LANGS.BN ? "জেলা" : "District"}
                      value={getName(districts, formData.district_id)}
                    />
                    <Row
                      label={lang === LANGS.BN ? "উপজেলা" : "Upazila"}
                      value={getName(upazilas, formData.upazila_id)}
                    />
                    <Row
                      label={lang === LANGS.BN ? "মৌজা" : "Mouza"}
                      value={getName(mouzas, formData.mouza_id)}
                    />
                  </div>
                </section>

                {/* Land Info */}
                <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <h4 className="mb-3 font-medium text-slate-900 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-md bg-blue-50 text-blue-700 grid place-items-center ring-1 ring-blue-100">
                      📄
                    </span>
                    {lang === LANGS.BN ? "জমির তথ্য" : "Land Info"}
                  </h4>
                  <div className="space-y-1">
                    <Row
                      label={
                        lang === LANGS.BN ? "খতিয়ান নম্বর" : "Khatian No."
                      }
                      value={formData.khatian_number}
                    />
                    <Row
                      label={lang === LANGS.BN ? "দাগ নম্বর" : "Dag No."}
                      value={formData.dag_number}
                    />
                    <Row
                      label={
                        lang === LANGS.BN ? "খতিয়ান ফাইল" : "Khatian file(s)"
                      }
                      value={`${formData.documents.khatian.length} file(s)`}
                    />
                  </div>
                </section>

                {/* Buyer */}
                <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <h4 className="mb-3 font-medium text-slate-900 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-md bg-blue-50 text-blue-700 grid place-items-center ring-1 ring-blue-100">
                      👤
                    </span>
                    {lang === LANGS.BN
                      ? "ক্রেতা/নতুন মালিক"
                      : "Buyer/New Owner"}
                  </h4>
                  <div className="space-y-1">
                    <Row
                      label={lang === LANGS.BN ? "নাম" : "Name"}
                      value={formData.buyer_name}
                    />
                    <Row
                      label={lang === LANGS.BN ? "এনআইডি" : "NID"}
                      value={formData.buyer_nid}
                    />
                    <Row
                      label={lang === LANGS.BN ? "ঠিকানা" : "Address"}
                      value={formData.buyer_address}
                    />
                    <Row
                      label={
                        lang === LANGS.BN ? "ডকুমেন্ট (ফাইল)" : "Docs (files)"
                      }
                      value={`${formData.documents.buyer_nid.length} file(s)`}
                    />
                  </div>
                </section>

                {/* Previous Owner */}
                <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <h4 className="mb-3 font-medium text-slate-900 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-md bg-blue-50 text-blue-700 grid place-items-center ring-1 ring-blue-100">
                      🧾
                    </span>
                    {lang === LANGS.BN ? "পূর্ববর্তী মালিক" : "Previous Owner"}
                  </h4>
                  <div className="space-y-1">
                    <Row
                      label={lang === LANGS.BN ? "নাম" : "Name"}
                      value={formData.previous_owner_name}
                    />
                    <Row
                      label={lang === LANGS.BN ? "এনআইডি" : "NID"}
                      value={formData.previous_owner_nid}
                    />
                    <Row
                      label={lang === LANGS.BN ? "ঠিকানা" : "Address"}
                      value={formData.previous_owner_address}
                    />
                    <Row
                      label={
                        lang === LANGS.BN ? "ডকুমেন্ট (ফাইল)" : "Docs (files)"
                      }
                      value={`${formData.documents.previous_owner_nid.length} file(s)`}
                    />
                  </div>
                </section>

                {/* Deed */}
                <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:col-span-2">
                  <h4 className="mb-3 font-medium text-slate-900 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-md bg-blue-50 text-blue-700 grid place-items-center ring-1 ring-blue-100">
                      🏛️
                    </span>
                    {lang === LANGS.BN ? "দলিল" : "Deed"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Row
                      label={lang === LANGS.BN ? "দলিল নম্বর" : "Deed No."}
                      value={formData.deed_number}
                    />
                    <Row
                      label={lang === LANGS.BN ? "তারিখ" : "Date"}
                      value={formData.deed_date}
                    />
                    <Row
                      label={
                        lang === LANGS.BN
                          ? "রেজিস্ট্রি অফিস"
                          : "Registry Office"
                      }
                      value={formData.registry_office}
                    />
                    <Row
                      label={lang === LANGS.BN ? "দলিল ফাইল" : "Deed file(s)"}
                      value={`${formData.documents.deed.length} file(s)`}
                    />
                  </div>
                </section>

                {/* Mutation/Contact */}
                <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:col-span-2">
                  <h4 className="mb-3 font-medium text-slate-900 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-md bg-blue-50 text-blue-700 grid place-items-center ring-1 ring-blue-100">
                      ☎️
                    </span>
                    {lang === LANGS.BN ? "মিউটেশন/যোগাযোগ" : "Mutation/Contact"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Row
                      label={lang === LANGS.BN ? "কারণ" : "Reason"}
                      value={formData.reason}
                    />
                    <Row
                      label={lang === LANGS.BN ? "মোবাইল নম্বর" : "Mobile"}
                      value={formData.contact_number}
                    />
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 z-10 bg-white/90 backdrop-blur border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {lang === LANGS.BN ? "মোট পরিশোধ" : "Total Payable"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-900">
                    {formData.fee_amount || 0} BDT
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    onClick={() => setShowReviewModal(false)}
                  >
                    {lang === LANGS.BN ? "Back to form" : "Back to form"}
                  </button>
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 inline-flex items-center gap-2"
                    onClick={() => {
                      setShowReviewModal(false);
                      setShowPaymentModal(true);
                    }}
                  >
                    {lang === LANGS.BN ? "Pay now" : "Pay now"}
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                      <path
                        d="M5 12h14M13 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[950] bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 max-w-[95vw] shadow-lg rounded-md bg-white">
            <div className="mt-1 text-center">
              <h3 className="text-lg text-blue-600 font-medium">
                {lang === LANGS.BN ? "পেমেন্ট করুন" : "Make Payment"}
              </h3>
              <div className="mt-2 px-2 py-3">
                <p className="text-sm text-gray-500 mb-4">
                  {lang === LANGS.BN
                    ? "আবেদন জমা দিতে পেমেন্ট সম্পন্ন করুন।"
                    : "Complete payment to submit your application."}
                </p>

                {/* Method */}
                <div className="space-y-2 text-left">
                  <label className="block text-sm font-medium text-gray-700">
                    {lang === LANGS.BN ? "পেমেন্ট মেথড" : "Payment Method"}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setPaymentFields({
                        mobileNumber: "",
                        pin: "",
                        accountNumber: "",
                        branch: "",
                        passcode: "",
                        cardNumber: "",
                        cvv: "",
                        expiryDate: "",
                        cardPin: "",
                      });
                    }}
                    className="mt-1 block w-full border p-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading || submitting}
                    required
                  >
                    <option value="">
                      {lang === LANGS.BN
                        ? "মেথড নির্বাচন করুন"
                        : "Select Method"}
                    </option>
                    <option value="bkash">
                      {lang === LANGS.BN ? "বিকাশ" : "Bkash"}
                    </option>
                    <option value="nagad">
                      {lang === LANGS.BN ? "নগদ" : "Nagad"}
                    </option>
                    <option value="bank">
                      {lang === LANGS.BN
                        ? "ব্যাংক ট্রান্সফার"
                        : "Bank Transfer"}
                    </option>
                    <option value="card">
                      {lang === LANGS.BN ? "ক্রেডিট কার্ড" : "Credit Card"}
                    </option>
                  </select>
                </div>

                {/* Fields (UI only, do not send PIN/CVV to backend) */}
                {paymentMethod === "bkash" || paymentMethod === "nagad" ? (
                  <div className="space-y-2 text-left mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {lang === LANGS.BN ? "মোবাইল নম্বর" : "Mobile Number"}
                      </label>
                      <input
                        type="tel"
                        value={paymentFields.mobileNumber}
                        onChange={(e) =>
                          setPaymentFields((p) => ({
                            ...p,
                            mobileNumber: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading || submitting}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        PIN
                      </label>
                      <input
                        type="password"
                        value={paymentFields.pin}
                        onChange={(e) =>
                          setPaymentFields((p) => ({
                            ...p,
                            pin: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading || submitting}
                        required
                      />
                    </div>
                  </div>
                ) : paymentMethod === "bank" ? (
                  <div className="space-y-2 text-left mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {lang === LANGS.BN
                          ? "অ্যাকাউন্ট নম্বর"
                          : "Account Number"}
                      </label>
                      <input
                        type="text"
                        value={paymentFields.accountNumber}
                        onChange={(e) =>
                          setPaymentFields((p) => ({
                            ...p,
                            accountNumber: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading || submitting}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {lang === LANGS.BN ? "ব্রাঞ্চ" : "Branch"}
                      </label>
                      <input
                        type="text"
                        value={paymentFields.branch}
                        onChange={(e) =>
                          setPaymentFields((p) => ({
                            ...p,
                            branch: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading || submitting}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Passcode
                      </label>
                      <input
                        type="password"
                        value={paymentFields.passcode}
                        onChange={(e) =>
                          setPaymentFields((p) => ({
                            ...p,
                            passcode: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading || submitting}
                        required
                      />
                    </div>
                  </div>
                ) : paymentMethod === "card" ? (
                  <div className="space-y-2 text-left mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {lang === LANGS.BN ? "কার্ড নম্বর" : "Card Number"}
                      </label>
                      <input
                        type="text"
                        value={paymentFields.cardNumber}
                        onChange={(e) =>
                          setPaymentFields((p) => ({
                            ...p,
                            cardNumber: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading || submitting}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={paymentFields.cvv}
                        onChange={(e) =>
                          setPaymentFields((p) => ({
                            ...p,
                            cvv: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading || submitting}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {lang === LANGS.BN
                          ? "এক্সপায়ারি তারিখ"
                          : "Expiry Date"}
                      </label>
                      <input
                        type="month"
                        value={paymentFields.expiryDate}
                        onChange={(e) =>
                          setPaymentFields((p) => ({
                            ...p,
                            expiryDate: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading || submitting}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        PIN
                      </label>
                      <input
                        type="password"
                        value={paymentFields.cardPin}
                        onChange={(e) =>
                          setPaymentFields((p) => ({
                            ...p,
                            cardPin: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading || submitting}
                        required
                      />
                    </div>
                  </div>
                ) : null}

                {paymentDone && (
                  <p className="text-green-600 text-sm mt-3">
                    {lang === LANGS.BN
                      ? "পেমেন্ট সফল হয়েছে"
                      : "Payment Successful"}
                  </p>
                )}
              </div>

              <div className="items-center px-4 py-3 flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-60"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={loading || submitting}
                >
                  {lang === LANGS.BN ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
                  onClick={handlePayment}
                  disabled={paymentDone || loading || submitting}
                >
                  {paymentDone
                    ? lang === LANGS.BN
                      ? "পেমেন্ট হয়েছে"
                      : "Paid"
                    : lang === LANGS.BN
                    ? "পেমেন্ট করুন"
                    : "Pay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[980] bg-black/40 grid place-items-center">
          <div className="bg-white rounded-xl shadow-xl w-[95vw] max-w-xl">
            <div className="px-6 py-5 space-y-3 text-center">
              <div className="mx-auto h-12 w-12 rounded-full grid place-items-center bg-green-100">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-green-700">
                {lang === LANGS.BN
                  ? "আবেদন জমা হয়েছে"
                  : "Application Submitted"}
              </h3>
              <p className="text-sm text-gray-700 leading-6">
                {lang === LANGS.BN
                  ? `আপনার আবেদনটি সফলভাবে জমা হয়েছে (ট্র্যাকিং নম্বর: ${trackingNumber}). এটি একজন এসি (ল্যান্ড) কর্মকর্তা পর্যালোচনা করবেন। সাধারণত ৭ দিনের মধ্যে প্রাথমিক যাচাই সম্পন্ন হয় এবং সবকিছু ঠিক থাকলে ২১ কর্মদিবসের মধ্যে আপনার কাজ সম্পন্ন হবে।`
                  : `Your application has been submitted (Tracking No: ${trackingNumber}). An AC (Land) officer will review it. Initial verification is usually completed within 7 days, and if everything is in order, your case is typically completed within 21 working days.`}
              </p>
            </div>
            <div className="px-6 pb-5 flex justify-center">
              <button
                type="button"
                onClick={handleSuccessOk}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {lang === LANGS.BN ? "ওকে" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MutationForm;
