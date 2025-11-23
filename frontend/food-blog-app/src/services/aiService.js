/**
 * Service pour communiquer avec l'API IA de génération de recettes
 */

import axios from 'axios';

// URL de l'API Python Flask
const AI_API_URL = 'http://localhost:8000/api';

// Instance axios configurée pour l'API IA
const aiApi = axios.create({
  baseURL: AI_API_URL,
  timeout: 30000, // 30 secondes (la génération peut prendre du temps)
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Vérifie si l'API IA est disponible
 */
export const checkAIHealth = async () => {
  try {
    const response = await aiApi.get('/health');
    return response.data;
  } catch (error) {
    console.error('AI API Health Check Failed:', error);
    return { status: 'unhealthy', error: error.message };
  }
};

/**
 * Récupère la liste des types de cuisine disponibles
 */
export const getCuisines = async () => {
  try {
    const response = await aiApi.get('/cuisines');
    return response.data;
  } catch (error) {
    console.error('Error fetching cuisines:', error);
    throw error;
  }
};

/**
 * Génère des recettes basées sur les ingrédients et le type de cuisine
 * @param {string[]} ingredients - Liste des ingrédients
 * @param {string} cuisineType - Type de cuisine (italian, french, asian, etc.)
 * @param {number} maxRecipes - Nombre maximum de recettes à générer
 */
export const generateRecipes = async (ingredients, cuisineType = 'all', maxRecipes = 5) => {
  try {
    console.log('Sending request to AI API:', { ingredients, cuisineType, maxRecipes });
    
    const response = await aiApi.post('/generate', {
      ingredients,
      cuisine_type: cuisineType,
      max_recipes: maxRecipes,
      min_score: 0.05
    });
    
    console.log('AI API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error generating recipes:', error);
    
    // Améliorer le message d'erreur
    if (error.code === 'ECONNREFUSED') {
      throw new Error('AI Server is not running. Please start api.py on port 8000');
    }
    
    throw error;
  }
};

/**
 * Récupère les détails d'une recette générée par son ID
 * @param {number} recipeId - ID de la recette dans le dataset
 */
export const getAIRecipeDetails = async (recipeId) => {
  try {
    const response = await aiApi.get(`/recipe/${recipeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching AI recipe details:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques du dataset de recettes
 */
export const getAIStats = async () => {
  try {
    const response = await aiApi.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching AI stats:', error);
    throw error;
  }
};

export default {
  checkAIHealth,
  getCuisines,
  generateRecipes,
  getAIRecipeDetails,
  getAIStats
};