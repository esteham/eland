import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api, { createMouzaMap, updateMouzaMap, deleteMouzaMap } from "../../../api";

export default function AdminMouzaMaps() {
  const [items, setItems] = useState([]);
  const [zils, setZils] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null,
    zil_id: "",
    name: "",
    document: null,
    remove_document: false,
  });

  const loadZils = async () => {
    try {
      const { data } = await api.get("/admin/zils");
      setZils(data);
    } catch (e) {
      console.error("Failed to load zils", e);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/mouza-maps");
      setItems(data);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e.message || "Failed to load mouza maps"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZils();
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('zil_id', form.zil_id);
      if (form.name) formData.append('name', form.name);
      if (form.document) formData.append('document', form.document);
      if (form.id && form.remove_document) formData.append('remove_document', '1');

      if (form.id) {
        await updateMouzaMap(form.id, formData);
        toast.success("Mouza Map updated successfully");
      } else {
        await createMouzaMap(formData);
        toast.success("Mouza Map added successfully");
      }
      setForm({
        id: null,
        zil_id: "",
        name: "",
        document: null,
        remove_document: false,
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
      zil_id: it.zil_id,
      name: it.name || "",
      document: null, // can't prefill file
      remove_document: false,
    });

  const onDelete = async (id) => {
    if (!confirm("Delete this mouza map?")) return;
    try {
      setLoading(true);
      await deleteMouzaMap(id);
      toast.success("Mouza Map deleted successfully");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Manage Mouza Maps</h2>

      <form
        onSubmit={onSubmit}
        className="bg-white border rounded p-4 mb-6 space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Zil</label>
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
          <div>
            <label className="text-sm">Name</label>
            <input
              className="w-full border rounded p-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="text-sm">Document</label>
          <input
            type="file"
            className="w-full border rounded p-2"
            accept="application/pdf,image/*"
            onChange={(e) => setForm({ ...form, document: e.target.files[0] })}
          />
          {form.id && items.find(it => it.id === form.id)?.document_url && (
            <div className="mt-1">
              <a href={items.find(it => it.id === form.id).document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600">View current document</a>
              <label className="ml-3">
                <input
                  type="checkbox"
                  checked={form.remove_document}
                  onChange={(e) => setForm({ ...form, remove_document: e.target.checked })}
                /> Remove document
              </label>
            </div>
          )}
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
                  name: "",
                  document: null,
                  remove_document: false,
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
              <th className="text-left p-2">Zil</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Document</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="p-2">{it.id}</td>
                <td className="p-2">{it.zil?.zil_no || "-"}</td>
                <td className="p-2">{it.name || "-"}</td>
                <td className="p-2">
                  {it.document_url ? (
                    <a href={it.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600">View</a>
                  ) : "-"}
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
                  {loading ? "Loading..." : "No mouza maps found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
