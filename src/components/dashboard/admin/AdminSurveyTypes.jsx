import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../api";

export default function AdminSurveyTypes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null,
    code: "",
    name_en: "",
    name_bn: "",
    description: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/survey-types");
      setItems(data);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e.message || "Failed to load survey types"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (form.id) {
        await api.put(`/admin/survey-types/${form.id}`, {
          code: form.code,
          name_en: form.name_en,
          name_bn: form.name_bn || null,
          description: form.description || null,
        });
        toast.success("Survey type updated successfully");
      } else {
        await api.post(`/admin/survey-types`, {
          code: form.code,
          name_en: form.name_en,
          name_bn: form.name_bn || null,
          description: form.description || null,
        });
        toast.success("Survey type added successfully");
      }
      setForm({
        id: null,
        code: "",
        name_en: "",
        name_bn: "",
        description: "",
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
      code: it.code,
      name_en: it.name_en,
      name_bn: it.name_bn || "",
      description: it.description || "",
    });

  const onDelete = async (id) => {
    if (!confirm("Delete this survey type?")) return;
    try {
      setLoading(true);
      await api.delete(`/admin/survey-types/${id}`);
      toast.success("Survey type deleted successfully");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Manage Survey Types</h2>

      <form
        onSubmit={onSubmit}
        className="bg-white border rounded p-4 mb-6 space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm">Code</label>
            <input
              className="w-full border rounded p-2"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
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
            />
          </div>
        </div>
        <div>
          <label className="text-sm">Description</label>
          <textarea
            className="w-full border rounded p-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
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
                  code: "",
                  name_en: "",
                  name_bn: "",
                  description: "",
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
              <th className="text-left p-2">Code</th>
              <th className="text-left p-2">Name (EN)</th>
              <th className="text-left p-2">Name (BN)</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="p-2">{it.id}</td>
                <td className="p-2">{it.code}</td>
                <td className="p-2">{it.name_en}</td>
                <td className="p-2">{it.name_bn || "-"}</td>
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
                  {loading ? "Loading..." : "No survey types found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
