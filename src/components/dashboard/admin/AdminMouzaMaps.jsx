import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import api, {
  createMouzaMap,
  updateMouzaMap,
  deleteMouzaMap,
} from "../../../api";
import {
  Plus,
  Search,
  X,
  Loader2,
  PencilLine,
  Trash2,
  Eye,
  FileDown,
  UploadCloud,
} from "lucide-react";

export default function AdminMouzaMaps() {
  // ---------------- state ----------------
  const [items, setItems] = useState([]);
  const [zils, setZils] = useState([]);
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
    zil_id: "",
    name: "",
    document: null,
    remove_document: false,
  };
  const [form, setForm] = useState(initialForm);

  // drag & drop
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // ---------------- data loaders ----------------
  const loadZils = async () => {
    try {
      const { data } = await api.get("/admin/zils");
      setZils(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load zils", e);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/mouza-maps");
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      const msg =
        e?.response?.data?.message || e.message || "Failed to load mouza maps";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZils();
    load();
  }, []);

  // lock body scroll when modal open
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
      if (!form.zil_id) {
        toast.error("Zil is required");
        setLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append("zil_id", form.zil_id);
      if (form.name) fd.append("name", form.name);
      if (form.document) fd.append("document", form.document);
      if (form.id && form.remove_document) fd.append("remove_document", "1");

      if (form.id) {
        await updateMouzaMap(form.id, fd);
        toast.success("Mouza Map updated successfully");
      } else {
        await createMouzaMap(fd);
        toast.success("Mouza Map added successfully");
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
      zil_id: String(it.zil_id ?? ""),
      name: it.name || "",
      document: null,
      remove_document: false,
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
      await deleteMouzaMap(deleteId);
      toast.success("Mouza Map deleted successfully");
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
      const zilNo = it.zil?.zil_no || "";
      return [String(it.id), zilNo, String(it.name || "")].some((v) =>
        String(v).toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let va, vb;
      if (sortKey === "zil") {
        va = a.zil?.zil_no || "";
        vb = b.zil?.zil_no || "";
      } else {
        va = a[sortKey];
        vb = b[sortKey];
      }

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
        <h2 className="text-2xl font-semibold">Manage Mouza Maps</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full rounded border pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by ID, Zil, or name..."
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
            <Plus className="h-4 w-4" /> Add Mouza Map
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
                  { k: "zil", label: "Zil" },
                  { k: "name", label: "Name" },
                  { k: "document", label: "Document", sortable: false },
                  {
                    k: "actions",
                    label: "Actions",
                    sortable: false,
                    w: "w-[160px]",
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
                    <td className="p-2">{it.zil?.zil_no || "-"}</td>
                    <td className="p-2 font-medium">{it.name || "-"}</td>
                    <td className="p-2">
                      {it.document_url ? (
                        <div className="flex gap-2 items-center">
                          <a
                            href={it.document_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 inline-flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" /> View
                          </a>
                          <a
                            href={it.document_url}
                            download
                            className="text-emerald-600 inline-flex items-center gap-1"
                          >
                            <FileDown className="h-4 w-4" /> Download
                          </a>
                        </div>
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
                    No mouza maps found.
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
          title={form.id ? "Edit Mouza Map" : "Create Mouza Map"}
          onClose={() => setIsFormOpen(false)}
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Zil <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border rounded p-2 mt-1"
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
                <label className="text-sm font-medium">Name</label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Optional title"
                />
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="text-sm font-medium">
                Document (PDF/Image)
              </label>
              <div
                className={`mt-1 border-2 border-dashed rounded p-4 text-sm flex flex-col items-center justify-center gap-2 ${
                  dragOver
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-300"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) setForm({ ...form, document: f });
                }}
              >
                <UploadCloud className="h-5 w-5" />
                <div>Drag & drop file here, or</div>
                <button
                  type="button"
                  className="px-2 py-1 border rounded"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
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

              {/* existing doc controls */}
              {form.id &&
                (() => {
                  const current = items.find((x) => x.id === form.id);
                  if (!current?.document_url) return null;
                  return (
                    <div className="mt-2 text-sm flex items-center gap-4">
                      <a
                        href={current.document_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 inline-flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" /> View current
                      </a>
                      <label className="inline-flex items-center gap-2 text-gray-700">
                        <input
                          type="checkbox"
                          checked={form.remove_document}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              remove_document: e.target.checked,
                            })
                          }
                        />{" "}
                        Remove document
                      </label>
                    </div>
                  );
                })()}
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
        <Modal
          title="Delete Mouza Map?"
          onClose={() => setIsConfirmOpen(false)}
        >
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-y-auto">
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
