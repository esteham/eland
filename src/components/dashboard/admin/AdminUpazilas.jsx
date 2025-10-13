import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../api";

export default function AdminUpazilas() {
  const [items, setItems] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null,
    district_id: "",
    name_en: "",
    name_bn: "",
    bbs_code: "",
  });

  const loadDistricts = async () => {
    try {
      const { data } = await api.get("/admin/districts");
      setDistricts(data);
    } catch (e) {
      console.error("Failed to load districts", e);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/upazilas");
      setItems(data);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e.message || "Failed to load upazilas"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistricts();
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (form.id) {
        await api.put(`/admin/upazilas/${form.id}`, {
          district_id: form.district_id,
          name_en: form.name_en,
          name_bn: form.name_bn,
          bbs_code: form.bbs_code || null,
        });
        toast.success("Upazila updated successfully");
      } else {
        await api.post(`/admin/upazilas`, {
          district_id: form.district_id,
          name_en: form.name_en,
          name_bn: form.name_bn,
          bbs_code: form.bbs_code || null,
        });
        toast.success("Upazila added successfully");
      }
      setForm({
        id: null,
        district_id: "",
        name_en: "",
        name_bn: "",
        bbs_code: "",
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
      district_id: it.district_id,
      name_en: it.name_en,
      name_bn: it.name_bn,
      bbs_code: it.bbs_code || "",
    });

  const onDelete = async (id) => {
    if (!confirm("Delete this upazila?")) return;
    try {
      setLoading(true);
      await api.delete(`/admin/upazilas/${id}`);
      toast.success("Upazila deleted successfully");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Manage Upazilas</h2>

      <form
        onSubmit={onSubmit}
        className="bg-white border rounded p-4 mb-6 space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm">District</label>
            <select
              className="w-full border rounded p-2"
              value={form.district_id}
              onChange={(e) =>
                setForm({ ...form, district_id: e.target.value })
              }
              required
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name_en}
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
          <div>
            <label className="text-sm">BBS Code</label>
            <input
              className="w-full border rounded p-2"
              value={form.bbs_code}
              onChange={(e) => setForm({ ...form, bbs_code: e.target.value })}
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
                  district_id: "",
                  name_en: "",
                  name_bn: "",
                  bbs_code: "",
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
              <th className="text-left p-2">District</th>
              <th className="text-left p-2">Name (EN)</th>
              <th className="text-left p-2">Name (BN)</th>
              <th className="text-left p-2">BBS</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="p-2">{it.id}</td>
                <td className="p-2">{it.district?.name_en || "-"}</td>
                <td className="p-2">{it.name_en}</td>
                <td className="p-2">{it.name_bn}</td>
                <td className="p-2">{it.bbs_code || "-"}</td>
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
                  {loading ? "Loading..." : "No upazilas found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
