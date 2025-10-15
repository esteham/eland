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
  ExternalLink,
} from "lucide-react";

export default function AdminZils() {
  // ---------------- state ----------------
  const [items, setItems] = useState([]);
  const [mouzas, setMouzas] = useState([]);
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
  const initialForm = {
    id: null,
    mouza_id: "",
    zil_no: "",
    map_url: "",
    meta: "",
  };
  const [form, setForm] = useState(initialForm);

  // ---------------- data loaders ----------------
  const loadMouzas = async () => {
    try {
      const { data } = await api.get("/admin/mouzas");
      setMouzas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load mouzas", e);
      toast.error(
        e?.response?.data?.message || e.message || "Failed to load mouzas"
      );
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/zils");
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      const msg =
        e?.response?.data?.message || e.message || "Failed to load zils";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMouzas();
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

  // ---------------- helpers ----------------
  const safeParseMeta = (value) => {
    if (!value || !String(value).trim()) return null; // allow empty
    try {
      const obj = JSON.parse(value);
      if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
      toast.error('Meta must be a JSON object (e.g., {"note":"..."})');
      return undefined; // invalid
    } catch {
      toast.error("Invalid JSON in Meta");
      return undefined; // invalid
    }
  };

  // ---------------- submit ----------------
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const metaObj = safeParseMeta(form.meta);
      if (metaObj === undefined) {
        setLoading(false);
        return;
      }

      const payload = {
        mouza_id: Number(form.mouza_id) || form.mouza_id,
        zil_no: form.zil_no?.trim(),
        map_url: form.map_url?.trim() || null,
        meta: metaObj,
      };

      if (!payload.mouza_id || !payload.zil_no) {
        toast.error("Mouza & Zil No are required");
        setLoading(false);
        return;
      }

      if (form.id) {
        await api.put(`/admin/zils/${form.id}`, payload);
        toast.success("Zil updated successfully");
      } else {
        await api.post(`/admin/zils`, payload);
        toast.success("Zil added successfully");
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
      mouza_id: String(it.mouza_id ?? ""),
      zil_no: it.zil_no || "",
      map_url: it.map_url || "",
      meta: it.meta ? JSON.stringify(it.meta) : "",
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
      await api.delete(`/admin/zils/${deleteId}`);
      toast.success("Zil deleted successfully");
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
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const mz = it.mouza?.name_en || it.mouza?.name_bn || "";
      return [
        String(it.id),
        String(it.zil_no || ""),
        String(it.map_url || ""),
        mz,
      ].some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const key = sortKey;
      const va =
        key === "mouza" ? a.mouza?.name_en || a.mouza?.name_bn || "" : a[key];
      const vb =
        key === "mouza" ? b.mouza?.name_en || b.mouza?.name_bn || "" : b[key];
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
    <div className="mx-auto max-w-6xl p-4 space-y-4">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Manage Zils</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full rounded border pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by Zil No, Mouza or URL..."
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
            <Plus className="h-4 w-4" /> Add Zil
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
                  { k: "mouza", label: "Mouza" },
                  { k: "zil_no", label: "Zil No" },
                  { k: "map_url", label: "Map URL", sortable: false },
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
                    <td className="p-2">
                      {it.mouza?.name_en || it.mouza?.name_bn || "-"}
                    </td>
                    <td className="p-2 font-medium">{it.zil_no}</td>
                    <td className="p-2">
                      {it.map_url ? (
                        <a
                          href={it.map_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 inline-flex items-center gap-1"
                        >
                          <ExternalLink className="h-4 w-4" /> Link
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
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
                    No zils found.
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
          title={form.id ? "Edit Zil" : "Create Zil"}
          onClose={() => setIsFormOpen(false)}
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Mouza <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border rounded p-2 mt-1"
                  value={form.mouza_id}
                  onChange={(e) =>
                    setForm({ ...form, mouza_id: e.target.value })
                  }
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
                <label className="text-sm font-medium">
                  Zil No <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.zil_no}
                  onChange={(e) => setForm({ ...form, zil_no: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Map URL</label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  type="url"
                  value={form.map_url}
                  onChange={(e) =>
                    setForm({ ...form, map_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Meta (JSON)</label>
              <textarea
                className="w-full border rounded p-2 mt-1"
                value={form.meta}
                onChange={(e) => setForm({ ...form, meta: e.target.value })}
                placeholder='{"note":"optional"}'
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty or provide a valid JSON object.
              </p>
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
        <Modal title="Delete Zil?" onClose={() => setIsConfirmOpen(false)}>
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
