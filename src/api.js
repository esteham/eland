import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? "https://eland.xetroot.com/api"
    : "http://127.0.0.1:8000/api",
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

// Notification API methods
export const getNotifications = () => api.get("/notifications");
export const markNotificationAsRead = (id) =>
  api.patch(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () =>
  api.patch("/notifications/mark-all-read");
export const getUnreadNotificationCount = () =>
  api.get("/notifications/unread-count");
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

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

// GeoJSON Datas (Admin CRUD)
export const createGeojsonData = (data) =>
  api.post(`/admin/geojson-datas`, data, {
    headers: { "Content-Type": "application/json" },
  });
export const updateGeojsonData = (id, data) =>
  api.put(`/admin/geojson-datas/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });
export const deleteGeojsonData = (id) =>
  api.delete(`/admin/geojson-datas/${id}`);

// Public: fetch latest by dag_no
export const getGeojsonByDagNo = (dagNo, params = {}) =>
  api.get(`/map/geojson/by-dag/${encodeURIComponent(dagNo)}`, { params });

// Dag Geometry
export const saveDagGeometry = (id, data) =>
  api.post(`/admin/geojson-datas`, { dag_id: id, ...data });
export const searchDagGeometry = (dagNo, params = {}) =>
  api.get(`/map/geojson/by-dag/${encodeURIComponent(dagNo)}`, { params });

export default api;
