import api from "./api";

export const getOrders = (startDate, endDate) => {
  if (startDate && endDate) {
    return api.get(`/orders?startDate=${startDate}&endDate=${endDate}`);
  }
  return api.get("/orders"); // bina dates ke — backend khud current month le lega
};

export const createOrder = (data) => api.post("/orders", data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);