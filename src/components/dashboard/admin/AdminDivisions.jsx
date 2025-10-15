import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api";
import { toast } from "react-hot-toast";
import { Plus, Search, X, Loader2, PencilLine, Trash2 } from "lucide-react";

export default function AdminDivisions() {
  // ---------------- state ----------------
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // table UX
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // form
  const initialForm = { id: null, name_en: "", name_bn: "", bbs_code: "" };
  const [form, setForm] = useState(initialForm);

  // ---------------- data loader ----------------
  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/divisions");
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      const msg =
        e?.response?.data?.message || e.message || "Failed to load divisions";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    setError("");
    if (!form.name_en?.trim() || !form.name_bn?.trim()) {
      toast.error("Name (EN) & Name (BN) are required");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name_en: form.name_en.trim(),
        name_bn: form.name_bn.trim(),
        bbs_code: form.bbs_code?.trim() || null,
      };

      if (form.id) {
        await api.put(`/admin/divisions/${form.id}`, payload);
        toast.success("Division updated successfully");
      } else {
        await api.post(`/admin/divisions`, payload);
        toast.success("Division added successfully");
      }
      setForm(initialForm);
      setIsFormOpen(false);
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Save failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- edit/delete ----------------
  const onEdit = (it) => {
    setForm({
      id: it.id,
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
      await api.delete(`/admin/divisions/${deleteId}`);
      toast.success("Division deleted successfully");
      setIsConfirmOpen(false);
      setDeleteId(null);
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Delete failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- table compute ----------------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [
        String(it.id),
        String(it.name_en || ""),
        String(it.name_bn || ""),
        String(it.bbs_code || ""),
      ].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
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

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page, perPage]);

  useEffect(() => {
    setPage(1);
  }, [query, perPage]);

  const switchSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="mx-auto max-w-4xl p-4 space-y-4">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Manage Divisions</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full rounded border pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by name or BBS..."
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
          <button
            onClick={() => {
              setForm(initialForm);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded bg-indigo-600 text-white px-3 py-2 text-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add Division
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
                    {[...Array(5)].map((__, j) => (
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
                  <td className="p-4 text-center text-gray-500" colSpan={5}>
                    No divisions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Form Modal ---- */}
      {isFormOpen && (
        <Modal
          title={form.id ? "Edit Division" : "Create Division"}
          onClose={() => setIsFormOpen(false)}
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
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
        <Modal title="Delete Division?" onClose={() => setIsConfirmOpen(false)}>
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
