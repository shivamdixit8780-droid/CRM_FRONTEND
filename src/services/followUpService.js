import api from "./api";

export const getFollowUps = () => api.get("/followups");
export const createFollowUp = (data) => api.post("/followups", data);
export const updateFollowUp = (id, data) => api.put(`/followups/${id}`, data);
export const deleteFollowUp = (id) => api.delete(`/followups/${id}`);