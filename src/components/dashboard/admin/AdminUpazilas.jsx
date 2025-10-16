import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../api";
import {
  Plus,
  Search,
  X,
  Loader2,
  PencilLine,
  Trash2,
  Download,
} from "lucide-react";

export default function AdminUpazilas() {
  // ---------------- state ----------------
  const [items, setItems] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // table UX
  const [query, setQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // form
  const initialForm = {
    id: null,
    district_id: "",
    name_en: "",
    name_bn: "",
    bbs_code: "",
  };
  const [form, setForm] = useState(initialForm);

  // ---------------- data loaders ----------------
  const loadDistricts = async () => {
    try {
      const { data } = await api.get("/admin/districts");
      setDistricts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load districts", e);
      toast.error(
        e?.response?.data?.message || e.message || "Failed to load districts"
      );
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/upazilas");
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      const msg =
        e?.response?.data?.message || e.message || "Failed to load upazilas";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistricts();
    load();
  }, []);

  // lock body scroll when any modal open
  useEffect(() => {
    const anyOpen = isFormOpen || isConfirmOpen;
    document.documentElement.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isFormOpen, isConfirmOpen]);

  // ---------------- submit ----------------
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        district_id: Number(form.district_id) || form.district_id,
        name_en: form.name_en?.trim(),
        name_bn: form.name_bn?.trim(),
        bbs_code: form.bbs_code?.trim() || null,
      };

      if (!payload.district_id || !payload.name_en || !payload.name_bn) {
        toast.error("District, Name (EN) & Name (BN) are required");
        setLoading(false);
        return;
      }

      if (form.id) {
        await api.put(`/admin/upazilas/${form.id}`, payload);
        toast.success("Upazila updated successfully");
      } else {
        await api.post(`/admin/upazilas`, payload);
        toast.success("Upazila added successfully");
      }

      setForm(initialForm);
      setIsFormOpen(false);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- edit/delete ----------------
  const onEdit = (it) => {
    setForm({
      id: it.id,
      district_id: String(it.district_id ?? ""),
      name_en: it.name_en || "",
      name_bn: it.name_bn || "",
      bbs_code: it.bbs_code || "",
    });
    setIsFormOpen(true);
  };

  const askDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      await api.delete(`/admin/upazilas/${deleteId}`);
      toast.success("Upazila deleted successfully");
      setIsConfirmOpen(false);
      setDeleteId(null);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- table compute ----------------
  const filtered = useMemo(() => {
    let arr = items;
    if (selectedDistrict) {
      arr = arr.filter((it) => String(it.district_id) === selectedDistrict);
    }
    const q = query.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter((it) => {
      const dName = it.district?.name_en || it.district?.name_bn || "";
      return [
        String(it.id),
        String(it.name_en || ""),
        String(it.name_bn || ""),
        String(it.bbs_code || ""),
        dName,
      ].some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, query, selectedDistrict]);

  // ---------------- download CSV ----------------
  const downloadCSV = () => {
    const selectedDistrictObj = districts.find(d => d.id == selectedDistrict);
    const district_name = selectedDistrictObj ? selectedDistrictObj.name_en : "All";
    const reportTitle = `"${district_name} Upzilas"`;
    const reportDate = new Date().toLocaleDateString();

    const headers = [
      "ID",
      "District",
      "Upazila Name (EN)",
      "Upazila Name (BN)",
      "BBS Code",
    ];
    const rows = filtered.map((item) => [
      item.id,
      item.district?.name_en || item.district?.name_bn || "",
      item.name_en,
      item.name_bn,
      item.bbs_code || "",
    ]);

    const csvContent = [
      [`"${reportTitle}"`],
      [`"Date: ${reportDate}"`],
      [""],
      headers,
      ...rows,
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // 👉 Add UTF-8 BOM to fix Bangla characters in Excel
    const csvWithBom = "\uFEFF" + csvContent;

    const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "upazilas.csv";
    link.click();
  };

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const key = sortKey;
      const va =
        key === "district"
          ? a.district?.name_en || a.district?.name_bn || ""
          : a[key];
      const vb =
        key === "district"
          ? b.district?.name_en || b.district?.name_bn || ""
          : b[key];
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === "asc" ? -1 : 1;
      if (vb == null) return sortDir === "asc" ? 1 : -1;
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page, perPage]);

  useEffect(() => {
    setPage(1);
  }, [query, perPage, selectedDistrict]);

  const switchSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="mx-auto max-w-5xl p-4 space-y-4">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Manage Upazilas</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full rounded border pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by name, BBS or district..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name_en}
              </option>
            ))}
          </select>
          <button
            onClick={downloadCSV}
            className="inline-flex items-center gap-2 rounded bg-green-600 text-white px-3 py-2 text-sm hover:bg-green-700"
          >
            <Download className="h-4 w-4" /> Download CSV
          </button>
          <button
            onClick={() => {
              setForm(initialForm);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded bg-indigo-600 text-white px-3 py-2 text-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add Upazila
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* table card */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 text-sm bg-gray-50 border-b">
          <div className="text-gray-600">Total: {items.length}</div>
          <div className="flex items-center gap-2">
            <label className="text-gray-600">Rows</label>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                {[
                  { k: "id", label: "ID", w: "w-[80px]" },
                  { k: "district", label: "District" },
                  { k: "name_en", label: "Name (EN)" },
                  { k: "name_bn", label: "Name (BN)" },
                  { k: "bbs_code", label: "BBS" },
                  {
                    k: "actions",
                    label: "Actions",
                    sortable: false,
                    w: "w-[140px]",
                  },
                ].map((col) => (
                  <th key={col.k} className={`p-2 font-medium ${col.w || ""}`}>
                    {col.sortable === false ? (
                      <span>{col.label}</span>
                    ) : (
                      <button
                        className="inline-flex items-center gap-1 hover:text-indigo-600"
                        onClick={() => switchSort(col.k)}
                      >
                        <span>{col.label}</span>
                        {sortKey === col.k && (
                          <span className="text-xs text-gray-400">
                            {sortDir === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="p-2">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paged.length ? (
                paged.map((it) => (
                  <tr key={it.id} className="border-b hover:bg-gray-50/60">
                    <td className="p-2">{it.id}</td>
                    <td className="p-2">
                      {it.district?.name_en || it.district?.name_bn || "-"}
                    </td>
                    <td className="p-2 font-medium">{it.name_en}</td>
                    <td className="p-2">{it.name_bn}</td>
                    <td className="p-2">{it.bbs_code || "—"}</td>
                    <td className="p-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                          onClick={() => onEdit(it)}
                        >
                          <PencilLine className="h-4 w-4" /> Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                          onClick={() => askDelete(it.id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={6}>
                    No upazilas found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between px-3 py-2 border-t bg-white text-sm">
          <div className="text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              First
            </button>
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* ---- Form Modal ---- */}
      {isFormOpen && (
        <Modal
          title={form.id ? "Edit Upazila" : "Create Upazila"}
          onClose={() => setIsFormOpen(false)}
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border rounded p-2 mt-1"
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
                <label className="text-sm font-medium">BBS Code</label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.bbs_code}
                  onChange={(e) =>
                    setForm({ ...form, bbs_code: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Name (EN) <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.name_en}
                  onChange={(e) =>
                    setForm({ ...form, name_en: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Name (BN) <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.name_bn}
                  onChange={(e) =>
                    setForm({ ...form, name_bn: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              {form.id && (
                <button
                  type="button"
                  className="px-3 py-2 border rounded"
                  onClick={() => setForm(initialForm)}
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                className="px-3 py-2 border rounded"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              <button
                disabled={loading}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {form.id ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---- Confirm Delete Modal ---- */}
      {isConfirmOpen && (
        <Modal title="Delete Upazila?" onClose={() => setIsConfirmOpen(false)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-2 border rounded"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 bg-red-600 text-white rounded"
                onClick={onDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
