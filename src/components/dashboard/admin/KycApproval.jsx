import { useEffect, useState } from "react";
import api from "../../../api";
import { CheckCircle, XCircle, Eye, User, FileText } from "lucide-react";

export default function KycApproval() {
  const [pendingKycs, setPendingKycs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(null); // id of the one being processed
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  const fetchPendingKycs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/kyc/pending");
      setPendingKycs(data.kycs);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load pending KYCs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKycs();
  }, []);

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await api.post(`/admin/kyc/${id}/approve`);
      // Remove from list or refetch
      setPendingKycs(pendingKycs.filter((kyc) => kyc.id !== id));
      alert("KYC approved successfully");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to approve KYC");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    setProcessing(id);
    try {
      await api.post(`/admin/kyc/${id}/reject`, {
        rejection_reason: rejectReason,
      });
      setPendingKycs(pendingKycs.filter((kyc) => kyc.id !== id));
      setRejectReason("");
      setRejectingId(null);
      alert("KYC rejected");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to reject KYC");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchPendingKycs}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-xl">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">KYC Approvals</h2>
      </div>

      {pendingKycs.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">No pending KYC approvals</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingKycs.map((kyc) => (
            <div
              key={kyc.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {kyc.user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {kyc.user?.name}
                    </h3>
                    <p className="text-sm text-gray-600">{kyc.user?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="text-sm font-medium">
                    {new Date(kyc.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    ID Front
                  </label>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <a
                      href={`${api.defaults.baseURL.replace(
                        "/api",
                        ""
                      )}/storage/${kyc.id_front}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Front Image
                    </a>
                    <img
                      src={`${api.defaults.baseURL.replace(
                        "/api",
                        ""
                      )}/storage/${kyc.id_front}`}
                      alt="ID Front"
                      className="mt-2 max-w-full h-auto max-h-32 border rounded"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    ID Back
                  </label>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <a
                      href={`${api.defaults.baseURL.replace(
                        "/api",
                        ""
                      )}/storage/${kyc.id_back}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Back Image
                    </a>
                    <img
                      src={`${api.defaults.baseURL.replace(
                        "/api",
                        ""
                      )}/storage/${kyc.id_back}`}
                      alt="ID Back"
                      className="mt-2 max-w-full h-auto max-h-32 border rounded"
                    />
                  </div>
                </div>
              </div>

              {rejectingId === kyc.id ? (
                <div className="space-y-4">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="w-full p-3 border rounded-lg"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(kyc.id)}
                      disabled={processing === kyc.id}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      {processing === kyc.id
                        ? "Rejecting..."
                        : "Confirm Reject"}
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setRejectReason("");
                      }}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(kyc.id)}
                    disabled={processing === kyc.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {processing === kyc.id ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => setRejectingId(kyc.id)}
                    disabled={processing === kyc.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
