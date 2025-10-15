import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../api";

export default function AdminDags() {
  const [items, setItems] = useState([]);
  const [zils, setZils] = useState([]);
  const [surveyTypes, setSurveyTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null,
    zil_id: "",
    khatiyan_number: "",
    dag_no: "",
    survey_type: "",
    khotiyan: "", // will hold JSON string (array of {owner, area})
    meta: "", // will hold JSON string (object)
    document: null,
  });

  // ---------- helpers ----------
  const safeParse = (v, fb) => {
    if (!v || !String(v).trim()) return fb;
    try {
      return JSON.parse(v);
    } catch {
      return fb;
    }
  };

  const getKhotiyanArray = () => {
    const arr = safeParse(form.khotiyan, []);
    return Array.isArray(arr) ? arr : [];
  };
  const setKhotiyanArray = (arr) => {
    setForm((f) => ({ ...f, khotiyan: JSON.stringify(arr) }));
  };

  // quick-entry small states
  const [ownerInput, setOwnerInput] = useState("");
  const [areaInput, setAreaInput] = useState("");

  const addKhotiyanItem = () => {
    const owner = ownerInput.trim();
    const area = areaInput.trim();
    if (!owner || !area) {
      toast.error("Owner and Area are required");
      return;
    }
    const arr = getKhotiyanArray();
    arr.push({ owner, area });
    setKhotiyanArray(arr);
    setOwnerInput("");
    setAreaInput("");
  };

  const removeKhotiyanItem = (idx) => {
    const arr = getKhotiyanArray();
    arr.splice(idx, 1);
    setKhotiyanArray(arr);
  };

  // ---------- data loaders ----------
  const loadZils = async () => {
    try {
      const { data } = await api.get("/admin/zils");
      setZils(data || []);
    } catch (e) {
      console.error("Failed to load zils", e);
    }
  };

  const loadSurveyTypes = async () => {
    try {
      const { data } = await api.get("/admin/survey-types");
      setSurveyTypes(data || []);
    } catch (e) {
      console.error("Failed to load survey types", e);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/dags");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e.message || "Failed to load dags"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZils();
    loadSurveyTypes();
    load();
  }, []);

  // ---------- submit ----------
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // normalize khotiyan to array
      const khArr = getKhotiyanArray(); // array of {owner, area}
      if (!Array.isArray(khArr)) {
        toast.error("Khotiyan must be an array");
        setLoading(false);
        return;
      }

      // normalize meta to object
      const metaObj = safeParse(form.meta, {});

      if (Array.isArray(metaObj)) {
        toast.error('Meta must be an object (e.g., {"note":"..."})');
        setLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append("zil_id", form.zil_id);
      fd.append("khatiyan_number", form.khatiyan_number);
      fd.append("dag_no", form.dag_no);
      if (form.survey_type) fd.append("survey_type_id", form.survey_type);
      fd.append("khotiyan", JSON.stringify(khArr));
      fd.append("meta", JSON.stringify(metaObj));
      if (form.document) fd.append("document", form.document);

      if (form.id) {
        // safer for multipart: POST with _method=PUT
        await api.post(`/admin/dags/${form.id}?_method=PUT`, fd);
        toast.success("Dag updated successfully");
      } else {
        await api.post(`/admin/dags`, fd);
        toast.success("Dag added successfully");
      }

      setForm({
        id: null,
        zil_id: "",
        khatiyan_number: "",
        dag_no: "",
        survey_type: "",
        khotiyan: "",
        meta: "",
        document: null,
      });
      setOwnerInput("");
      setAreaInput("");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- edit/delete ----------
  const onEdit = (it) =>
    setForm({
      id: it.id,
      zil_id: it.zil_id ?? "",
      khatiyan_number: it.khatiyan_number ?? "",
      dag_no: it.dag_no ?? "",
      survey_type: it.survey_type_id ?? "",
      khotiyan: it.khotiyan ? JSON.stringify(it.khotiyan) : "",
      meta: it.meta ? JSON.stringify(it.meta) : "",
      document: null, // reset; user can re-upload if needed
    });

  const onDelete = async (id) => {
    if (!confirm("Delete this dag?")) return;
    try {
      setLoading(true);
      await api.delete(`/admin/dags/${id}`);
      toast.success("Dag deleted successfully");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Manage Dags</h2>

      <form
        onSubmit={onSubmit}
        className="bg-white border rounded p-4 mb-6 space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className=" md:col-span-1 gap-4">
            <div className="mb-4">
              <label className="text-sm font-semibold">Zil</label>
              <select
                className="w-full border rounded p-2"
                value={form.zil_id}
                onChange={(e) => setForm({ ...form, zil_id: e.target.value })}
                required
              >
                <option value="">Select Zil</option>
                {zils.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.zil_no}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="text-sm font-semibold">Khatiyan Number</label>
              <input
                className="w-full border rounded p-2"
                value={form.khatiyan_number}
                onChange={(e) =>
                  setForm({ ...form, khatiyan_number: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div md:col-span-1 gap-4>
            <div className="mb-4">
              <label className="text-sm font-semibold">Survey Type</label>
              <select
                className="w-full border rounded p-2"
                value={form.survey_type}
                onChange={(e) =>
                  setForm({ ...form, survey_type: e.target.value })
                }
              >
                <option value="">Select Survey Type</option>
                {surveyTypes.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Dag No</label>
              <input
                className="w-full border rounded p-2"
                value={form.dag_no}
                onChange={(e) => setForm({ ...form, dag_no: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Quick Khotiyan Builder (Owner + Area -> builds array) */}
          <div className="md:col-span-2 border rounded p-3 mb-2">
            <label className="text-sm font-medium block mb-2">
              Quick Khotiyan Entry
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                className="border rounded p-2"
                placeholder="Owner name (e.g., Abul)"
                value={ownerInput}
                onChange={(e) => setOwnerInput(e.target.value)}
              />
              <input
                className="border rounded p-2"
                placeholder="Area (e.g., 100 sqft)"
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
              />
              <button
                type="button"
                onClick={addKhotiyanItem}
                className="bg-emerald-600 text-white rounded px-3"
              >
                Add
              </button>
            </div>

            {/* Preview current khotiyan rows */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 border-r">#</th>
                    <th className="text-left p-2 border-r">Owner</th>
                    <th className="text-left p-2 border-r">Area</th>
                    <th className="text-left p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {getKhotiyanArray().map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2 border-r">{idx + 1}</td>
                      <td className="p-2 border-r">{row.owner}</td>
                      <td className="p-2 border-r">{row.area}</td>
                      <td className="p-2">
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={() => removeKhotiyanItem(idx)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {getKhotiyanArray().length === 0 && (
                    <tr>
                      <td className="p-2 text-gray-500 text-center" colSpan={4}>
                        No khotiyan rows yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* raw JSON textarea for power users / debug */}
            <label className="text-xs text-gray-500 block mt-2">
              Khotiyan (JSON) — optional manual edit
            </label>
            <textarea
              className="w-full border rounded p-2 text-xs"
              rows={3}
              value={form.khotiyan}
              onChange={(e) => setForm({ ...form, khotiyan: e.target.value })}
              placeholder='[{"owner":"Owner1","area":"100 sqft"}]'
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Meta (JSON)</label>
            <textarea
              className="w-full border rounded p-2"
              value={form.meta}
              onChange={(e) => setForm({ ...form, meta: e.target.value })}
              placeholder='{"note":"optional"}'
            />
          </div>

          <div>
            <label className="text-sm font-semibold">
              Document (Image/PDF)
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="w-full border rounded p-2"
              onChange={(e) =>
                setForm({ ...form, document: e.target.files?.[0] || null })
              }
            />
            {form.document && (
              <div className="text-xs text-gray-600 mt-1">
                Selected: {form.document.name}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {form.id ? "Update" : "Create"}
          </button>
          {form.id && (
            <button
              type="button"
              className="border px-3 py-2 rounded"
              onClick={() =>
                setForm({
                  id: null,
                  zil_id: "",
                  khatiyan_number: "",
                  dag_no: "",
                  survey_type: "",
                  khotiyan: "",
                  meta: "",
                  document: null,
                })
              }
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Zil No</th>
              <th className="text-left p-2">Khatiyan No</th>
              <th className="text-left p-2">Dag No</th>
              <th className="text-left p-2">Survey Type</th>
              <th className="text-left p-2">Document</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="p-2">{it.id}</td>
                <td className="p-2">{it.zil?.zil_no || "-"}</td>
                <td className="p-2">{it.khatiyan_number}</td>
                <td className="p-2">{it.dag_no}</td>
                <td className="p-2">
                  {surveyTypes.find((st) => st.id === it.survey_type_id)
                    ?.code || "-"}
                </td>
                <td className="p-2">
                  {it.document_url ? (
                    <div className="flex gap-2">
                      <a
                        href={it.document_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600"
                      >
                        View
                      </a>
                      <a
                        href={it.document_url}
                        download
                        className="text-green-600"
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="p-2 text-right">
                  <button
                    className="text-indigo-600 mr-3"
                    onClick={() => onEdit(it)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => onDelete(it.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={6}>
                  {loading ? "Loading..." : "No dags found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
