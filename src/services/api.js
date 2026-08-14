// import axios from 'axios';

// // const API = axios.create({
// //   baseURL: 'https://crm-backend-17eq.onrender.com/api',
// // });

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",  // ✅ Local
// });

// API.interceptors.request.use((req) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     req.headers.Authorization = `Bearer ${token}`;
//   }
//   return req;
// });

// export default API;
import axios from "axios";

// ✅ Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// ✅ Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;