import { useState, useEffect } from "react";
import api from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";
import PaymentBox from "./PaymentBox";

const MutationDetails = ({ lang, mutationId, onBack }) => {
  const [mutation, setMutation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMutation = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/mutations/${mutationId}`);
        setMutation(data);
      } catch (error) {
        console.error("Error fetching mutation details:", error);
        alert(
          lang === LANGS.BN
            ? "মিউটেশন বিস্তারিত লোড করতে ব্যর্থ হয়েছে।"
            : "Failed to load mutation details."
        );
      } finally {
        setLoading(false);
      }
    };
    if (mutationId) fetchMutation();
  }, [mutationId, lang]);

  if (loading) {
    return <p>{lang === LANGS.BN ? "লোড হচ্ছে..." : "Loading..."}</p>;
  }

  if (!mutation) {
    return (
      <p>
        {lang === LANGS.BN ? "মিউটেশন পাওয়া যায়নি।" : "Mutation not found."}
      </p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        {lang === LANGS.BN ? "ফিরে যান" : "Back"}
      </button>

      <h2 className="text-xl font-semibold mb-4">
        {lang === LANGS.BN ? "মিউটেশন বিস্তারিত" : "Mutation Details"}
      </h2>

      <div className="space-y-4">
        <div>
          <strong>
            {lang === LANGS.BN ? "মিউটেশন টাইপ:" : "Mutation Type:"}
          </strong>{" "}
          {mutation.mutation_type || "N/A"}
        </div>
        <div>
          <strong>{lang === LANGS.BN ? "কারণ:" : "Reason:"}</strong>{" "}
          {mutation.reason || "N/A"}
        </div>
        <div>
          <strong>{lang === LANGS.BN ? "ফি পরিমাণ:" : "Fee Amount:"}</strong>{" "}
          {mutation.fee_amount || "N/A"}
        </div>
        <div>
          <strong>{lang === LANGS.BN ? "স্ট্যাটাস:" : "Status:"}</strong>{" "}
          <span
            className={`uppercase font-semibold ${
              mutation.status === "approved"
                ? "text-green-600"
                : mutation.status === "pending"
                ? "text-yellow-600"
                : mutation.status === "rejected"
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {mutation.status}
          </span>
        </div>
        <div>
          <strong>{lang === LANGS.BN ? "রিমার্কস:" : "Remarks:"}</strong>{" "}
          {mutation.remarks || "N/A"}
        </div>
        <div>
          <strong>{lang === LANGS.BN ? "তৈরি হয়েছে:" : "Created At:"}</strong>{" "}
          {new Date(mutation.created_at).toLocaleDateString()}
        </div>
        {mutation.reviewed_at && (
          <div>
            <strong>
              {lang === LANGS.BN ? "রিভিউ হয়েছে:" : "Reviewed At:"}
            </strong>{" "}
            {new Date(mutation.reviewed_at).toLocaleDateString()}
          </div>
        )}
        <div>
          <strong>{lang === LANGS.BN ? "রিভিউয়ার:" : "Reviewer:"}</strong>{" "}
          {mutation.reviewer?.name || "N/A"}
        </div>

        <h3 className="text-lg font-semibold mt-6">
          {lang === LANGS.BN
            ? "সংশ্লিষ্ট আবেদন তথ্য"
            : "Related Application Info"}
        </h3>
        <div className="space-y-2 ml-4">
          <div>
            <strong>
              {lang === LANGS.BN ? "খতিয়ান নম্বর:" : "Khatiyan Number:"}
            </strong>{" "}
            {mutation.application?.khatiyan_number || "N/A"}
          </div>
          <div>
            <strong>{lang === LANGS.BN ? "দাগ নম্বর:" : "Dag Number:"}</strong>{" "}
            {mutation.application?.dag_number || "N/A"}
          </div>
          <div>
            <strong>{lang === LANGS.BN ? "জমির ধরন:" : "Land Type:"}</strong>{" "}
            {mutation.application?.land_type || "N/A"}
          </div>
          <div>
            <strong>{lang === LANGS.BN ? "জমির পরিমাণ:" : "Land Area:"}</strong>{" "}
            {mutation.application?.land_area || "N/A"} sq ft
          </div>
        </div>
        {mutation.documents && mutation.documents.length > 0 && (
          <div>
            <strong>{lang === LANGS.BN ? "ডকুমেন্টস:" : "Documents:"}</strong>
            <ul className="list-disc list-inside">
              {mutation.documents.map((doc, index) => (
                <li key={index}>
                  <a
                    href={`/storage/${doc.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {doc.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {mutation.status === "pending_payment" && (
          <div className="mt-6">
            <PaymentBox
              mutationId={mutation.id}
              lang={lang}
              onSuccess={() => window.location.reload()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MutationDetails;
