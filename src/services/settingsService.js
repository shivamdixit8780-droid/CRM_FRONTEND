import api from "./api";

export const getCompanySettings = () => api.get("/company-settings");

export const updateCompanySettings = (formData) => {
  return api.put("/company-settings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const changePassword = (data) => api.put("/users/change-password", data);

export const getLoginHistory = () => api.get("/login-history");