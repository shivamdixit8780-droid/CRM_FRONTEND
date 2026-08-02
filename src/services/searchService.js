import api from "./api";

export const globalSearch = (query) => api.get(`/search?q=${encodeURIComponent(query)}`);