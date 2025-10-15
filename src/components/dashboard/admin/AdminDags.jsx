import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../api";
import {
  Plus,
  PencilLine,
  Trash2,
  FileDown,
  FileText,
  Search,
  X,
  UploadCloud,
  Loader2,
  Eye,
} from "lucide-react";

export default function AdminDags() {
  // ---------------- state ----------------
  const [items, setItems] = useState([]);
  const [zils, setZils] = useState([]);
  const [surveyTypes, setSurveyTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // table UX
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // form state
  const initialForm = {
    id: null,
    zil_id: "",
    khatiyan_number: "",
    dag_no: "",
    survey_type: "", // id
    khotiyan: "", // JSON string: array of {owner, area}
    meta: "",
    document: null,
  };
  const [form, setForm] = useState(initialForm);

  // drag & drop for document
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // ---------------- helpers ----------------
  const safeParse = (v, fb) => {
    if (!v || !String(v).trim()) return fb;
    try {
      return JSON.parse(v);
    } catch {
      return fb;
    }
  };

  const khArr = useMemo(() => {
    const arr = safeParse(form.khotiyan, []);
    return Array.isArray(arr) ? arr : [];
  }, [form.khotiyan]);

  const setKhotiyanArray = (arr) => {
    setForm((f) => ({ ...f, khotiyan: JSON.stringify(arr) }));
  };

  const addKhotiyanItem = (owner, area) => {
    const o = (owner || "").trim();
    const a = (area || "").trim();
    if (!o || !a) {
      toast.error("Owner and Area are required");
      return;
    }
    const arr = [...khArr, { owner: o, area: a }];
    setKhotiyanArray(arr);
  };

  const removeKhotiyanItem = (idx) => {
    const arr = [...khArr];
    arr.splice(idx, 1);
    setKhotiyanArray(arr);
  };

  // ---------------- data loaders ----------------
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

      if (!form.zil_id || !form.khatiyan_number || !form.dag_no) {
        toast.error("Zil, Khatiyan & Dag are required");
        setLoading(false);
        return;
      }

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
        await api.post(`/admin/dags/${form.id}?_method=PUT`, fd);
        toast.success("Dag updated successfully");
      } else {
        await api.post(`/admin/dags`, fd);
        toast.success("Dag added successfully");
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
      zil_id: it.zil_id ?? "",
      khatiyan_number: it.khatiyan_number ?? "",
      dag_no: it.dag_no ?? "",
      survey_type: it.survey_type_id ?? "",
      khotiyan: it.khotiyan ? JSON.stringify(it.khotiyan) : "",
      meta: it.meta ? JSON.stringify(it.meta) : "",
      document: null,
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
      await api.delete(`/admin/dags/${deleteId}`);
      toast.success("Dag deleted successfully");
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
      const zil = it.zil?.zil_no || "";
      const st = String(it.survey_type_id || "");
      const stCode =
        (surveyTypes.find((s) => s.id === it.survey_type_id)?.code || "") +
        " " +
        (surveyTypes.find((s) => s.id === it.survey_type_id)?.name_en || "");
      return [
        String(it.id),
        zil,
        String(it.khatiyan_number || ""),
        String(it.dag_no || ""),
        st,
        stCode,
      ].some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, query, surveyTypes]);

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

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page, perPage]);

  useEffect(() => {
    // reset to first page when filters change
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
        <h2 className="text-2xl font-semibold">Manage Dags</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full rounded border pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by ID, Zil, Khatiyan, Dag, Survey..."
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
            <Plus className="h-4 w-4" /> Add Dag
          </button>
        </div>
      </header>

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
                  { k: "id", label: "ID", w: "w-[70px]" },
                  { k: "zil_no", label: "Zil No" },
                  { k: "khatiyan_number", label: "Khatiyan No" },
                  { k: "dag_no", label: "Dag No" },
                  { k: "survey_type_id", label: "Survey Type" },
                  { k: "document", label: "Document", sortable: false },
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
                        onClick={() =>
                          switchSort(col.k === "zil_no" ? "zil_id" : col.k)
                        }
                      >
                        <span>{col.label}</span>
                        {sortKey ===
                          (col.k === "zil_no" ? "zil_id" : col.k) && (
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
                    {[...Array(7)].map((__, j) => (
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
                    <td className="p-2 font-medium">{it.khatiyan_number}</td>
                    <td className="p-2">{it.dag_no}</td>
                    <td className="p-2">
                      {surveyTypes.find((st) => st.id === it.survey_type_id)
                        ?.code ||
                        surveyTypes.find((st) => st.id === it.survey_type_id)
                          ?.name_en ||
                        "-"}
                    </td>
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
                  <td className="p-4 text-center text-gray-500" colSpan={7}>
                    No dags found.
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
          onClose={() => setIsFormOpen(false)}
          title={form.id ? "Edit Dag" : "Create Dag"}
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
                <label className="text-sm font-medium">Survey Type</label>
                <select
                  className="w-full border rounded p-2 mt-1"
                  value={form.survey_type}
                  onChange={(e) =>
                    setForm({ ...form, survey_type: e.target.value })
                  }
                >
                  <option value="">Select Survey Type</option>
                  {surveyTypes.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.code || st.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Khatiyan Number <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.khatiyan_number}
                  onChange={(e) =>
                    setForm({ ...form, khatiyan_number: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Dag No <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.dag_no}
                  onChange={(e) => setForm({ ...form, dag_no: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Quick khotiyan builder */}
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Khotiyan (owner & area)
                </label>
                <small className="text-gray-500">{khArr.length} row(s)</small>
              </div>
              <KhotiyanQuick onAdd={addKhotiyanItem} />

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2 border-r w-[50px]">#</th>
                      <th className="text-left p-2 border-r">Owner</th>
                      <th className="text-left p-2 border-r">Area</th>
                      <th className="text-left p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {khArr.map((row, idx) => (
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
                    {!khArr.length && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-3 text-center text-gray-500"
                        >
                          No rows yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Meta (JSON)</label>
                <textarea
                  className="w-full border rounded p-2 mt-1"
                  value={form.meta}
                  onChange={(e) => setForm({ ...form, meta: e.target.value })}
                  placeholder='{"note":"optional"}'
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Document (Image/PDF)
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
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        document: e.target.files?.[0] || null,
                      })
                    }
                  />
                  {form.document && (
                    <div className="text-xs text-gray-600 mt-1">
                      Selected: {form.document.name}
                    </div>
                  )}
                </div>
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
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {form.id ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---- Confirm Delete Modal ---- */}
      {isConfirmOpen && (
        <Modal onClose={() => setIsConfirmOpen(false)} title="Delete Dag?">
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

// ------------- UI bits -------------
function Modal({ title, children, onClose }) {
  // close on ESC
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

function KhotiyanQuick({ onAdd }) {
  const [owner, setOwner] = useState("");
  const [area, setArea] = useState("");
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <input
        className="border rounded p-2"
        placeholder="Owner name (e.g., Abul)"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
      />
      <input
        className="border rounded p-2"
        placeholder="Area (e.g., 100 sqft)"
        value={area}
        onChange={(e) => setArea(e.target.value)}
      />
      <button
        type="button"
        onClick={() => {
          onAdd(owner, area);
          setOwner("");
          setArea("");
        }}
        className="bg-emerald-600 text-white rounded px-3"
      >
        Add
      </button>
    </div>
  );
}
