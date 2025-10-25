import React from "react"
import {createBrowserRouter,RouterProvider} from "react-router-dom"
import Home from "./pages/Home";
import MainNavigation from "./components/MainNavigation";
import axios from 'axios'
import AddfoodRecipe from "./pages/AddfoodRecipe";
import EditRecipe from "./pages/EditRecipe";
import RecipeDetails from "./pages/RecipeDetails";


//Récupérer les données de la BD: nous néfinier les méthodes nécessaires
//getAllRecipes renvoie toutes les recettes
const getAllRecipes = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/recipe`)
    return res.data // On renvoie les données directement
  } catch (error) {
    console.error("Erreur lors du chargement des recettes :", error)
    throw error
  }
}

const getMyRecipes=async()=>{
  //on récupère les données de l'utilisateur à partir du stockage local
  let user=JSON.parse(localStorage.getItem("user"))
  let allRecipes=await getAllRecipes()
  //on filtre les recettes en fonction de l'utilisateur connecté actuel 
  return allRecipes.filter(item=>item.createdBy===user._id)
}


const router=createBrowserRouter([
  {path:"/",element:<MainNavigation/>,children:[
      {path:"/",element:<Home/>,loader:getAllRecipes}, // je met l'element que je souhaite affiché : affiche le composant Home
      {path:"/myRecipe",element:<Home/>,loader:getMyRecipes},
      {path:"/addRecipe",element:<AddfoodRecipe/>},
      {path:"/editRecipe/:id",element:<EditRecipe/>},
      {path:"/recipe/:id", element:<RecipeDetails/>},


  ]},
])


export default function App(){
  return (
    <>
    <RouterProvider router={router}></RouterProvider>
    </>
  )
}