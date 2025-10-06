// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://financas-backend-qaix.onrender.com",
});

export default api;
