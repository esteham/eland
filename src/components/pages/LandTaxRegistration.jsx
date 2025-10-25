import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../auth/AuthContext";

import LogoPng from "../../assets/images/background.png";

// Simple spinner
function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4A4 4 0 0 0 8 12H4z"
      />
    </svg>
  );
}

// Reusable field wrapper
function Field({ label, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

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
  const [busy, setBusy] = useState(false); // for dependent loads
  const [error, setError] = useState("");
  const mounted = useRef(true);

  //Submit Button
  const formRef = useRef(null);

  // Helpers
  const canShowLandDetails = khatiyanNumber.trim() && dagNumber.trim();

  // ===== Initial Loads =====
  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        setLoading(true);
        const [{ data: divs }, { data: surveys }] = await Promise.all([
          api.get("/locations/divisions"),
          api.get("/locations/survey-types"),
        ]);
        if (!mounted.current) return;
        setDivisions(divs || []);
        setSurveyTypes(surveys || []);
      } catch {
        if (!mounted.current) return;
        setError("Failed to load initial data");
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, []);

  // Division -> Districts
  useEffect(() => {
    if (!divisionId) {
      setDistricts([]);
      setDistrictId("");
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        setBusy(true);
        const { data } = await api.get(
          `/locations/divisions/${divisionId}/districts`,
          { signal: controller.signal }
        );
        if (!mounted.current) return;
        setDistricts(data || []);
      } catch (e) {
        if (
          !mounted.current ||
          e.name === "CanceledError" ||
          e.name === "AbortError"
        )
          return;
        setError("Failed to load districts");
      } finally {
        if (mounted.current) setBusy(false);
      }
    })();
    return () => controller.abort();
  }, [divisionId]);

  // District -> Upazilas
  useEffect(() => {
    if (!districtId) {
      setUpazilas([]);
      setUpazilaId("");
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        setBusy(true);
        const { data } = await api.get(
          `/locations/districts/${districtId}/upazilas`,
          { signal: controller.signal }
        );
        if (!mounted.current) return;
        setUpazilas(data || []);
      } catch (e) {
        if (
          !mounted.current ||
          e.name === "CanceledError" ||
          e.name === "AbortError"
        )
          return;
        setError("Failed to load upazilas");
      } finally {
        if (mounted.current) setBusy(false);
      }
    })();
    return () => controller.abort();
  }, [districtId]);

  // Upazila -> Mouzas
  useEffect(() => {
    if (!upazilaId) {
      setMouzas([]);
      setMouzaId("");
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        setBusy(true);
        const { data } = await api.get(
          `/locations/upazilas/${upazilaId}/mouzas`,
          { signal: controller.signal }
        );
        if (!mounted.current) return;
        setMouzas(data || []);
      } catch (e) {
        if (
          !mounted.current ||
          e.name === "CanceledError" ||
          e.name === "AbortError"
        )
          return;
        setError("Failed to load mouzas");
      } finally {
        if (mounted.current) setBusy(false);
      }
    })();
    return () => controller.abort();
  }, [upazilaId]);

  // Computed labels for summary
  const selectedDivision = useMemo(
    () => divisions.find((d) => String(d.id) === String(divisionId)),
    [divisions, divisionId]
  );
  const selectedDistrict = useMemo(
    () => districts.find((d) => String(d.id) === String(districtId)),
    [districts, districtId]
  );
  const selectedUpazila = useMemo(
    () => upazilas.find((u) => String(u.id) === String(upazilaId)),
    [upazilas, upazilaId]
  );
  const selectedMouza = useMemo(
    () => mouzas.find((m) => String(m.id) === String(mouzaId)),
    [mouzas, mouzaId]
  );
  const selectedSurvey = useMemo(
    () => surveyTypes.find((s) => String(s.id) === String(surveyTypeId)),
    [surveyTypes, surveyTypeId]
  );

  const resetBelow = (level) => {
    if (level === "division") {
      setDistrictId("");
      setUpazilaId("");
      setMouzaId("");
    } else if (level === "district") {
      setUpazilaId("");
      setMouzaId("");
    } else if (level === "upazila") {
      setMouzaId("");
    }
  };

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
        khatiyan_number: khatiyanNumber.trim(),
        dag_number: dagNumber.trim(),
        land_type: landType,
        land_area: landArea,
      });
      alert(data?.message || "Registration submitted");
      nav("/dashboard?tab=ldt", {
        state: { activeTab: "Land Development Tax (LDT)" },
      });

      // Reset form (keep division to speed multiple entries if you want—here full reset)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900 relative overflow-hidden">
      {/* Enhanced background design */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-100/20 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-blue-100/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-emerald-100/10 blur-3xl" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(100,116,139,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,139,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>
      {/* Floating logo watermark - more subtle */}
      <div
        aria-hidden
        className="fixed  h-[100vh] w-[120vw]  hidden xl:block opacity-[0.63]"
        style={{
          backgroundImage: `url(${LogoPng})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative min-h-screen from-slate-50 to-white">
        {/* Sticky header */}

        <div className="sticky top-0 z-10  bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="max-w-6xl mx-auto px-4 py-3 mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Land Tax Registration
                </h1>
                <p className="text-xs text-gray-500">
                  Provide location & record details to register LDT
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {loading && (
                <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <Spinner /> Processing…
                </span>
              )}
              {busy && !loading && (
                <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <Spinner /> Loading options…
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-7 space-y-6 transition"
          >
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Section: Location */}
            <section>
              <h2 className="text-base font-semibold text-gray-900">
                Location
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Select administrative area to locate your land.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Division" required>
                  <select
                    className="w-full border p-1 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    value={divisionId}
                    onChange={(e) => {
                      setDivisionId(e.target.value);
                      resetBelow("division");
                    }}
                    required
                  >
                    <option value="">Select Division</option>
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name_bn || d.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="District" required>
                  <select
                    className="w-full rounded-lg border p-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    value={districtId}
                    onChange={(e) => {
                      setDistrictId(e.target.value);
                      resetBelow("district");
                    }}
                    disabled={!divisionId || loading || busy}
                    required
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name_bn || d.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Upazila" required>
                  <select
                    className="w-full rounded-lg border p-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    value={upazilaId}
                    onChange={(e) => {
                      setUpazilaId(e.target.value);
                      resetBelow("upazila");
                    }}
                    disabled={!districtId || loading || busy}
                    required
                  >
                    <option value="">Select Upazila</option>
                    {upazilas.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name_bn || u.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Mouza"
                  required
                  hint="JL number is shown when available."
                >
                  <select
                    className="w-full rounded-lg border p-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    value={mouzaId}
                    onChange={(e) => setMouzaId(e.target.value)}
                    disabled={!upazilaId || loading || busy}
                    required
                  >
                    <option value="">Select Mouza</option>
                    {mouzas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {(m.name_bn || m.name) +
                          (m.jl_no ? ` (JL: ${m.jl_no})` : "")}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            {/* Section: Record */}
            <section>
              <h2 className="text-base font-semibold text-gray-900">Record</h2>
              <p className="text-sm text-gray-500 mb-4">
                Add survey & record numbers for verification.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Khatiyan Number" required>
                  <input
                    type="text"
                    className="w-full rounded-lg border p-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={khatiyanNumber}
                    onChange={(e) => setKhatiyanNumber(e.target.value)}
                    placeholder="e.g., 12345"
                    required
                  />
                </Field>
                <Field label="Survey Type" required>
                  <select
                    className="w-full rounded-lg border p-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={surveyTypeId}
                    onChange={(e) => setSurveyTypeId(e.target.value)}
                    required
                  >
                    <option value="">Select Survey Type</option>
                    {surveyTypes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code || s.name || `#${s.id}`}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Dag Number" required>
                  <input
                    type="text"
                    className="w-full rounded-lg border p-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={dagNumber}
                    onChange={(e) => setDagNumber(e.target.value)}
                    placeholder="e.g., 6789"
                    required
                  />
                </Field>
              </div>
            </section>

            {/* Section: Land details (conditional) */}
            {canShowLandDetails && (
              <section className="pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">
                    Land Details
                  </h2>
                  <span className="text-xs text-gray-500">
                    Shown because Khatiyan & Dag are provided
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Field label="Land Type" required>
                    <select
                      className="w-full rounded-lg border p-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  </Field>

                  <Field
                    label="Land Area (Square Feet)"
                    required
                    hint="Provide numeric area. Example: 1200"
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border p-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      placeholder="e.g., 1200"
                      required
                    />
                  </Field>
                </div>
              </section>
            )}
          </form>

          {/* Live Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-20 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Division</span>
                  <span className="font-medium">
                    {selectedDivision?.name_bn || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">District</span>
                  <span className="font-medium">
                    {selectedDistrict?.name_bn || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Upazila</span>
                  <span className="font-medium">
                    {selectedUpazila?.name_bn || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Mouza</span>
                  <span className="font-medium">
                    {selectedMouza
                      ? `${selectedMouza.name_bn || selectedMouza.name}${
                          selectedMouza.jl_no
                            ? ` (JL: ${selectedMouza.jl_no})`
                            : ""
                        }`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Survey</span>
                  <span className="font-medium">
                    {selectedSurvey?.code || selectedSurvey?.name || "—"}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Khatiyan</span>
                  <span className="font-medium">{khatiyanNumber || "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Dag</span>
                  <span className="font-medium">{dagNumber || "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Land Type</span>
                  <span className="font-medium">{landType || "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Area (sft)</span>
                  <span className="font-medium">{landArea || "—"}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Tip: You can keep the summary open while filling the form. It
                updates live.
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  onClick={() => formRef.current?.requestSubmit()}
                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl px-4 py-3 font-medium shadow-sm transition disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner className="w-5 h-5" /> Submitting…
                    </>
                  ) : (
                    "Register for Land Tax"
                  )}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
