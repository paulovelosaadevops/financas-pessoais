import axios from "axios";

const api = axios.create({
  baseURL: "/api", // 🔹 Nginx faz o proxy interno para o backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
