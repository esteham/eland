import { useState, useEffect } from "react";
import {
  getApplications,
  createMutation,
  uploadMutationDocuments,
} from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";

const MutationForm = ({ lang, onSuccess }) => {
  const [formData, setFormData] = useState({
    application_id: "",
    mutation_type: "",
    reason: "",
    fee_amount: "",
    documents: [],
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await getApplications({ status: "approved" });
        setApplications(data.data || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
    fetchApplications();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, documents: Array.from(e.target.files) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const mutationData = {
        application_id: formData.application_id,
        mutation_type: formData.mutation_type,
        reason: formData.reason,
        fee_amount: parseFloat(formData.fee_amount),
        documents: [],
      };

      const { data: mutationResponse } = await createMutation(mutationData);
      const mutationId = mutationResponse.mutation.id;

      // Upload documents if any
      if (formData.documents.length > 0) {
        const docFormData = new FormData();
        formData.documents.forEach((file) => {
          docFormData.append("documents[]", file);
        });
        await uploadMutationDocuments(mutationId, docFormData);
      }

      alert(
        lang === LANGS.BN
          ? "মিউটেশন আবেদন সফলভাবে জমা দেওয়া হয়েছে!"
          : "Mutation application submitted successfully!"
      );
      setFormData({
        application_id: "",
        mutation_type: "",
        reason: "",
        fee_amount: "",
        documents: [],
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting mutation:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(
          lang === LANGS.BN
            ? "আবেদন জমা দেওয়া ব্যর্থ হয়েছে।"
            : "Failed to submit application."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {lang === LANGS.BN ? "নতুন মিউটেশন আবেদন" : "New Mutation Application"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {lang === LANGS.BN ? "আবেদন নির্বাচন করুন" : "Select Application"}
          </label>
          <select
            name="application_id"
            value={formData.application_id}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">
              {lang === LANGS.BN
                ? "আবেদন নির্বাচন করুন"
                : "Select an application"}
            </option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.description} - {app.type}
              </option>
            ))}
          </select>
          {errors.application_id && (
            <p className="text-red-500 text-sm">{errors.application_id[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {lang === LANGS.BN ? "মিউটেশনের ধরন" : "Mutation Type"}
          </label>
          <select
            name="mutation_type"
            value={formData.mutation_type}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {lang === LANGS.BN ? "কারণ" : "Reason"}
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
          {errors.reason && (
            <p className="text-red-500 text-sm">{errors.reason[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {lang === LANGS.BN ? "ফি পরিমাণ" : "Fee Amount"}
          </label>
          <input
            type="number"
            name="fee_amount"
            value={formData.fee_amount}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
            min="0"
            step="0.01"
          />
          {errors.fee_amount && (
            <p className="text-red-500 text-sm">{errors.fee_amount[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {lang === LANGS.BN
              ? "ডকুমেন্টস (যেমন: NID, খতিয়ান কপি)"
              : "Documents (e.g., NID, Khatian Copy)"}
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          {errors.documents && (
            <p className="text-red-500 text-sm">{errors.documents[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? lang === LANGS.BN
              ? "জমা হচ্ছে..."
              : "Submitting..."
            : lang === LANGS.BN
            ? "জমা দিন"
            : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default MutationForm;
