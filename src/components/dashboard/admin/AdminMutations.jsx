import { useState, useEffect } from "react";
import api from "../../../api";
import { LANGS } from "../../../fonts/UserDashbboardFonts";

const AdminMutations = ({ lang }) => {
  const [mutations, setMutations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [selectedMutation, setSelectedMutation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMutations();
  }, [currentPage, filterStatus, searchQuery]);

  const fetchMutations = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };
      if (filterStatus) params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;

      const { data } = await api.get("/admin/mutations", { params });
      setMutations(data.data || []);
      setTotalPages(data.last_page || 1);
    } catch (error) {
      console.error("Error fetching admin mutations:", error);
      setMutations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (mutationId, newStatus) => {
    if (!confirm(`Are you sure you want to update status to ${newStatus}?`))
      return;

    try {
      await api.patch(`/admin/mutations/${mutationId}`, { status: newStatus });
      fetchMutations(); // Refresh list
      alert(lang === LANGS.BN ? "স্ট্যাটাস আপডেট হয়েছে!" : "Status updated!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert(
        lang === LANGS.BN
          ? "স্ট্যাটাস আপডেট ব্যর্থ!"
          : "Failed to update status!"
      );
    }
  };

  const getStatusDisplay = (status) => {
    if (status === "assigned_to_ac_land") return "Inquiry – Your request is under review";
    return status;
  };

  const handleViewDetails = (mutation) => {
    setSelectedMutation(mutation);
    setShowModal(true);
  };

  if (loading) {
    return <p>{lang === LANGS.BN ? "লোড হচ্ছে..." : "Loading..."}</p>;
  }

  const filteredMutations = mutations.filter(
    (mutation) =>
      (mutation.application?.khatiyan_number || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (mutation.application?.dag_number || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {lang === LANGS.BN
          ? "মিউটেশন অ্যাডমিন প্যানেল"
          : "Admin Mutations Panel"}
      </h2>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder={
              lang === LANGS.BN
                ? "খতিয়ান/দাগ সার্চ করুন"
                : "Search by Khatiyan/Dag"
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {lang === LANGS.BN ? "সকল স্ট্যাটাস" : "All Status"}
            </option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="assigned_to_ac_land">Assigned to AC Land</option>
          </select>
          <button
            onClick={fetchMutations}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {lang === LANGS.BN ? "ফিল্টার করুন" : "Filter"}
          </button>
        </div>
      </div>

      {/* Mutations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {lang === LANGS.BN ? "খতিয়ান নম্বর" : "Khatiyan Number"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {lang === LANGS.BN ? "দাগ নম্বর" : "Dag Number"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {lang === LANGS.BN ? "স্ট্যাটাস" : "Status"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {lang === LANGS.BN ? "আবেদনকারী" : "Applicant"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {lang === LANGS.BN ? "তারিখ" : "Date"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMutations.map((mutation) => (
              <tr key={mutation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {mutation.application?.khatiyan_number || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {mutation.application?.dag_number || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      mutation.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : mutation.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : mutation.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : mutation.status === "assigned_to_ac_land"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {getStatusDisplay(mutation.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {mutation.user?.name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(mutation.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleViewDetails(mutation)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </button>
                  <select
                    value=""
                    onChange={(e) =>
                      handleStatusUpdate(mutation.id, e.target.value)
                    }
                    className="text-sm border rounded"
                  >
                    <option value="">
                      {lang === LANGS.BN
                        ? "স্ট্যাটাস পরিবর্তন করুন"
                        : "Update Status"}
                    </option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="assigned_to_ac_land">Assigned to AC Land</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {mutations.length === 0 && (
          <p className="text-center py-8 text-gray-500">
            {lang === LANGS.BN
              ? "কোনো মিউটেশন পাওয়া যায়নি।"
              : "No mutations found."}
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedMutation && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {lang === LANGS.BN ? "মিউটেশন বিস্তারিত" : "Mutation Details"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700">
                    {lang === LANGS.BN ? "মিউটেশন তথ্য" : "Mutation Info"}
                  </h4>
                  <p>
                    <strong>{lang === LANGS.BN ? "আইডি:" : "ID:"}</strong>{" "}
                    {selectedMutation.id}
                  </p>
                  <p>
                    <strong>
                      {lang === LANGS.BN ? "মিউটেশন টাইপ:" : "Mutation Type:"}
                    </strong>{" "}
                    {selectedMutation.mutation_type}
                  </p>
                  <p>
                    <strong>{lang === LANGS.BN ? "কারণ:" : "Reason:"}</strong>{" "}
                    {selectedMutation.reason}
                  </p>
                  <p>
                    <strong>
                      {lang === LANGS.BN ? "ফি পরিমাণ:" : "Fee Amount:"}
                    </strong>{" "}
                    {selectedMutation.fee_amount}
                  </p>
                  <p>
                    <strong>
                      {lang === LANGS.BN ? "স্ট্যাটাস:" : "Status:"}
                    </strong>{" "}
                    {selectedMutation.status}
                  </p>
                  <p>
                    <strong>
                      {lang === LANGS.BN ? "রিমার্কস:" : "Remarks:"}
                    </strong>{" "}
                    {selectedMutation.remarks || "N/A"}
                  </p>
                  <p>
                    <strong>
                      {lang === LANGS.BN ? "তৈরি হয়েছে:" : "Created At:"}
                    </strong>{" "}
                    {new Date(selectedMutation.created_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>
                      {lang === LANGS.BN ? "আপডেট হয়েছে:" : "Reviewed At:"}
                    </strong>{" "}
                    {selectedMutation.reviewed_at
                      ? new Date(selectedMutation.reviewed_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">
                    {lang === LANGS.BN ? "আবেদনকারী তথ্য" : "Applicant Info"}
                  </h4>
                  <p>
                    <strong>{lang === LANGS.BN ? "নাম:" : "Name:"}</strong>{" "}
                    {selectedMutation.user?.name || "N/A"}
                  </p>
                  <p>
                    <strong>{lang === LANGS.BN ? "ইমেইল:" : "Email:"}</strong>{" "}
                    {selectedMutation.user?.email || "N/A"}
                  </p>
                  <p>
                    <strong>
                      {lang === LANGS.BN ? "রিভিউয়ার:" : "Reviewer:"}
                    </strong>{" "}
                    {selectedMutation.reviewer?.name || "N/A"}
                  </p>
                  <h4 className="font-semibold text-gray-700 mt-4">
                    {lang === LANGS.BN ? "আবেদন তথ্য" : "Application Info"}
                  </h4>
                  <p>
                    <strong>
                      {lang === LANGS.BN
                        ? "খতিয়ান নম্বর:"
                        : "Khatiyan Number:"}
                    </strong>{" "}
                    {selectedMutation.application?.khatiyan_number || "N/A"}
                  </p>
                  <p>
                    <strong>
                      {lang === LANGS.BN ? "দাগ নম্বর:" : "Dag Number:"}
                    </strong>{" "}
                    {selectedMutation.application?.dag_number || "N/A"}
                  </p>
                  <p>
                    <strong>
                      {lang === LANGS.BN ? "জমির ধরন:" : "Land Type:"}
                    </strong>{" "}
                    {selectedMutation.application?.land_type || "N/A"}
                  </p>
                  <p>
                    <strong>
                      {lang === LANGS.BN ? "জমির আয়তন:" : "Land Area:"}
                    </strong>{" "}
                    {selectedMutation.application?.land_area || "N/A"}
                  </p>
                </div>
              </div>
              {selectedMutation.documents &&
                selectedMutation.documents.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-700">
                      {lang === LANGS.BN ? "ডকুমেন্টস" : "Documents"}
                    </h4>
                    <ul className="list-disc list-inside">
                      {selectedMutation.documents.map((doc, index) => (
                        <li key={index}>
                          <a
                            href={`/storage/${doc.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {doc.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  {lang === LANGS.BN ? "বন্ধ করুন" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMutations;
