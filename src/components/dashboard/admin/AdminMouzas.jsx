import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../api";

export default function AdminMouzas() {
  const [items, setItems] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null,
    upazila_id: "",
    name_en: "",
    name_bn: "",
    jl_no: "",
    mouza_code: "",
    meta: "",
  });

  const loadUpazilas = async () => {
    try {
      const { data } = await api.get("/admin/upazilas");
      setUpazilas(data);
    } catch (e) {
      console.error("Failed to load upazilas", e);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/mouzas");
      setItems(data);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e.message || "Failed to load mouzas"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpazilas();
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const meta = form.meta ? JSON.parse(form.meta) : null;
      if (form.id) {
        await api.put(`/admin/mouzas/${form.id}`, {
          upazila_id: form.upazila_id,
          name_en: form.name_en,
          name_bn: form.name_bn,
          jl_no: form.jl_no || null,
          mouza_code: form.mouza_code || null,
          meta,
        });
        toast.success("Mouza updated successfully");
      } else {
        await api.post(`/admin/mouzas`, {
          upazila_id: form.upazila_id,
          name_en: form.name_en,
          name_bn: form.name_bn,
          jl_no: form.jl_no || null,
          mouza_code: form.mouza_code || null,
          meta,
        });
        toast.success("Mouza added successfully");
      }
      setForm({
        id: null,
        upazila_id: "",
        name_en: "",
        name_bn: "",
        jl_no: "",
        mouza_code: "",
        meta: "",
      });
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
      upazila_id: it.upazila_id,
      name_en: it.name_en,
      name_bn: it.name_bn,
      jl_no: it.jl_no || "",
      mouza_code: it.mouza_code || "",
      meta: it.meta ? JSON.stringify(it.meta) : "",
    });

  const onDelete = async (id) => {
    if (!confirm("Delete this mouza?")) return;
    try {
      setLoading(true);
      await api.delete(`/admin/mouzas/${id}`);
      toast.success("Mouza deleted successfully");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Manage Mouzas</h2>

      <form
        onSubmit={onSubmit}
        className="bg-white border rounded p-4 mb-6 space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm">Upazila</label>
            <select
              className="w-full border rounded p-2"
              value={form.upazila_id}
              onChange={(e) => setForm({ ...form, upazila_id: e.target.value })}
              required
            >
              <option value="">Select Upazila</option>
              {upazilas.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name_en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Name (EN)</label>
            <input
              className="w-full border rounded p-2"
              value={form.name_en}
              onChange={(e) => setForm({ ...form, name_en: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm">Name (BN)</label>
            <input
              className="w-full border rounded p-2"
              value={form.name_bn}
              onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm">JL No</label>
            <input
              className="w-full border rounded p-2"
              value={form.jl_no}
              onChange={(e) => setForm({ ...form, jl_no: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm">Mouza Code</label>
            <input
              className="w-full border rounded p-2"
              value={form.mouza_code}
              onChange={(e) => setForm({ ...form, mouza_code: e.target.value })}
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
                  upazila_id: "",
                  name_en: "",
                  name_bn: "",
                  jl_no: "",
                  mouza_code: "",
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
              <th className="text-left p-2">Upazila</th>
              <th className="text-left p-2">Name (EN)</th>
              <th className="text-left p-2">Name (BN)</th>
              <th className="text-left p-2">JL No</th>
              <th className="text-left p-2">Mouza Code</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="p-2">{it.id}</td>
                <td className="p-2">{it.upazila?.name_en || "-"}</td>
                <td className="p-2">{it.name_en}</td>
                <td className="p-2">{it.name_bn}</td>
                <td className="p-2">{it.jl_no || "-"}</td>
                <td className="p-2">{it.mouza_code || "-"}</td>
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
                <td className="p-3 text-center text-gray-500" colSpan={7}>
                  {loading ? "Loading..." : "No mouzas found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
