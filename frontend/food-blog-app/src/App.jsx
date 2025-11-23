import React from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from "./pages/Home";
import MainNavigation from "./components/MainNavigation";
import axios from 'axios'
import AddfoodRecipe from "./pages/AddfoodRecipe";
import EditRecipe from "./pages/EditRecipe";
import RecipeDetails from "./pages/RecipeDetails";
import UserProfile from "./pages/UserProfile";
import AIRecipeGenerator from "./pages/AIRecipeGenerator"; // Générateur IA
import SaveAIRecipe from "./pages/SaveAIRecipe"; // Sauvegarde recette IA


// Récupérer les données de la BD
const getAllRecipes = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/recipes`)
    return res.data
  } catch (error) {
    console.error("Erreur lors du chargement des recettes :", error)
    throw error
  }
}

const getMyRecipes = async () => {
  let user = JSON.parse(localStorage.getItem("user"))
  let allRecipes = await getAllRecipes()
  return allRecipes.filter(item => item.createdBy === user._id)
}


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainNavigation />,
    children: [
      { path: "/", element: <Home />, loader: getAllRecipes },
      { path: "/myRecipe", element: <Home />, loader: getMyRecipes },
      { path: "/addRecipe", element: <AddfoodRecipe /> },
      { path: "/editRecipe/:id", element: <EditRecipe /> },
      { path: "/recipe/:id", element: <RecipeDetails /> },
      { path: "/profile", element: <UserProfile /> },
      { path: "/ai-generator", element: <AIRecipeGenerator /> }, 
      { path: "/save-ai-recipe", element: <SaveAIRecipe /> },
    ]
  },
])


export default function App() {
  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  )
}