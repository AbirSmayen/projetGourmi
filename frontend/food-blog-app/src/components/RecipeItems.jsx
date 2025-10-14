import React from "react"
import { useLoaderData } from "react-router-dom"
import foodImg from '../assets/foodRecipe.png'
import { IoTimeOutline } from "react-icons/io5";
import { CiHeart } from "react-icons/ci";



export default function RecipeItems(){
//Récupérer les données de cette fonction de chargeur
const allRecipes=useLoaderData()
console.log(allRecipes)
  return (
    <>
    <div className="card-container">
        {
            allRecipes?.map((item, index) => {
                return (
                    <div key={index} className="card">
                        <img src={`http://localhost:5000/images/${item.coverImage}`} width="120px" height="100px"></img>
                        <div className="card-body">
                            <div className="title">{item.title}</div>
                            <div className="icons">
                                <div className="timer"><IoTimeOutline />30min</div>
                                <CiHeart />
                            </div>
                        </div>
                    </div>
                )
            })
        }
    </div>
    </>
  )
}