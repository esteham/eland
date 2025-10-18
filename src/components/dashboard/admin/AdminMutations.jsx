import { useState, useEffect, useMemo, useCallback } from "react";
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

  // ---- API ----
  const fetchMutations = useCallback(
    async (opts = { silent: false }) => {
      const { silent } = opts;
      if (!silent) setLoading(true);
      try {
        const params = { page: currentPage, per_page: itemsPerPage };
        if (filterStatus) params.status = filterStatus;
        if (searchQuery) params.search = searchQuery;

        const { data } = await api.get("/admin/mutations", { params });
        setMutations(data.data || []);
        setTotalPages(data.last_page || 1);
      } catch (error) {
        console.error("Error fetching admin mutations:", error);
        setMutations([]);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [currentPage, filterStatus, searchQuery]
  );

  useEffect(() => {
    fetchMutations();
  }, [fetchMutations]);

  // Auto-refresh every 12s (silent, no spinner)
  useEffect(() => {
    const id = setInterval(() => fetchMutations({ silent: true }), 12000);
    return () => clearInterval(id);
  }, [fetchMutations]);

  // ---- Helpers ----
  const getStatusDisplay = (status) => {
    if (status === "assigned_to_ac_land")
      return "Inquiry – Your request is under review";
    return status || "—";
  };

  const statusChip = (status) => {
    const map = {
      approved: "bg-green-50 text-green-700 ring-green-200",
      pending: "bg-yellow-50 text-yellow-700 ring-yellow-200",
      rejected: "bg-red-50 text-red-700 ring-red-200",
      pending_payment: "bg-blue-50 text-blue-700 ring-blue-200",
      assigned_to_ac_land: "bg-purple-50 text-purple-700 ring-purple-200",
    };
    const cls = map[status] || "bg-slate-50 text-slate-700 ring-slate-200";
    return `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${cls}`;
  };

  const handleStatusUpdate = async (mutationId, newStatus) => {
    if (!newStatus) return;
    if (!confirm(`Are you sure you want to update status to ${newStatus}?`))
      return;
    try {
      await api.patch(`/admin/mutations/${mutationId}`, { status: newStatus });
      fetchMutations({ silent: true });
      alert(lang === LANGS.BN ? "স্ট্যাটাস আপডেট হয়েছে!" : "Status updated!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert(
        lang === LANGS.BN ? "স্ট্যাটাস আপডেট ব্যর্থ!" : "Failed to update status!"
      );
    }
  };

  const handleViewDetails = (mutation) => {
    setSelectedMutation(mutation);
    setShowModal(true);
  };

  // Local filter (keeps working even if backend search not applied)
  const filtered = useMemo(() => {
    const q = (searchQuery || "").toLowerCase();
    return mutations.filter((m) => {
      const kh = (m.application?.khatiyan_number || m.khatian_number || "")
        .toLowerCase();
      const dg = (m.application?.dag_number || m.dag_number || "").toLowerCase();
      return kh.includes(q) || dg.includes(q);
    });
  }, [mutations, searchQuery]);

  // Sort newest first by created_at (fallback id)
  const sorted = useMemo(() => {
    const c = [...filtered];
    c.sort((a, b) => {
      const ta = a?.created_at ? +new Date(a.created_at) : 0;
      const tb = b?.created_at ? +new Date(b.created_at) : 0;
      if (tb !== ta) return tb - ta;
      const ia = Number(a?.id) || 0;
      const ib = Number(b?.id) || 0;
      return ib - ia;
    });
    return c;
  }, [filtered]);

  // The latest item (top row) gets NEW badge
  const latestId = sorted[0]?.id;

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          {lang === LANGS.BN ? "মিউটেশন অ্যাডমিন প্যানেল" : "Admin Mutations Panel"}
        </h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-14 rounded-xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {lang === LANGS.BN ? "মিউটেশন অ্যাডমিন প্যানেল" : "Admin Mutations Panel"}
      </h2>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder={
              lang === LANGS.BN ? "খতিয়ান/দাগ সার্চ করুন" : "Search by Khatiyan/Dag"
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full md:w-72"
          />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full md:w-56"
          >
            <option value="">{lang === LANGS.BN ? "সকল স্ট্যাটাস" : "All Status"}</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="assigned_to_ac_land">Assigned to AC Land</option>
          </select>
          <button
            onClick={() => fetchMutations({ silent: false })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full md:w-auto"
          >
            {lang === LANGS.BN ? "ফিল্টার করুন" : "Filter"}
          </button>
        </div>
      </div>

      {/* Mutations List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <Th>{lang === LANGS.BN ? "খতিয়ান নম্বর" : "Khatiyan Number"}</Th>
              <Th>{lang === LANGS.BN ? "দাগ নম্বর" : "Dag Number"}</Th>
              <Th>{lang === LANGS.BN ? "স্ট্যাটাস" : "Status"}</Th>
              <Th>{lang === LANGS.BN ? "আবেদনকারী" : "Applicant"}</Th>
              <Th>{lang === LANGS.BN ? "তারিখ" : "Date"}</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sorted.map((mutation) => {
              const kh = mutation.khatian_number || mutation.application?.khatiyan_number || "N/A";
              const isLatest = mutation.id === latestId;

              return (
                <tr key={mutation.id} className="hover:bg-slate-50">
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{kh}</span>
                      {isLatest && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-600/10 px-2 py-0.5 text-[11px] font-bold uppercase text-red-700 ring-1 ring-red-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                          New
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>{mutation.dag_number || mutation.application?.dag_number || "N/A"}</Td>
                  <Td>
                    <span className={statusChip(mutation.status)}>
                      {getStatusDisplay(mutation.status)}
                    </span>
                  </Td>
                  <Td>{mutation.user?.name || "N/A"}</Td>
                  <Td>{new Date(mutation.created_at).toLocaleDateString()}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(mutation)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
                      >
                        {lang === LANGS.BN ? "বিস্তারিত" : "View"}
                      </button>
                      <select
                        value=""
                        onChange={(e) => handleStatusUpdate(mutation.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="">
                          {lang === LANGS.BN ? "স্ট্যাটাস পরিবর্তন করুন" : "Update Status"}
                        </option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="pending_payment">Pending Payment</option>
                        <option value="assigned_to_ac_land">Assigned to AC Land</option>
                      </select>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <p className="text-center py-8 text-slate-500">
            {lang === LANGS.BN ? "কোনো মিউটেশন পাওয়া যায়নি।" : "No mutations found."}
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-slate-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-slate-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modern Details Modal */}
      {showModal && selectedMutation && (
        <DetailsModal
          lang={lang}
          onClose={() => setShowModal(false)}
          mutation={selectedMutation}
          statusChip={statusChip}
          getStatusDisplay={getStatusDisplay}
        />
      )}
    </div>
  );
};

export default AdminMutations;

/* ========= Small presentational helpers ========= */
const Th = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
    {children}
  </th>
);

const Td = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{children}</td>
);

/* ========= Modern Details Modal ========= */
const DetailsModal = ({ lang, onClose, mutation, statusChip, getStatusDisplay }) => {
  const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-[13px] text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 max-w-[65%] text-right break-words">
        {value ?? "—"}
      </span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center"
      onClick={onClose}
    >
      <div
        className="w-[min(100vw-2rem,1000px)] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {lang === LANGS.BN ? "মিউটেশন বিস্তারিত" : "Mutation Details"}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-slate-500">#{mutation.id}</span>
              <span className={statusChip(mutation.status)}>
                {getStatusDisplay(mutation.status)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="rounded-xl border border-slate-200 p-4">
              <h4 className="mb-2 font-semibold text-slate-900">
                {lang === LANGS.BN ? "মিউটেশন তথ্য" : "Mutation Info"}
              </h4>
              <InfoRow
                label={lang === LANGS.BN ? "মিউটেশন টাইপ" : "Mutation Type"}
                value={mutation.mutation_type || "N/A"}
              />
              <InfoRow
                label={lang === LANGS.BN ? "কারণ" : "Reason"}
                value={mutation.reason || "N/A"}
              />
              <InfoRow
                label={lang === LANGS.BN ? "ফি পরিমাণ" : "Fee Amount"}
                value={
                  mutation.fee_amount != null ? `${mutation.fee_amount} BDT` : "N/A"
                }
              />
              <InfoRow
                label={lang === LANGS.BN ? "রিমার্কস" : "Remarks"}
                value={mutation.remarks || "N/A"}
              />
              <InfoRow
                label={lang === LANGS.BN ? "তৈরি হয়েছে" : "Created At"}
                value={new Date(mutation.created_at).toLocaleString()}
              />
              <InfoRow
                label={lang === LANGS.BN ? "রিভিউ হয়েছে" : "Reviewed At"}
                value={
                  mutation.reviewed_at
                    ? new Date(mutation.reviewed_at).toLocaleString()
                    : "—"
                }
              />
            </section>

            <section className="rounded-xl border border-slate-200 p-4">
              <h4 className="mb-2 font-semibold text-slate-900">
                {lang === LANGS.BN ? "আবেদনকারী ও আবেদন" : "Applicant & Application"}
              </h4>
              <InfoRow
                label={lang === LANGS.BN ? "নাম" : "Name"}
                value={mutation.user?.name || "N/A"}
              />
              <InfoRow
                label="Email"
                value={mutation.user?.email || "N/A"}
              />
              <InfoRow
                label={lang === LANGS.BN ? "রিভিউয়ার" : "Reviewer"}
                value={mutation.reviewer?.name || "N/A"}
              />
              <div className="h-px bg-slate-200 my-2" />
              <InfoRow
                label={lang === LANGS.BN ? "খতিয়ান নম্বর" : "Khatiyan No."}
                value={mutation.application?.khatiyan_number || mutation.khatian_number || "N/A"}
              />
              <InfoRow
                label={lang === LANGS.BN ? "দাগ নম্বর" : "Dag No."}
                value={mutation.application?.dag_number || mutation.dag_number || "N/A"}
              />
              <InfoRow
                label={lang === LANGS.BN ? "জমির ধরন" : "Land Type"}
                value={mutation.application?.land_type || mutation.land_type || "N/A"}
              />
              <InfoRow
                label={lang === LANGS.BN ? "জমির আয়তন" : "Land Area"}
                value={
                  mutation.application?.land_area != null
                    ? `${mutation.application.land_area} sq ft`
                    : mutation.land_area != null
                    ? `${mutation.land_area} sq ft`
                    : "N/A"
                }
              />
            </section>
          </div>

          {Array.isArray(mutation.documents) && mutation.documents.length > 0 && (
            <section className="mt-4 rounded-xl border border-slate-200 p-4">
              <h4 className="mb-2 font-semibold text-slate-900">
                {lang === LANGS.BN ? "ডকুমেন্টস" : "Documents"}
              </h4>
              <ul className="divide-y divide-slate-200">
                {mutation.documents.map((doc, i) => (
                  <li key={i} className="py-2 flex items-center justify-between">
                    <span className="text-sm text-slate-800 truncate">
                      {doc.name || doc.path?.split("/").pop() || "document"}
                    </span>
                    <a
                      href={`/storage/${doc.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-700 hover:underline"
                    >
                      {lang === LANGS.BN ? "খুলুন" : "Open"}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            {lang === LANGS.BN ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
