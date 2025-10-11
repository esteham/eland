import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../auth/AuthContext";

export default function LandTaxRegistration() {
  const nav = useNavigate();
  const { user } = useAuth();

  // Collections
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [mouzas, setMouzas] = useState([]);
  const [surveyTypes, setSurveyTypes] = useState([]);

  // Selected IDs
  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [upazilaId, setUpazilaId] = useState("");
  const [mouzaId, setMouzaId] = useState("");
  const [surveyTypeId, setSurveyTypeId] = useState("");

  // Inputs
  const [khatiyanNumber, setKhatiyanNumber] = useState("");
  const [dagNumber, setDagNumber] = useState("");
  const [landType, setLandType] = useState("");
  const [landArea, setLandArea] = useState("");

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load Divisions
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/locations/divisions");
        setDivisions(data);
      } catch {
        setError("Failed to load divisions");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Division -> Districts
  useEffect(() => {
    if (!divisionId) {
      setDistricts([]);
      setDistrictId("");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(
          `/locations/divisions/${divisionId}/districts`
        );
        setDistricts(data);
      } catch {
        setError("Failed to load districts");
      } finally {
        setLoading(false);
      }
    })();
  }, [divisionId]);

  // District -> Upazilas
  useEffect(() => {
    if (!districtId) {
      setUpazilas([]);
      setUpazilaId("");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(
          `/locations/districts/${districtId}/upazilas`
        );
        setUpazilas(data);
      } catch {
        setError("Failed to load upazilas");
      } finally {
        setLoading(false);
      }
    })();
  }, [districtId]);

  // Upazila -> Mouzas
  useEffect(() => {
    if (!upazilaId) {
      setMouzas([]);
      setMouzaId("");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(
          `/locations/upazilas/${upazilaId}/mouzas`
        );
        setMouzas(data);
      } catch {
        setError("Failed to load mouzas");
      } finally {
        setLoading(false);
      }
    })();
  }, [upazilaId]);

  // Load Survey Types
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/locations/survey-types");
        setSurveyTypes(data);
      } catch {
        // optional
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first.");
      nav("/login");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/land-tax-registrations", {
        division_id: divisionId,
        district_id: districtId,
        upazila_id: upazilaId,
        mouza_id: mouzaId,
        survey_type_id: surveyTypeId,
        khatiyan_number: khatiyanNumber,
        dag_number: dagNumber,
        land_type: landType,
        land_area: landArea,
      });
      alert(data.message);
      nav("/dashboard?tab=ldt", {
        state: { activeTab: "Land Development Tax (LDT)" },
      });
      // Reset form
      setDivisionId("");
      setDistrictId("");
      setUpazilaId("");
      setMouzaId("");
      setSurveyTypeId("");
      setKhatiyanNumber("");
      setDagNumber("");
      setLandType("");
      setLandArea("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Land Tax Registration</h1>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Division</label>
              <select
                className="w-full border rounded p-2"
                value={divisionId}
                onChange={(e) => {
                  setDivisionId(e.target.value);
                  setDistrictId("");
                  setUpazilaId("");
                  setMouzaId("");
                }}
                required
              >
                <option value="">Select Division</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_bn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">District</label>
              <select
                className="w-full border rounded p-2"
                value={districtId}
                onChange={(e) => {
                  setDistrictId(e.target.value);
                  setUpazilaId("");
                  setMouzaId("");
                }}
                disabled={!divisionId || loading}
                required
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_bn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Upazila</label>
              <select
                className="w-full border rounded p-2"
                value={upazilaId}
                onChange={(e) => {
                  setUpazilaId(e.target.value);
                  setMouzaId("");
                }}
                disabled={!districtId || loading}
                required
              >
                <option value="">Select Upazila</option>
                {upazilas.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name_bn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mouza</label>
              <select
                className="w-full border rounded p-2"
                value={mouzaId}
                onChange={(e) => setMouzaId(e.target.value)}
                disabled={!upazilaId || loading}
                required
              >
                <option value="">Select Mouza</option>
                {mouzas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name_bn} {m.jl_no ? `(JL: ${m.jl_no})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Survey Type
              </label>
              <select
                className="w-full border rounded p-2"
                value={surveyTypeId}
                onChange={(e) => setSurveyTypeId(e.target.value)}
                required
              >
                <option value="">Select Survey Type</option>
                {surveyTypes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_bn || s.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Khatiyan Number
              </label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={khatiyanNumber}
                onChange={(e) => setKhatiyanNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Dag Number
              </label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={dagNumber}
                onChange={(e) => setDagNumber(e.target.value)}
                required
              />
            </div>

            {khatiyanNumber && dagNumber && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Land Type
                  </label>
                  <select
                    className="w-full border rounded p-2"
                    value={landType}
                    onChange={(e) => setLandType(e.target.value)}
                    required
                  >
                    <option value="">Select Land Type</option>
                    <option value="Agricultural">Agricultural</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Land Area (Square Feet)
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded p-2"
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded p-2 hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Register for Land Tax"}
          </button>
        </form>
      </div>
    </div>
  );
}
