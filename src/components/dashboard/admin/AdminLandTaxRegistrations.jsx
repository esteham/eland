import { useEffect, useState } from "react";
import api from "../../../api";

// Modal Component
function MatchDetailsModal({ isOpen, onClose, matchResult, registration }) {
  if (!isOpen) return null;

  const fieldLabels = {
    division: "Division",
    district: "District",
    upazila: "Upazila",
    mouza: "Mouza",
    survey_type: "Survey Type",
    khatiyan_number: "Khatiyan",
    dag_number: "Dag",
    land_area: "Land Area",
  };

  const getFieldValue = (field, source) => {
    if (source === "registration") {
      switch (field) {
        case "division":
          return (
            registration?.division?.name_bn || registration?.division?.name_en
          );
        case "district":
          return (
            registration?.district?.name_bn || registration?.district?.name_en
          );
        case "upazila":
          return (
            registration?.upazila?.name_bn || registration?.upazila?.name_en
          );
        case "mouza":
          return registration?.mouza?.name_bn || registration?.mouza?.name_en;
        case "survey_type":
          return (
            registration?.surveyType?.name_bn ||
            registration?.surveyType?.name_en
          );
        case "khatiyan_number":
          return registration?.khatiyan_number;
        case "dag_number":
          return registration?.dag_number;
        case "land_area":
          return `${registration?.land_area} sq ft`;
        default:
          return "";
      }
    } else if (source === "land_record" && matchResult.land_record) {
      switch (field) {
        case "division":
          return (
            matchResult.land_record?.division?.name_bn ||
            matchResult.land_record?.division?.name_en
          );
        case "district":
          return (
            matchResult.land_record?.district?.name_bn ||
            matchResult.land_record?.district?.name_en
          );
        case "upazila":
          return (
            matchResult.land_record?.upazila?.name_bn ||
            matchResult.land_record?.upazila?.name_en
          );
        case "mouza":
          return (
            matchResult.land_record?.mouza?.name_bn ||
            matchResult.land_record?.mouza?.name_en
          );
        case "survey_type":
          return (
            matchResult.land_record?.surveyType?.name_bn ||
            matchResult.land_record?.surveyType?.name_en
          );
        case "khatiyan_number":
          return matchResult.land_record?.khatiyan_number;
        case "dag_number":
          return matchResult.land_record?.dag_number;
        case "land_area":
          return `${matchResult.land_record?.land_area} sq ft`;
        default:
          return "";
      }
    }
    return "";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-[750px] mx-4  overflow-y-auto ">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Land Details Verification</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span
              className={`text-lg ${
                matchResult.match ? "text-green-600 " : "text-red-600"
              }`}
            >
              {matchResult.match ? "✅" : "❌"}
            </span>
            <span className="font-medium">
              {matchResult.match
                ? "Data Match"
                : matchResult.land_record
                ? "Partial Match"
                : "No Match Found"}
            </span>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-4">Field-by-Field Comparison:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(fieldLabels).map(([field, label]) => (
                <div key={field} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-sm ${
                        matchResult.field_matches?.[field]
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {matchResult.field_matches?.[field] ? "✅" : "❌"}
                    </span>
                    <span className="font-medium text-sm">{label}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-mono">
                        {getFieldValue(field, "registration")}
                      </span>
                    </div>
                    {matchResult.land_record && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Official:</span>
                        <span
                          className={`font-mono ${
                            matchResult.field_matches?.[field]
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {getFieldValue(field, "land_record")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!matchResult.match && !matchResult.land_record && (
            <div className="border-t pt-4">
              <p className="text-sm text-red-600">
                No matching land record found in our database. The submitted
                Khatiyan and Dag numbers do not exist in our official records.
              </p>
            </div>
          )}

          {matchResult.match === false && matchResult.land_record && (
            <div className="border-t pt-4">
              <p className="text-sm text-orange-600">
                Partial match found. Some fields do not match the official
                records. Please review the discrepancies above.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLandTaxRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");
  const [matchingResults, setMatchingResults] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [selectedMatchResult, setSelectedMatchResult] = useState(null);

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

  const handleMatchLandDetails = async (reg) => {
    try {
      const { data } = await api.post(
        `/land-tax-registrations/${reg.id}/match-land-details`
      );
      setMatchingResults((prev) => ({ ...prev, [reg.id]: data }));
      setSelectedRegistration(reg);
      setSelectedMatchResult(data);
      setModalOpen(true);
    } catch {
      alert("Failed to match land details");
    }
  };

  const openMatchDetailsModal = (registration) => {
    setSelectedRegistration(registration);
    setSelectedMatchResult(matchingResults[registration.id]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRegistration(null);
    setSelectedMatchResult(null);
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

      <MatchDetailsModal
        isOpen={modalOpen}
        onClose={closeModal}
        matchResult={selectedMatchResult}
        registration={selectedRegistration}
      />

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
                    <div className="space-y-2">
                      <button
                        onClick={() => handleMatchLandDetails(reg)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        Match Land Details
                      </button>
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
                      {matchingResults[reg.id] && (
                        <div
                          className={`text-xs mt-1 cursor-pointer hover:underline ${
                            matchingResults[reg.id].match
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                          onClick={() => openMatchDetailsModal(reg)}
                        >
                          {matchingResults[reg.id].match
                            ? "✅ Data Match"
                            : "❌ Data Not Match"}
                        </div>
                      )}
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
