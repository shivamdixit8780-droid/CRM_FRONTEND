import api from "./api";

export const getDashboardOverview = (employeeId) => {
  const params = new URLSearchParams();
  if (employeeId) params.append("employeeId", employeeId);
  return api.get(`/dashboard?${params.toString()}`);
};