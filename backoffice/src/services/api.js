import axios from "axios";

// Base URL de l'API - Ne PAS inclure /api dans VITE_API_URL
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Instance axios pour les routes admin
const api = axios.create({
  baseURL: `${apiUrl}/api/admin`,
});

// Log pour debug (à retirer en production)
console.log(" API Base URL:", `${apiUrl}/api/admin`);

// Intercepteur pour ajouter le token à chaque requête
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

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré
      localStorage.removeItem("auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// === USERS ===
export const getUsers = () => api.get("/users");
export const deleteUser = (id) => api.delete(`/users/${id}`);

// === RECIPES ===
export const getRecipes = () => api.get("/recipes");
export const validateRecipe = (id, isOfficial) =>
  api.put(`/recipes/${id}/validate`, { isOfficial });
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);

// CORRECTION : Envoyer FormData au lieu de JSON
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