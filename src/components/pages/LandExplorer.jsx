import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../auth/AuthContext";
import { Map, SquareGanttChart, Search, X } from "lucide-react";

import khatiyanImg from "../../assets/images/khatiyan.png";
import mouzaMapImg from "../../assets/images/mouza-map.png";
import LogoPng from "../../assets/images/background.png";

// ---------- UI helpers ----------
const Spinner = ({ className = "w-4 h-4" }) => (
  <svg
    className={`animate-spin ${className}`}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
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

const Chip = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full border text-sm transition ${
      active ? "bg-indigo-600 text-white border-indigo-600" : "hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border rounded-2xl shadow-sm ${className}`}>
    {children}
  </div>
);

// Debounce hook
const useDebounced = (value, delay = 350) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

// ---------- Component ----------
export default function LandExplorer() {
  const nav = useNavigate();
  const { user } = useAuth();
  const mounted = useRef(true);

  // Type selection: 'khatiyan' or 'mouza_map'
  const [selectedType, setSelectedType] = useState("khatiyan");

  // Payment
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentCredentials, setPaymentCredentials] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});

  // Collections
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [mouzas, setMouzas] = useState([]);
  const [zils, setZils] = useState([]);
  const [dags, setDags] = useState([]);
  const [mouzaMaps, setMouzaMaps] = useState([]);

  // Selected
  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [upazilaId, setUpazilaId] = useState("");
  const [mouzaId, setMouzaId] = useState("");
  const [zilId, setZilId] = useState("");
  const [dagId, setDagId] = useState("");
  const [mouzaMapId, setMouzaMapId] = useState("");

  // Survey
  const [surveyTypes, setSurveyTypes] = useState([]);
  const [selectedSurveyType, setSelectedSurveyType] = useState("");

  // Detail/UI
  const [dagDetail, setDagDetail] = useState(null);
  const [mouzaMapDetail, setMouzaMapDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 300);

  // Amount
  const amount = selectedType === "khatiyan" ? 100 : 500;

  // ---------- Data loads ----------
  useEffect(() => {
    mounted.current = true;
    const load = async () => {
      try {
        setLoading(true);
        const [{ data: divs }] = await Promise.all([
          api.get("/locations/divisions"),
        ]);
        if (!mounted.current) return;
        setDivisions(divs || []);
      } catch {
        if (!mounted.current) return;
        setError("Failed to load divisions");
      } finally {
        mounted.current && setLoading(false);
      }
    };
    load();
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
    const ctl = new AbortController();
    (async () => {
      try {
        setBusy(true);
        const { data } = await api.get(
          `/locations/divisions/${divisionId}/districts`,
          { signal: ctl.signal }
        );
        if (!mounted.current) return;
        setDistricts(data || []);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError")
          setError("Failed to load districts");
      } finally {
        mounted.current && setBusy(false);
      }
    })();
    return () => ctl.abort();
  }, [divisionId]);

  // District -> Upazilas
  useEffect(() => {
    if (!districtId) {
      setUpazilas([]);
      setUpazilaId("");
      return;
    }
    const ctl = new AbortController();
    (async () => {
      try {
        setBusy(true);
        const { data } = await api.get(
          `/locations/districts/${districtId}/upazilas`,
          { signal: ctl.signal }
        );
        if (!mounted.current) return;
        setUpazilas(data || []);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError")
          setError("Failed to load upazilas");
      } finally {
        mounted.current && setBusy(false);
      }
    })();
    return () => ctl.abort();
  }, [districtId]);

  // Upazila -> Mouzas
  useEffect(() => {
    if (!upazilaId) {
      setMouzas([]);
      setMouzaId("");
      return;
    }
    const ctl = new AbortController();
    (async () => {
      try {
        setBusy(true);
        const { data } = await api.get(
          `/locations/upazilas/${upazilaId}/mouzas`,
          { signal: ctl.signal }
        );
        if (!mounted.current) return;
        setMouzas(data || []);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError")
          setError("Failed to load mouzas");
      } finally {
        mounted.current && setBusy(false);
      }
    })();
    return () => ctl.abort();
  }, [upazilaId]);

  // Mouza -> Zils
  useEffect(() => {
    setZils([]);
    setZilId("");
    setDags([]);
    setDagId("");
    setDagDetail(null);
    setMouzaMaps([]);
    setMouzaMapId("");
    setMouzaMapDetail(null);
    setSearch("");
    if (!mouzaId) return;

    const ctl = new AbortController();
    (async () => {
      try {
        setBusy(true);
        const { data } = await api.get(`/locations/mouzas/${mouzaId}/zils`, {
          signal: ctl.signal,
        });
        if (!mounted.current) return;
        setZils(data || []);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError")
          setError("Failed to load zils");
      } finally {
        mounted.current && setBusy(false);
      }
    })();
    return () => ctl.abort();
  }, [mouzaId]);

  // Zil -> Dags or Mouza Maps
  useEffect(() => {
    setDags([]);
    setDagId("");
    setDagDetail(null);
    setMouzaMaps([]);
    setMouzaMapId("");
    setMouzaMapDetail(null);
    if (!zilId) return;

    const ctl = new AbortController();
    (async () => {
      try {
        setBusy(true);
        if (selectedType === "khatiyan") {
          let url = `/locations/zils/${zilId}/dags`;
          if (selectedSurveyType)
            url += `?survey_type_id=${selectedSurveyType}`;
          const { data } = await api.get(url, { signal: ctl.signal });
          if (!mounted.current) return;
          setDags(data || []);
        } else {
          let url = `/locations/zils/${zilId}/mouza-maps`;
          if (selectedSurveyType)
            url += `?survey_type_id=${selectedSurveyType}`;
          const { data } = await api.get(url, { signal: ctl.signal });
          if (!mounted.current) return;
          setMouzaMaps(data || []);
        }
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError") {
          setError(
            `Failed to load ${
              selectedType === "khatiyan" ? "dags" : "mouza maps"
            }`
          );
        }
      } finally {
        mounted.current && setBusy(false);
      }
    })();
    return () => ctl.abort();
  }, [zilId, selectedType, selectedSurveyType]);

  // Survey types for Zil
  useEffect(() => {
    setSurveyTypes([]);
    setSelectedSurveyType("");
    if (!zilId) return;

    const ctl = new AbortController();
    (async () => {
      try {
        setBusy(true);
        const { data } = await api.get(
          `/locations/zils/${zilId}/survey-types?type=${selectedType}`,
          { signal: ctl.signal }
        );
        if (!mounted.current) return;
        setSurveyTypes(data || []);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError")
          setError("Failed to load survey types");
      } finally {
        mounted.current && setBusy(false);
      }
    })();
    return () => ctl.abort();
  }, [zilId, selectedType]);

  // Dag -> detail
  useEffect(() => {
    setDagDetail(null);
    if (!dagId) return;

    const ctl = new AbortController();
    (async () => {
      try {
        setBusy(true);
        const { data } = await api.get(`/locations/dags/${dagId}`, {
          signal: ctl.signal,
        });
        if (!mounted.current) return;
        setDagDetail(data || null);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError")
          setError("Failed to load dag detail");
      } finally {
        mounted.current && setBusy(false);
      }
    })();
    return () => ctl.abort();
  }, [dagId]);

  // Mouza Map -> detail
  useEffect(() => {
    setMouzaMapDetail(null);
    if (!mouzaMapId) return;

    const ctl = new AbortController();
    (async () => {
      try {
        setBusy(true);
        const { data } = await api.get(`/locations/mouza-maps/${mouzaMapId}`, {
          signal: ctl.signal,
        });
        if (!mounted.current) return;
        setMouzaMapDetail(data || null);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError")
          setError("Failed to load mouza map detail");
      } finally {
        mounted.current && setBusy(false);
      }
    })();
    return () => ctl.abort();
  }, [mouzaMapId]);

  // Reset on type change
  useEffect(() => {
    setDags([]);
    setDagId("");
    setDagDetail(null);
    setMouzaMaps([]);
    setMouzaMapId("");
    setMouzaMapDetail(null);
    setSearch("");
    setSelectedSurveyType("");
  }, [selectedType]);

  // Filter items
  const filteredItems = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return selectedType === "khatiyan" ? dags : mouzaMaps;
    if (selectedType === "khatiyan") {
      return (dags || []).filter((d) =>
        String(d.dag_no).toLowerCase().includes(q)
      );
    }
    return (mouzaMaps || []).filter((m) =>
      String(m.name).toLowerCase().includes(q)
    );
  }, [debouncedSearch, dags, mouzaMaps, selectedType]);

  const handleFindItem = () => {
    if (!zilId || !debouncedSearch.trim()) return;
    const q = debouncedSearch.trim().toLowerCase();
    if (selectedType === "khatiyan") {
      const exact = dags.find((d) => String(d.dag_no).toLowerCase() === q);
      if (exact) return setDagId(String(exact.id));
      if (filteredItems.length > 0) setDagId(String(filteredItems[0].id));
    } else {
      const exact = mouzaMaps.find((m) => String(m.name).toLowerCase() === q);
      if (exact) return setMouzaMapId(String(exact.id));
      if (filteredItems.length > 0) setMouzaMapId(String(filteredItems[0].id));
    }
  };

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFindItem();
    }
  };

  // Submit application
  const handleSubmitApplication = async (
    feeAmount,
    paymentMethod,
    payerIdentifier
  ) => {
    try {
      setLoading(true);
      setError("");
      const applicationData = {
        type:
          selectedType === "khatiyan" ? "khatian_request" : "mouza_map_request",
        description:
          selectedType === "khatiyan"
            ? "User submitted a Khatian application"
            : "User submitted a Mouza Map application",
        fee_amount: feeAmount,
        payment_status: "paid",
        payment_method: paymentMethod,
        payer_identifier: payerIdentifier,
        transaction_id: `TXN-${Date.now()}`,
        ...(selectedType === "khatiyan"
          ? { dag_id: dagDetail.id }
          : { mouza_map_id: mouzaMapDetail.id }),
      };
      await api.post("/applications", applicationData);
      alert(
        `${
          selectedType === "khatiyan" ? "Khatian" : "Mouza Map"
        } application submitted.`
      );
      nav("/dashboard?tab=applyKhatian", {
        state: { activeTab: "Payments & Receipts" },
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
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
        className="fixed  h-[100vh] w-[120vw]  hidden xl:block opacity-[0.40]"
        style={{
          backgroundImage: `url(${LogoPng})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="min-h-screen relative">
        {/* Decorative backdrop (right) */}
        <div
          className="fixed top-14 right-0 h-[88vh] w-2/5 hidden md:block z-[1]"
          style={{
            backgroundImage: `url(${
              selectedType === "khatiyan" ? mouzaMapImg : khatiyanImg
            })`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundColor: "transparent",
            transition: "background-image 900ms ease-in-out",
            filter: "brightness(.98)",
            // pointerEvents: "none",
          }}
          aria-hidden="true"
        />

        {/* Main content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          {/* Type selector */}
          <Card className="p-4 mb-6 w-200">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedType("khatiyan")}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border transition ${
                  selectedType === "khatiyan"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <SquareGanttChart className="h-5 w-5" />
                Khatian
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("mouza_map")}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border transition ${
                  selectedType === "mouza_map"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <Map className="h-5 w-5" />
                Mouza Map
              </button>

              <div className="ml-auto text-sm text-gray-600 flex items-center gap-2">
                {(loading || busy) && (
                  <>
                    <Spinner /> {loading ? "Processing…" : "Loading options…"}
                  </>
                )}
              </div>
            </div>
          </Card>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {/* 3-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Geo */}
            <aside className="lg:col-span-1">
              <Card className="p-5 lg:sticky lg:top-6 space-y-4">
                <h2 className="text-base font-semibold">Geolocation</h2>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Division</label>
                  <select
                    className="w-full rounded-lg border p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={divisionId}
                    onChange={(e) => {
                      setDivisionId(e.target.value);
                      setDistrictId("");
                      setUpazilaId("");
                      setMouzaId("");
                      setZilId("");
                    }}
                  >
                    <option value="">Select Division</option>
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name_bn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">District</label>
                  <select
                    className="w-full rounded-lg border p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    value={districtId}
                    onChange={(e) => {
                      setDistrictId(e.target.value);
                      setUpazilaId("");
                      setMouzaId("");
                      setZilId("");
                    }}
                    disabled={!divisionId || loading || busy}
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name_bn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Upazila</label>
                  <select
                    className="w-full rounded-lg border p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    value={upazilaId}
                    onChange={(e) => {
                      setUpazilaId(e.target.value);
                      setMouzaId("");
                      setZilId("");
                    }}
                    disabled={!districtId || loading || busy}
                  >
                    <option value="">Select Upazila</option>
                    {upazilas.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name_bn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Mouza</label>
                  <select
                    className="w-full rounded-lg border p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    value={mouzaId}
                    onChange={(e) => {
                      setMouzaId(e.target.value);
                      setZilId("");
                    }}
                    disabled={!upazilaId || loading || busy}
                  >
                    <option value="">Select Mouza</option>
                    {mouzas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name_bn} {m.jl_no ? `(JL: ${m.jl_no})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Zil</label>
                  <select
                    className="w-full rounded-lg border p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    value={zilId}
                    onChange={(e) => setZilId(e.target.value)}
                    disabled={!mouzaId || loading || busy}
                  >
                    <option value="">Select Zil</option>
                    {zils.map((z) => (
                      <option key={z.id} value={z.id}>
                        Zil {z.zil_no}
                      </option>
                    ))}
                  </select>
                </div>
              </Card>
            </aside>

            {/* RIGHT: Main */}
            <main className="w-90 space-y-8">
              {/* Survey types */}
              <Card className="p-5">
                <h2 className="text-base font-semibold mb-3">Survey Type</h2>
                {!zilId ? (
                  <p className="text-gray-500">
                    Select a Zil to view survey types.
                  </p>
                ) : surveyTypes.length === 0 ? (
                  <p className="text-gray-500">No survey types found.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {surveyTypes.map((st) => (
                      <Chip
                        key={st.id}
                        active={String(selectedSurveyType) === String(st.id)}
                        onClick={() => setSelectedSurveyType(String(st.id))}
                      >
                        {st.code || st.name || `#${st.id}`}
                      </Chip>
                    ))}
                  </div>
                )}
              </Card>

              {/* Items + search */}
              <Card className="p-5">
                {!zilId || !selectedSurveyType ? (
                  <p className="text-gray-500">
                    Select a Zil and Survey Type to view{" "}
                    {selectedType === "khatiyan" ? "Dags" : "Mouza Maps"}.
                  </p>
                ) : (
                  <>
                    {/* header with H2 and search bar */}
                    <div className="flex flex-col  md:flex-row items-start md:items-center justify-between gap-2 mb-4">
                      <div>
                        <h2 className="text-base font-semibold">
                          {selectedType === "khatiyan"
                            ? "Dags (Plots)"
                            : "Mouza Maps"}
                        </h2>
                        <span className="text-xs text-gray-500">
                          Showing {filteredItems.length} of{" "}
                          {selectedType === "khatiyan"
                            ? dags?.length || 0
                            : mouzaMaps?.length || 0}
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
                        <div className="relative md:w-30">
                          <input
                            type="text"
                            className="w-full rounded-lg border p-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-9"
                            placeholder={
                              selectedType === "khatiyan"
                                ? "Search dag no (e.g., 123)"
                                : "Search mouza map name"
                            }
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={onSearchKeyDown}
                            disabled={!zilId || loading}
                          />
                          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          {search && (
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setSearch("")}
                              aria-label="Clear search"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* chips list */}
                    {(selectedType === "khatiyan" ? dags : mouzaMaps).length ===
                    0 ? (
                      <p className="text-gray-500">No items found.</p>
                    ) : filteredItems.length === 0 ? (
                      <p className="text-gray-500">
                        No matches for “{debouncedSearch}”.
                      </p>
                    ) : selectedType === "khatiyan" ? (
                      <select
                        className="w-full rounded-lg border p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={dagId}
                        onChange={(e) => setDagId(e.target.value)}
                      >
                        <option value="">Select Dag</option>
                        {filteredItems.map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            Dag {item.dag_no}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {filteredItems.map((item) => {
                          const active = String(mouzaMapId) === String(item.id);
                          return (
                            <Chip
                              key={item.id}
                              active={active}
                              onClick={() => setMouzaMapId(String(item.id))}
                            >
                              {item.name}
                            </Chip>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </Card>

              {/* Details */}
              <Card className="p-5">
                <h2 className="text-base font-semibold mb-3">
                  {selectedType === "khatiyan"
                    ? "Khatiyan (Land Record)"
                    : "Mouza Map Detail"}
                </h2>

                {selectedType === "khatiyan" ? (
                  !dagId ? (
                    <p className="text-gray-500">
                      Select a Dag to view khatiyan.
                    </p>
                  ) : dagDetail ? (
                    <div className="space-y-3">
                      <div className="text-gray-600">
                        Dag: {dagDetail.dag_no}
                      </div>
                      <pre className="bg-gray-50 p-3 rounded-xl border overflow-auto text-sm">
                        {JSON.stringify(dagDetail.khotiyan, null, 2)}
                      </pre>
                      {dagDetail.document_url && (
                        <div className="flex gap-4">
                          <a
                            className="text-blue-600 underline"
                            href={dagDetail.document_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                          <a
                            className="text-green-600 underline"
                            href={dagDetail.document_url}
                            download
                          >
                            Download
                          </a>
                        </div>
                      )}
                      <div>
                        <button
                          className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                          onClick={() => {
                            if (!user) {
                              alert("Please login first");
                              nav("/login");
                              return;
                            }
                            setShowPaymentSelector(true);
                          }}
                          disabled={loading}
                        >
                          Submit Khatian Application
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 text-gray-500">
                      <Spinner /> Loading…
                    </div>
                  )
                ) : !mouzaMapId ? (
                  <p className="text-gray-500">
                    Select a Mouza Map to view details.
                  </p>
                ) : mouzaMapDetail ? (
                  <div className="space-y-3">
                    <div className="text-gray-600">
                      Mouza Map: {mouzaMapDetail.name}
                    </div>
                    <button
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                      onClick={() => {
                        if (!user) {
                          alert("Please login first");
                          nav("/login");
                          return;
                        }
                        setShowPaymentSelector(true);
                      }}
                      disabled={loading}
                    >
                      Submit Mouza Map Application
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 text-gray-500">
                    <Spinner /> Loading…
                  </div>
                )}
              </Card>
            </main>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentSelector && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
            <Card className="w-full max-w-md p-6">
              <div className="mb-3">
                <p className="text-sm text-gray-600">You are paying for</p>
                <div className="mt-1 text-gray-800 font-medium">
                  {selectedType === "khatiyan"
                    ? `Dag: ${dagDetail?.dag_no ?? ""}`
                    : `Mouza Map: ${mouzaMapDetail?.name ?? ""}`}
                </div>
                <p className="text-sm text-gray-600">
                  Amount: <span className="font-semibold">BDT {amount}</span>
                </p>
              </div>

              <h3 className="text-base font-semibold mb-3">
                Select Payment Method
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {["bKash", "Nagad", "Online"].map((m) => (
                  <button
                    key={m}
                    className={`rounded-lg px-3 py-2 border text-sm transition ${
                      selectedPaymentMethod === m
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedPaymentMethod(m);
                      setPaymentErrors({});
                    }}
                  >
                    {m === "Online" ? "Online (Card)" : m}
                  </button>
                ))}
              </div>

              {selectedPaymentMethod && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    Enter {selectedPaymentMethod} Details
                  </h4>

                  {selectedPaymentMethod === "bKash" ||
                  selectedPaymentMethod === "Nagad" ? (
                    <>
                      <input
                        type="text"
                        placeholder="Phone Number (01XXXXXXXXX)"
                        className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={paymentCredentials.phone || ""}
                        onChange={(e) =>
                          setPaymentCredentials({
                            ...paymentCredentials,
                            phone: e.target.value,
                          })
                        }
                      />
                      {paymentErrors.phone && (
                        <p className="text-red-600 text-sm">
                          {paymentErrors.phone}
                        </p>
                      )}
                      <input
                        type="password"
                        placeholder="PIN (4-5 digits)"
                        className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={paymentCredentials.pin || ""}
                        onChange={(e) =>
                          setPaymentCredentials({
                            ...paymentCredentials,
                            pin: e.target.value,
                          })
                        }
                      />
                      {paymentErrors.pin && (
                        <p className="text-red-600 text-sm">
                          {paymentErrors.pin}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Card Number"
                        className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={paymentCredentials.cardNumber || ""}
                        onChange={(e) =>
                          setPaymentCredentials({
                            ...paymentCredentials,
                            cardNumber: e.target.value,
                          })
                        }
                      />
                      {paymentErrors.cardNumber && (
                        <p className="text-red-600 text-sm">
                          {paymentErrors.cardNumber}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Expiry (MM/YY)"
                          className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          value={paymentCredentials.expiry || ""}
                          onChange={(e) =>
                            setPaymentCredentials({
                              ...paymentCredentials,
                              expiry: e.target.value,
                            })
                          }
                        />
                        <input
                          type="password"
                          placeholder="CVV"
                          className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          value={paymentCredentials.cvv || ""}
                          onChange={(e) =>
                            setPaymentCredentials({
                              ...paymentCredentials,
                              cvv: e.target.value,
                            })
                          }
                        />
                      </div>
                      {paymentErrors.expiry && (
                        <p className="text-red-600 text-sm">
                          {paymentErrors.expiry}
                        </p>
                      )}
                      {paymentErrors.cvv && (
                        <p className="text-red-600 text-sm">
                          {paymentErrors.cvv}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                  onClick={() => {
                    setShowPaymentSelector(false);
                    setSelectedPaymentMethod("");
                    setPaymentCredentials({});
                    setPaymentErrors({});
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                  onClick={() => {
                    setPaymentErrors({});
                    if (!selectedPaymentMethod) return;

                    if (
                      selectedPaymentMethod === "bKash" ||
                      selectedPaymentMethod === "Nagad"
                    ) {
                      if (!/^01\d{9}$/.test(paymentCredentials.phone || "")) {
                        setPaymentErrors({
                          phone: "Please enter a valid phone number",
                        });
                        return;
                      }
                      if (!/^\d{4,5}$/.test(paymentCredentials.pin || "")) {
                        setPaymentErrors({ pin: "PIN must be 4-5 digits." });
                        return;
                      }
                      const payer = paymentCredentials.phone;
                      alert("Payment successful!");
                      setShowPaymentSelector(false);
                      setSelectedPaymentMethod("");
                      setPaymentCredentials({});
                      handleSubmitApplication(
                        amount,
                        selectedPaymentMethod,
                        payer
                      );
                      return;
                    }

                    // Online
                    if (
                      !/^\d{12,19}$/.test(
                        (paymentCredentials.cardNumber || "").replace(
                          /\s+/g,
                          ""
                        )
                      )
                    ) {
                      setPaymentErrors({
                        cardNumber: "Please provide a valid card number",
                      });
                      return;
                    }
                    if (
                      !/^\d{2}\/\d{2}$/.test(paymentCredentials.expiry || "")
                    ) {
                      setPaymentErrors({ expiry: "Use MM/YY format" });
                      return;
                    }
                    if (!/^\d{3}$/.test(paymentCredentials.cvv || "")) {
                      setPaymentErrors({ cvv: "Invalid CVV" });
                      return;
                    }
                    const payer = paymentCredentials.cardNumber;
                    alert("Payment successful!");
                    setShowPaymentSelector(false);
                    setSelectedPaymentMethod("");
                    setPaymentCredentials({});
                    handleSubmitApplication(amount, "Online", payer);
                  }}
                  disabled={loading || !selectedPaymentMethod}
                >
                  Pay BDT {amount}
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
