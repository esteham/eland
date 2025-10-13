import { useEffect, useState } from "react";
import api from "../../../api";

export default function AdminLandTaxRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let intervalId;
    loadRegistrations();
    intervalId = setInterval(loadRegistrations, 10000);

    return () => intervalId && clearInterval(intervalId);
  }, []);

  const loadRegistrations = async () => {
    try {
      const { data } = await api.get("/land-tax-registrations");
      setRegistrations(data);
    } catch {
      setError("Failed to load registrations");
    }
  };

  const updateStatus = async (id, status, notes = "") => {
    try {
      await api.put(`/land-tax-registrations/${id}`, { status, notes });
      loadRegistrations();
    } catch {
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "flagged":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Land Tax Registrations</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khatiyan / Dag
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrations.map((reg) => (
              <tr key={reg.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reg.user.name}
                  </div>
                  <div className="text-sm text-gray-500">{reg.user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {reg.division.name_bn}, {reg.district.name_bn}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reg.upazila.name_bn}, {reg.mouza.name_bn}
                  </div>
                  <div className="text-sm text-gray-500">
                    Survey: {reg.survey_type.name_bn || reg.survey_type.name_en}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Khatiyan: {reg.khatiyan_number}
                  </div>
                  <div className="text-sm text-gray-500">
                    Dag: {reg.dag_number}
                  </div>
                  <div className="text-sm text-gray-500">
                    Area: {reg.land_area} (sq ft)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      reg.status
                    )}`}
                  >
                    {reg.status}
                  </span>
                  {reg.reviewer && (
                    <div className="text-xs text-gray-500 mt-1">
                      By: {reg.reviewer.name}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(reg.submitted_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {reg.status === "pending" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateStatus(reg.id, "approved")}
                        className="font-bold text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>{" "}
                      |
                      <button
                        onClick={() => updateStatus(reg.id, "rejected")}
                        className="font-semibold text-red-600 hover:text-red-900 ml-2"
                      >
                        Reject
                      </button>{" "}
                      |
                      <button
                        onClick={() => {
                          const notes = prompt("Notes for flagging:");
                          if (notes) updateStatus(reg.id, "flagged", notes);
                        }}
                        className="text-orange-600 hover:text-orange-900 ml-2"
                      >
                        Flag
                      </button>
                    </div>
                  )}
                  {reg.notes && (
                    <div className="text-xs text-red-500 text-gray-500 mt-1">
                      🚩 &nbsp;Notes: {reg.notes}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
