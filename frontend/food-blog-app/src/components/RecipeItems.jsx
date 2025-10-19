import React, { useEffect, useState } from "react"
import { Link, useLoaderData } from "react-router-dom"
import { IoTimeOutline } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import axios from "axios";


export default function RecipeItems(){
//Récupérer les données de cette fonction de chargeur
const recipes=useLoaderData()
//on stocke toutes les données de recette dans un état d'utilisation
const [allRecipes,setAllRecipes]=useState()
let path=window.location.pathname === "/myRecipe" ? true :false

console.log(allRecipes)

useEffect(()=>{
    setAllRecipes(recipes)
},[recipes])


const onDelete=async(id)=>{
    await axios.delete(`http://localhost:5000/recipe/${id}`)
            .then((res)=>console.log(res))
    setAllRecipes(recipes=>recipes.filter(recipe=>recipe._id !== id))
}

  return (
    <>
    <div className="card-container">
        {
            allRecipes?.map((item, index) => {
                return (
                    <div key={index} className="card">
                        <Link to={`/recipe/${item._id}`} className="card-link">
                            <img src={`http://localhost:5000/images/${item.coverImage}`} width="120px" height="100px"></img>
                            <div className="card-body">
                                <div className="title">{item.title}</div>
                                <div className="icons">
                                    <div className="timer"><IoTimeOutline />{item.time}</div>
                                </div>
                            </div>
                        </Link>
                        {path && 
                            <div className="action">
                                <Link to={`/editRecipe/${item._id}`} className="editIcon"><CiEdit /></Link>
                                <MdDelete onClick={()=>onDelete(item._id)} className="deleteIcon"/>
                            </div>
                        }
                    </div>
                )
            })
        }
    </div>
    </>
  )
}