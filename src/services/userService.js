import api from "./api";

export const getEmployees = () => api.get("/users");
export const updateUserRole = (id, role) => api.put(`/users/${id}/role`, { role });