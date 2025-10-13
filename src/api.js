import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // ? "https://eland.xetroot.com/api"
  // : "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers.Accept = "application/json";
  return config;
});

// Mutation API methods
export const getMutations = (params = {}) => api.get("/mutations", { params });
export const createMutation = (data) => api.post("/mutations", data);
export const getMutation = (id) => api.get(`/mutations/${id}`);
export const updateMutationStatus = (id, data) =>
  api.patch(`/mutations/${id}/status`, data);
export const uploadMutationDocuments = (id, formData) =>
  api.post(`/mutations/${id}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const payMutation = (id, data) => api.post(`/mutations/${id}/pay`, data);
export const getMutationInvoice = (id) =>
  api.get(`/mutations/${id}/invoice`, { responseType: "blob" });

// Applications
export const getApplications = (params = {}) =>
  api.get("/applications", { params });

// Mouza Maps
export const getMouzaMaps = () => api.get("/admin/mouza-maps");
export const createMouzaMap = (formData) =>
  api.post("/admin/mouza-maps", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateMouzaMap = (id, formData) => {
  formData.append("_method", "PUT");

  formData.append("_method", "PUT");

  return api.post(`/admin/mouza-maps/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteMouzaMap = (id) => api.delete(`/admin/mouza-maps/${id}`);

//Admin Side: Polygon /GeoJSON Save
export const saveDagGeometry = (dagId, data) =>
  api.post(`/admin/dags/${dagId}/geometry`, data, {
    headers: { "Content-Type": "application/json" },
  });

//User Side: search by dag_no (show map)
export const searchDagGeometry = (dagNo, params = {}) =>
  api.get(`/map/dags/search/${dagNo}`, { params });

export default api;
