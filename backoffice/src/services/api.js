import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${apiUrl}/api/admin`,
});

console.log("API Base URL:", `${apiUrl}/api/admin`);

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("auth");
  if (raw) {
    try {
      const auth = JSON.parse(raw);
      if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    } catch (e) {
      console.error("Erreur lors de la lecture du token:", e);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// === USERS ===
export const getUsers = () => api.get("/users");
export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const blockUser = (id, isBlocked) => api.patch(`/users/${id}/block`, { isBlocked });
export const deleteUser = (id) => api.delete(`/users/${id}`);

// === RECIPES ===
export const getRecipes = () => api.get("/recipes");
export const acceptRecipe = (id, isAccepted) =>
  api.put(`/recipes/${id}/accept`, { isAccepted });
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);
export const createOfficialRecipe = (formData) => 
  api.post("/recipes/official", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

// === STATISTICS ===
export const getStats = () => api.get("/stats");

// === PROFILE ===
export const getProfile = () => api.get("/profile");
export const updateEmail = (newEmail) => api.put("/profile/email", { newEmail });
export const updatePassword = (passwordData) => api.put("/profile/password", passwordData);

export default api;