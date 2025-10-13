import { useState, useEffect } from "react";
import api from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";
import MutationForm from "./MutationForm";
import MutationDetails from "./MutationDetails";

const MutationList = ({ lang, t, user }) => {
  const [mutations, setMutations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleItems, setVisibleItems] = useState(3);
  const [showForm, setShowForm] = useState(false);
  const [selectedMutationId, setSelectedMutationId] = useState(null);

  const fetchMutations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/mutations");
      setMutations(data.data || []);
    } catch (error) {
      console.error("Error fetching mutations:", error);
      setMutations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMutations();
  }, [user?.id]);

  if (loading) {
    return <p>{t("loading")}</p>;
  }

  if (showForm) {
    return (
      <MutationForm
        lang={lang}
        onSuccess={() => {
          setShowForm(false);
          fetchMutations();
        }}
      />
    );
  }

  if (selectedMutationId) {
    return (
      <MutationDetails
        lang={lang}
        mutationId={selectedMutationId}
        onBack={() => setSelectedMutationId(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("mutations")}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {lang === LANGS.BN ? "নতুন মিউটেশন আবেদন" : "Apply for Mutation"}
        </button>
      </div>

      {mutations.length === 0 ? (
        <p className="text-gray-600">
          {lang === LANGS.BN
            ? "কোনো মিউটেশন পাওয়া যায়নি।"
            : "No mutations found."}
        </p>
      ) : (
        <div className="space-y-4">
          {mutations.slice(0, visibleItems).map((mutation) => (
            <div
              key={mutation.id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>
                    {lang === LANGS.BN ? "খতিয়ান নম্বর:" : "Khatiyan Number:"}
                  </strong>{" "}
                  {mutation.application?.khatiyan_number || "N/A"}
                </p>
                <p>
                  <strong>
                    {lang === LANGS.BN ? "দাগ নম্বর:" : "Dag Number:"}
                  </strong>{" "}
                  {mutation.application?.dag_number || "N/A"}
                </p>
                <p>
                  <strong>{t("status")}:</strong>{" "}
                  <span
                    className={`uppercase font-semibold ${
                      mutation.status === "approved"
                        ? "text-green-600"
                        : mutation.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {mutation.status}
                  </span>
                </p>
                <p>
                  <strong>
                    {lang === LANGS.BN ? "আবেদন তারিখ:" : "Application Date:"}
                  </strong>{" "}
                  {new Date(mutation.created_at).toLocaleDateString()}
                </p>
                {mutation.documents && (
                  <p>
                    <strong>
                      {lang === LANGS.BN ? "ডকুমেন্টস:" : "Documents:"}
                    </strong>{" "}
                    {mutation.documents.length} files
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  className="px-3 py-1 rounded-md bg-gray-600 text-white hover:bg-gray-700"
                  onClick={() => setSelectedMutationId(mutation.id)}
                >
                  {lang === LANGS.BN ? "বিস্তারিত দেখুন" : "View Details"}
                </button>
                {mutation.status === "pending_payment" && (
                  <button
                    className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setSelectedMutationId(mutation.id)}
                  >
                    {lang === LANGS.BN ? "পেমেন্ট করুন" : "Pay"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {mutations.length > visibleItems && (
            <button
              onClick={() => setVisibleItems((prev) => prev + 5)}
              className="px-2 py-1 rounded-md bg-gray-600 text-white hover:bg-gray-700"
            >
              {t("showMore")}
            </button>
          )}
          {visibleItems > 3 && (
            <button
              onClick={() => setVisibleItems(3)}
              className="px-2 py-1 rounded-md bg-gray-600 text-white hover:bg-gray-700 ml-2"
            >
              {t("showLess")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MutationList;
