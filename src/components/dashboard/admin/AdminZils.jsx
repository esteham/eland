import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../api";

export default function AdminZils() {
  const [items, setItems] = useState([]);
  const [mouzas, setMouzas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null,
    mouza_id: "",
    zil_no: "",
    map_url: "",
    meta: "",
  });

  const loadMouzas = async () => {
    try {
      const { data } = await api.get("/admin/mouzas");
      setMouzas(data);
    } catch (e) {
      console.error("Failed to load mouzas", e);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/zils");
      setItems(data);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e.message || "Failed to load zils"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMouzas();
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const meta = form.meta ? JSON.parse(form.meta) : null;
      if (form.id) {
        await api.put(`/admin/zils/${form.id}`, {
          mouza_id: form.mouza_id,
          zil_no: form.zil_no,
          map_url: form.map_url || null,
          meta,
        });
        toast.success("Zils updated successfully");
      } else {
        await api.post(`/admin/zils`, {
          mouza_id: form.mouza_id,
          zil_no: form.zil_no,
          map_url: form.map_url || null,
          meta,
        });
        toast.success("Zils added successfully");
      }
      setForm({ id: null, mouza_id: "", zil_no: "", map_url: "", meta: "" });
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (it) =>
    setForm({
      id: it.id,
      mouza_id: it.mouza_id,
      zil_no: it.zil_no,
      map_url: it.map_url || "",
      meta: it.meta ? JSON.stringify(it.meta) : "",
    });

  const onDelete = async (id) => {
    if (!confirm("Delete this zil?")) return;
    try {
      setLoading(true);
      await api.delete(`/admin/zils/${id}`);
      toast.success("Zils deleted successfully");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Manage Zils</h2>

      <form
        onSubmit={onSubmit}
        className="bg-white border rounded p-4 mb-6 space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm">Mouza</label>
            <select
              className="w-full border rounded p-2"
              value={form.mouza_id}
              onChange={(e) => setForm({ ...form, mouza_id: e.target.value })}
              required
            >
              <option value="">Select Mouza</option>
              {mouzas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name_en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Zil No</label>
            <input
              className="w-full border rounded p-2"
              value={form.zil_no}
              onChange={(e) => setForm({ ...form, zil_no: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm">Map URL</label>
            <input
              className="w-full border rounded p-2"
              type="url"
              value={form.map_url}
              onChange={(e) => setForm({ ...form, map_url: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm">Meta (JSON)</label>
            <textarea
              className="w-full border rounded p-2"
              value={form.meta}
              onChange={(e) => setForm({ ...form, meta: e.target.value })}
              placeholder="{}"
            />
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
                  mouza_id: "",
                  zil_no: "",
                  map_url: "",
                  meta: "",
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
              <th className="text-left p-2">Mouza</th>
              <th className="text-left p-2">Zil No</th>
              <th className="text-left p-2">Map URL</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="p-2">{it.id}</td>
                <td className="p-2">{it.mouza?.name_en || "-"}</td>
                <td className="p-2">{it.zil_no}</td>
                <td className="p-2">
                  {it.map_url ? (
                    <a
                      href={it.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600"
                    >
                      Link
                    </a>
                  ) : (
                    "-"
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
                <td className="p-3 text-center text-gray-500" colSpan={5}>
                  {loading ? "Loading..." : "No zils found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
