import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../auth/AuthContext";

export default function LandExplorer() {
  const nav = useNavigate();
  const { user } = useAuth();

  // Payment states
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentCredentials, setPaymentCredentials] = useState({});

  // Collections
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [mouzas, setMouzas] = useState([]);
  const [zils, setZils] = useState([]);
  const [dags, setDags] = useState([]);

  // Selected IDs
  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [upazilaId, setUpazilaId] = useState("");
  const [mouzaId, setMouzaId] = useState("");
  const [zilId, setZilId] = useState("");
  const [dagId, setDagId] = useState("");

  // Details / UI
  const [dagDetail, setDagDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dag search (scoped to selected Zil)
  const [dagSearch, setDagSearch] = useState("");

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
    setDagSearch("");
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

  // Zil -> Dags
  useEffect(() => {
    setDags([]);
    setDagId("");
    setDagDetail(null);
    setDagSearch("");
    if (!zilId) return;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/locations/zils/${zilId}/dags`);
        setDags(data);
      } catch {
        setError("Failed to load dags");
      } finally {
        setLoading(false);
      }
    })();
  }, [zilId]);

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

  // Filter dags by search
  const filteredDags = useMemo(() => {
    const q = dagSearch.trim().toLowerCase();
    if (!q) return dags;
    return dags.filter((d) => String(d.dag_no).toLowerCase().includes(q));
  }, [dags, dagSearch]);

  const handleFindDag = () => {
    if (!zilId || !dagSearch.trim()) return;
    const q = dagSearch.trim().toLowerCase();
    const exact = dags.find((d) => String(d.dag_no).toLowerCase() === q);
    if (exact) {
      setDagId(String(exact.id));
      return;
    }
    if (filteredDags.length > 0) setDagId(String(filteredDags[0].id));
  };

  const onDagSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFindDag();
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
      await api.post("/applications", {
        dag_id: dagDetail.id,
        type: "khatian_request",
        description: "User submitted a Khatian application",
        fee_amount: feeAmount,
        payment_status: "paid",
        payment_method: paymentMethod,
        payer_identifier: payerIdentifier,
        transaction_id: `TXN-${Date.now()}`, // simple transaction id
      });
      alert("Khatian application submitted successfully.");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Land Explorer</h1>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Two-column layout: Left = Geo selectors, Right = Zils + Dags + Detail */}
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
                  onChange={(e) => setMouzaId(e.target.value)}
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
            </div>
          </aside>

          {/* RIGHT: Content */}
          <main className="lg:col-span-2 space-y-8">
            {/* Zils */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Zils (Map/Zone)</h2>
              {!mouzaId ? (
                <p className="text-gray-500">Select a Mouza to view Zils.</p>
              ) : zils.length === 0 ? (
                <p className="text-gray-500">No Zils found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {zils.map((z) => (
                    <div
                      key={z.id}
                      className={`border rounded p-3 cursor-pointer hover:shadow ${
                        String(zilId) === String(z.id)
                          ? "ring-2 ring-indigo-500"
                          : ""
                      }`}
                      onClick={() => setZilId(String(z.id))}
                    >
                      <div className="font-semibold">Zil: {z.zil_no}</div>
                      {z.map_url ? (
                        <img
                          src={z.map_url}
                          alt={`Zil ${z.zil_no} map`}
                          className="mt-2 w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="mt-2 text-xs text-gray-500">No map</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Dags + Search */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Dags (Plots)</h2>
              {!zilId ? (
                <p className="text-gray-500">Select a Zil to view Dags.</p>
              ) : (
                <>
                  {/* Search bar */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-3">
                    <input
                      type="text"
                      className="border rounded p-2 w-full md:w-64"
                      placeholder="Search dag no (e.g., 123)"
                      value={dagSearch}
                      onChange={(e) => setDagSearch(e.target.value)}
                      onKeyDown={onDagSearchKeyDown}
                      disabled={!zilId || loading}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-3 py-2 rounded bg-indigo-600 text-white"
                        onClick={handleFindDag}
                        disabled={!zilId || loading || !dagSearch.trim()}
                      >
                        Find
                      </button>
                      {dagSearch && (
                        <button
                          type="button"
                          className="px-3 py-2 rounded border"
                          onClick={() => setDagSearch("")}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 md:ml-2">
                      Showing {filteredDags.length} of {dags.length}
                    </div>
                  </div>

                  {dags.length === 0 ? (
                    <p className="text-gray-500">No Dags found.</p>
                  ) : filteredDags.length === 0 ? (
                    <p className="text-gray-500">
                      No matches for "{dagSearch}".
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {filteredDags.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setDagId(String(d.id))}
                          className={`px-3 py-1 border rounded text-sm ${
                            String(dagId) === String(d.id)
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "hover:bg-gray-50"
                          }`}
                          title={`Dag ${d.dag_no}`}
                        >
                          Dag {d.dag_no}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Dag Detail */}
            <section>
              <h2 className="text-xl font-semibold mb-2">
                Khotiyan (Land Record)
              </h2>
              {!dagId ? (
                <p className="text-gray-500">Select a Dag to view khotiyan.</p>
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
                  {showPaymentSelector && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <div className="mb-3">
                          <p>You paid for </p>
                          <div className="mb-2 text-gray-600">
                            Dag: {dagDetail.dag_no}
                          </div>
                          <p>Ammount : 200</p>
                        </div>
                        <h3 className="text-lg font-semibold mb-4">
                          Select Payment Method for Paymnet
                        </h3>
                        <div className="space-y-2">
                          <button
                            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            onClick={() => setSelectedPaymentMethod("bKash")}
                          >
                            bKash
                          </button>
                          <button
                            className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                            onClick={() => setSelectedPaymentMethod("Nagad")}
                          >
                            Nagad
                          </button>
                          <button
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => setSelectedPaymentMethod("Online")}
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
                              </div>
                            )}
                            <div className="mt-4 flex gap-2">
                              <button
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                onClick={() => {
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
                                    payerIdentifier =
                                      paymentCredentials.cardNumber;
                                  }
                                  alert("Payment successful!");
                                  // Close modal
                                  setShowPaymentSelector(false);
                                  setSelectedPaymentMethod("");
                                  setPaymentCredentials({});
                                  // Submit application
                                  handleSubmitApplication(
                                    200,
                                    selectedPaymentMethod,
                                    payerIdentifier
                                  );
                                }}
                                disabled={loading}
                              >
                                Pay BDT 200
                              </button>
                              <button
                                className="px-4 py-2 bg-gray-500 text-white rounded"
                                onClick={() => {
                                  setShowPaymentSelector(false);
                                  setSelectedPaymentMethod("");
                                  setPaymentCredentials({});
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
                </div>
              ) : (
                <div className="text-gray-500">Loading...</div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
