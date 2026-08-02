import api from "./api";

export const getMyProfile = () => api.get("/users/me");
export const updateMyProfile = (data) => api.put("/users/me", data);