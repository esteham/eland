import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../auth/AuthContext";

export default function LandExplorer() {
  const nav = useNavigate();
  const { user } = useAuth();

  // Type selection: 'khatiyan' or 'mouza_map'
  const [selectedType, setSelectedType] = useState("khatiyan");

  // Payment states
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

  // Selected IDs
  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [upazilaId, setUpazilaId] = useState("");
  const [mouzaId, setMouzaId] = useState("");
  const [zilId, setZilId] = useState("");
  const [dagId, setDagId] = useState("");
  const [mouzaMapId, setMouzaMapId] = useState("");

  // Survey Types
  const [surveyTypes, setSurveyTypes] = useState([]);
  const [selectedSurveyType, setSelectedSurveyType] = useState("");

  // Details / UI
  const [dagDetail, setDagDetail] = useState(null);
  const [mouzaMapDetail, setMouzaMapDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search (scoped to selected Zil)
  const [search, setSearch] = useState("");

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

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/locations/mouzas/${mouzaId}/zils`);
        setZils(data);
      } catch {
        setError("Failed to load zils");
      } finally {
        setLoading(false);
      }
    })();
  }, [mouzaId]);

  // Zil -> Dags or Mouza Maps
  useEffect(() => {
    setDags([]);
    setDagId("");
    setDagDetail(null);
    setMouzaMaps([]);
    setMouzaMapId("");
    setMouzaMapDetail(null);
    setSearch("");
    if (!zilId) return;

    (async () => {
      try {
        setLoading(true);
        if (selectedType === "khatiyan") {
          let url = `/locations/zils/${zilId}/dags`;
          if (selectedSurveyType) {
            url += `?survey_type_id=${selectedSurveyType}`;
          }
          const { data } = await api.get(url);
          setDags(data);
        } else {
          let url = `/locations/zils/${zilId}/mouza-maps`;
          if (selectedSurveyType) {
            url += `?survey_type_id=${selectedSurveyType}`;
          }
          const { data } = await api.get(url);
          setMouzaMaps(data);
        }
      } catch {
        setError(
          `Failed to load ${
            selectedType === "khatiyan" ? "dags" : "mouza maps"
          }`
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [zilId, selectedType, selectedSurveyType]);

  // Load Survey Types for Zil
  useEffect(() => {
    setSurveyTypes([]);
    setSelectedSurveyType("");
    if (!zilId) return;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(
          `/locations/zils/${zilId}/survey-types?type=${selectedType}`
        );
        setSurveyTypes(data);
      } catch {
        setError("Failed to load survey types");
      } finally {
        setLoading(false);
      }
    })();
  }, [zilId, selectedType]);

  // Dag -> Detail
  useEffect(() => {
    setDagDetail(null);
    if (!dagId) return;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/locations/dags/${dagId}`);
        setDagDetail(data);
      } catch {
        setError("Failed to load dag detail");
      } finally {
        setLoading(false);
      }
    })();
  }, [dagId]);

  // Mouza Map -> Detail
  useEffect(() => {
    setMouzaMapDetail(null);
    if (!mouzaMapId) return;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/locations/mouza-maps/${mouzaMapId}`);
        setMouzaMapDetail(data);
      } catch {
        setError("Failed to load mouza map detail");
      } finally {
        setLoading(false);
      }
    })();
  }, [mouzaMapId]);

  // Reset selections when type changes
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

  // Filter items by search
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return selectedType === "khatiyan" ? dags : mouzaMaps;
    if (selectedType === "khatiyan") {
      return dags.filter((d) => String(d.dag_no).toLowerCase().includes(q));
    } else {
      return mouzaMaps.filter((m) => String(m.name).toLowerCase().includes(q));
    }
  }, [dags, mouzaMaps, search, selectedType]);

  const handleFindItem = () => {
    if (!zilId || !search.trim()) return;
    const q = search.trim().toLowerCase();
    if (selectedType === "khatiyan") {
      const exact = dags.find((d) => String(d.dag_no).toLowerCase() === q);
      if (exact) {
        setDagId(String(exact.id));
        return;
      }
      if (filteredItems.length > 0) setDagId(String(filteredItems[0].id));
    } else {
      const exact = mouzaMaps.find((m) => String(m.name).toLowerCase() === q);
      if (exact) {
        setMouzaMapId(String(exact.id));
        return;
      }
      if (filteredItems.length > 0) setMouzaMapId(String(filteredItems[0].id));
    }
  };

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFindItem();
    }
  };

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
        transaction_id: `TXN-${Date.now()}`, // simple transaction id
      };
      if (selectedType === "khatiyan") {
        applicationData.dag_id = dagDetail.id;
      } else {
        applicationData.mouza_map_id = mouzaMapDetail.id;
      }
      await api.post("/applications", applicationData);
      alert(
        `${
          selectedType === "khatiyan" ? "Khatian" : "Mouza Map"
        } application submitted successfully.`
      );
      // Redirect to dashboard Payments & Receipts tab
      nav("/dashboard?tab=applyKhatian", {
        state: { activeTab: "Payments & Receipts" },
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  const amount = selectedType === "khatiyan" ? 100 : 500;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Land Explorer</h1>

        {/* Type Selection Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Select Type:</label>
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded ${
                  selectedType === "khatiyan"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setSelectedType("khatiyan")}
              >
                Khatian
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  selectedType === "mouza_map"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setSelectedType("mouza_map")}
              >
                Mouza Map
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Two-column layout: Left = Geo selectors, Right = Survey Type + Items + Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Geo Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white border rounded p-4 lg:sticky lg:top-4 space-y-4">
              <h2 className="text-lg font-semibold">Geolocation</h2>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Division
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={divisionId}
                  onChange={(e) => {
                    setDivisionId(e.target.value);
                    setDistrictId("");
                    setUpazilaId("");
                    setMouzaId("");
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

              <div>
                <label className="block text-sm font-medium mb-1">
                  District
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={districtId}
                  onChange={(e) => {
                    setDistrictId(e.target.value);
                    setUpazilaId("");
                    setMouzaId("");
                  }}
                  disabled={!divisionId || loading}
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
                <label className="block text-sm font-medium mb-1">
                  Upazila
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={upazilaId}
                  onChange={(e) => {
                    setUpazilaId(e.target.value);
                    setMouzaId("");
                  }}
                  disabled={!districtId || loading}
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
                  onChange={(e) => {
                    setMouzaId(e.target.value);
                    setZilId("");
                  }}
                  disabled={!upazilaId || loading}
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
                <label className="block text-sm font-medium mb-1">Zil</label>
                <select
                  className="w-full border rounded p-2"
                  value={zilId}
                  onChange={(e) => setZilId(e.target.value)}
                  disabled={!mouzaId || loading}
                >
                  <option value="">Select Zil</option>
                  {zils.map((z) => (
                    <option key={z.id} value={z.id}>
                      Zil {z.zil_no}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* RIGHT: Content */}
          <main className="lg:col-span-2 space-y-8">
            {/* Survey Type Selector */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Survey Type</h2>
              {!zilId ? (
                <p className="text-gray-500">
                  Select a Zil to view survey types.
                </p>
              ) : surveyTypes.length === 0 ? (
                <p className="text-gray-500">No survey types found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                  {surveyTypes.map((st) => (
                    <div
                      key={st.id}
                      className={`border rounded p-1 cursor-pointer hover:shadow ${
                        String(selectedSurveyType) === String(st.id)
                          ? "ring-2 ring-indigo-500"
                          : ""
                      }`}
                      onClick={() => setSelectedSurveyType(String(st.id))}
                    >
                      <div className="font-semibold">{st.code}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Items + Search */}
            <section>
              <h2 className="text-xl font-semibold mb-2">
                {selectedType === "khatiyan" ? "Dags (Plots)" : "Mouza Maps"}
              </h2>
              {!zilId || !selectedSurveyType ? (
                <p className="text-gray-500">
                  Select a Zil and Survey Type to view{" "}
                  {selectedType === "khatiyan" ? "Dags" : "Mouza Maps"}.
                </p>
              ) : (
                <>
                  {/* Search bar */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-3">
                    <input
                      type="text"
                      className="border rounded p-2 w-full md:w-64"
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
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-3 py-2 rounded bg-indigo-600 text-white"
                        onClick={handleFindItem}
                        disabled={!zilId || loading || !search.trim()}
                      >
                        Find
                      </button>
                      {search && (
                        <button
                          type="button"
                          className="px-3 py-2 rounded border"
                          onClick={() => setSearch("")}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 md:ml-2">
                      Showing {filteredItems.length} of{" "}
                      {selectedType === "khatiyan"
                        ? dags.length
                        : mouzaMaps.length}
                    </div>
                  </div>

                  {(selectedType === "khatiyan" ? dags : mouzaMaps).length ===
                  0 ? (
                    <p className="text-gray-500">
                      No {selectedType === "khatiyan" ? "Dags" : "Mouza Maps"}{" "}
                      found.
                    </p>
                  ) : filteredItems.length === 0 ? (
                    <p className="text-gray-500">No matches for "{search}".</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {filteredItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (selectedType === "khatiyan") {
                              setDagId(String(item.id));
                            } else {
                              setMouzaMapId(String(item.id));
                            }
                          }}
                          className={`px-3 py-1 border rounded text-sm ${
                            (selectedType === "khatiyan"
                              ? String(dagId)
                              : String(mouzaMapId)) === String(item.id)
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "hover:bg-gray-50"
                          }`}
                          title={
                            selectedType === "khatiyan"
                              ? `Dag ${item.dag_no}`
                              : `Mouza Map ${item.name}`
                          }
                        >
                          {selectedType === "khatiyan"
                            ? `Dag ${item.dag_no}`
                            : item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Detail */}
            <section>
              <h2 className="text-xl font-semibold mb-2">
                {selectedType === "khatiyan"
                  ? "Khotiyan (Land Record)"
                  : "Mouza Map Detail"}
              </h2>
              {selectedType === "khatiyan" ? (
                !dagId ? (
                  <p className="text-gray-500">
                    Select a Dag to view khotiyan.
                  </p>
                ) : dagDetail ? (
                  <div className="bg-white border rounded p-4 text-sm">
                    <div className="mb-2 text-gray-600">
                      Dag: {dagDetail.dag_no}
                    </div>
                    <pre className="bg-gray-50 p-3 rounded border overflow-auto">
                      {JSON.stringify(dagDetail.khotiyan, null, 2)}
                    </pre>
                    {dagDetail.document_url && (
                      <div className="mt-2 flex gap-3">
                        <a
                          className="text-blue-600 underline"
                          href={dagDetail.document_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Document
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
                    {/* Khatian Application Submission */}
                    <div className="mt-4">
                      <button
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                        onClick={() => {
                          if (!user) {
                            // Redirect to login page
                            alert("Please login first and then apply");
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
                  <div className="text-gray-500">Loading...</div>
                )
              ) : !mouzaMapId ? (
                <p className="text-gray-500">
                  Select a Mouza Map to view details.
                </p>
              ) : mouzaMapDetail ? (
                <div className="bg-white border rounded p-4 text-sm">
                  <div className="mb-2 text-gray-600">
                    Mouza Map: {mouzaMapDetail.name}
                  </div>
                  <div className="mt-4">
                    <button
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                      onClick={() => {
                        if (!user) {
                          // Redirect to login page
                          alert("Please login first and then apply");
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
                  {/* Mouza Map Application Submission */}
                </div>
              ) : (
                <div className="text-gray-500">Loading...</div>
              )}
              {showPaymentSelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                    <div className="mb-3">
                      <p>You paid for </p>
                      <div className="mb-2 text-gray-600">
                        {selectedType === "khatiyan"
                          ? `Dag: ${dagDetail.dag_no}`
                          : `Mouza Map: ${mouzaMapDetail.name}`}
                      </div>
                      <p>Amount : {amount}</p>
                    </div>
                    <h3 className="text-lg font-semibold mb-4">
                      Select Payment Method for Payment
                    </h3>
                    <div className="space-y-2">
                      <button
                        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => {
                          setSelectedPaymentMethod("bKash");
                          setPaymentErrors({});
                        }}
                      >
                        bKash
                      </button>
                      <button
                        className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                        onClick={() => {
                          setSelectedPaymentMethod("Nagad");
                          setPaymentErrors({});
                        }}
                      >
                        Nagad
                      </button>
                      <button
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => {
                          setSelectedPaymentMethod("Online");
                          setPaymentErrors({});
                        }}
                      >
                        Online (Card/Bank)
                      </button>
                    </div>
                    {selectedPaymentMethod && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">
                          Enter {selectedPaymentMethod} Details
                        </h4>
                        {selectedPaymentMethod === "bKash" ||
                        selectedPaymentMethod === "Nagad" ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Phone Number"
                              className="w-full border rounded p-2"
                              value={paymentCredentials.phone || ""}
                              onChange={(e) =>
                                setPaymentCredentials({
                                  ...paymentCredentials,
                                  phone: e.target.value,
                                })
                              }
                            />
                            {paymentErrors.phone && (
                              <p className="text-red-500 text-sm">
                                {paymentErrors.phone}
                              </p>
                            )}
                            <input
                              type="password"
                              placeholder="PIN"
                              className="w-full border rounded p-2"
                              value={paymentCredentials.pin || ""}
                              onChange={(e) =>
                                setPaymentCredentials({
                                  ...paymentCredentials,
                                  pin: e.target.value,
                                })
                              }
                            />
                            {paymentErrors.pin && (
                              <p className="text-red-500 text-sm">
                                {paymentErrors.pin}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Card Number"
                              className="w-full border rounded p-2"
                              value={paymentCredentials.cardNumber || ""}
                              onChange={(e) =>
                                setPaymentCredentials({
                                  ...paymentCredentials,
                                  cardNumber: e.target.value,
                                })
                              }
                            />
                            {paymentErrors.cardNumber && (
                              <p className="text-red-500 text-sm">
                                {paymentErrors.cardNumber}
                              </p>
                            )}
                            <input
                              type="text"
                              placeholder="Expiry (MM/YY)"
                              className="w-full border rounded p-2"
                              value={paymentCredentials.expiry || ""}
                              onChange={(e) =>
                                setPaymentCredentials({
                                  ...paymentCredentials,
                                  expiry: e.target.value,
                                })
                              }
                            />
                            {paymentErrors.expiry && (
                              <p className="text-red-500 text-sm">
                                {paymentErrors.expiry}
                              </p>
                            )}
                            <input
                              type="password"
                              placeholder="CVV"
                              className="w-full border rounded p-2"
                              value={paymentCredentials.cvv || ""}
                              onChange={(e) =>
                                setPaymentCredentials({
                                  ...paymentCredentials,
                                  cvv: e.target.value,
                                })
                              }
                            />
                            {paymentErrors.cvv && (
                              <p className="text-red-500 text-sm">
                                {paymentErrors.cvv}
                              </p>
                            )}
                          </div>
                        )}
                        <div className="mt-4 flex gap-2">
                          <button
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            onClick={() => {
                              setPaymentErrors({});
                              // Validation
                              if (
                                selectedPaymentMethod === "bKash" ||
                                selectedPaymentMethod === "Nagad"
                              ) {
                                if (
                                  !/^01\d{9}$/.test(paymentCredentials.phone)
                                ) {
                                  setPaymentErrors({
                                    phone: "Please inter a valid phone number",
                                  });
                                  return;
                                }
                                if (!/^\d{4,5}$/.test(paymentCredentials.pin)) {
                                  setPaymentErrors({
                                    pin: "PIN must be 4-5 digits.",
                                  });
                                  return;
                                }
                              } else {
                                if (
                                  !/^\d{1,13}$/.test(
                                    paymentCredentials.cardNumber
                                  )
                                ) {
                                  setPaymentErrors({
                                    cardNumber:
                                      "Please provide a valid card number",
                                  });
                                  return;
                                }
                                if (!/^\d{3}$/.test(paymentCredentials.cvv)) {
                                  setPaymentErrors({
                                    cvv: "Please input correct CVV number",
                                  });
                                  return;
                                }
                              }
                              // Mock confirmation
                              let payerIdentifier = "";
                              if (
                                selectedPaymentMethod === "bKash" ||
                                selectedPaymentMethod === "Nagad"
                              ) {
                                if (
                                  !paymentCredentials.phone ||
                                  !paymentCredentials.pin
                                ) {
                                  alert("Please fill all fields");
                                  return;
                                }
                                payerIdentifier = paymentCredentials.phone;
                              } else {
                                if (
                                  !paymentCredentials.cardNumber ||
                                  !paymentCredentials.expiry ||
                                  !paymentCredentials.cvv
                                ) {
                                  alert("Please fill all fields");
                                  return;
                                }
                                payerIdentifier = paymentCredentials.cardNumber;
                              }
                              alert("Payment successful!");
                              // Close modal
                              setShowPaymentSelector(false);
                              setSelectedPaymentMethod("");
                              setPaymentCredentials({});
                              // Submit application
                              handleSubmitApplication(
                                amount,
                                selectedPaymentMethod,
                                payerIdentifier
                              );
                            }}
                            disabled={loading}
                          >
                            Pay BDT {amount}
                          </button>
                          <button
                            className="px-4 py-2 bg-gray-500 text-white rounded"
                            onClick={() => {
                              setShowPaymentSelector(false);
                              setSelectedPaymentMethod("");
                              setPaymentCredentials({});
                              setPaymentErrors({});
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
