import React from "react"
import './App.css'
import {createBrowserRouter,RouterProvider} from "react-router-dom"
import Home from "./pages/Home";
import MainNavigation from "./components/MainNavigation";
import axios from 'axios'

//Récupérer les données de la BD: nous néfinier les méthodes nécessaires
const getAllRecipes = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/recipe`)
    return res.data // On renvoie les données directement
  } catch (error) {
    console.error("Erreur lors du chargement des recettes :", error)
    throw error
  }
}

const router=createBrowserRouter([
  {path:"/",element:<MainNavigation/>,children:[
      {path:"/",element:<Home/>,loader:getAllRecipes}, // je met l'element que je souhaite affiché : affiche le composant Home
      {path:"/myRecipe",element:<Home/>},
      {path:"/favRecipe",element:<Home/>},

  ]},
])


export default function App(){
  return (
    <>
    <RouterProvider router={router}></RouterProvider>
    </>
  )
}