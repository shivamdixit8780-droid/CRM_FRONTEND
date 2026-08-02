import api from "./api";

export const getReports = (startDate, endDate) => {
  if (startDate && endDate) {
    return api.get(`/reports?startDate=${startDate}&endDate=${endDate}`);
  }
  return api.get("/reports");
};