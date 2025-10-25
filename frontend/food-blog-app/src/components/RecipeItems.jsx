import React, { useEffect, useState } from "react"
import { Link, useLoaderData } from "react-router-dom"
import { IoTimeOutline } from "react-icons/io5"
import { CiEdit } from "react-icons/ci"
import { MdDelete } from "react-icons/md"
import axios from "axios"

export default function RecipeItems(){
  const recipes = useLoaderData()
  const [allRecipes, setAllRecipes] = useState()
  let path = window.location.pathname === "/myRecipe" ? true : false

  useEffect(() => {
    setAllRecipes(recipes)
  }, [recipes])

  const onDelete = async(id) => {
    await axios.delete(`http://localhost:5000/recipe/${id}`)
      .then((res) => console.log(res))
    setAllRecipes(recipes => recipes.filter(recipe => recipe._id !== id))
  }

  return (
    <section id="menu" className="menu section">
      <div className="container section-title" data-aos="fade-up">
        <h2>{path ? "My Recipes" : "Our Recipes"}</h2>
        <p>
          <span>{path ? "Manage Your" : "Check Our"}</span>{" "}
          <span className="description-title">Delicious Recipes</span>
        </p>
      </div>

      <div className="container">
        <div className="row gy-5" data-aos="fade-up" data-aos-delay="200">
          {allRecipes?.map((item, index) => {
            return (
              <div key={index} className="col-lg-4 col-md-6 menu-item">
                <Link to={`/recipe/${item._id}`} className="glightbox">
                  <img 
                    src={`http://localhost:5000/images/${item.coverImage}`} 
                    className="menu-img img-fluid" 
                    alt={item.title}
                    style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </Link>
                
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <h4>{item.title}</h4>
                  {path && (
                    <div className="d-flex gap-2">
                      <Link 
                        to={`/editRecipe/${item._id}`} 
                        className="btn btn-sm btn-outline-primary"
                        style={{ padding: '5px 10px' }}
                      >
                        <CiEdit size={18} />
                      </Link>
                      <button 
                        onClick={() => onDelete(item._id)} 
                        className="btn btn-sm btn-outline-danger"
                        style={{ padding: '5px 10px' }}
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="ingredients d-flex align-items-center gap-2 mt-2">
                  <IoTimeOutline size={18} />
                  {item.time}
                </p>
              </div>
            )
          })}
        </div>

        {(!allRecipes || allRecipes.length === 0) && (
          <div className="text-center py-5">
            <p className="fs-5 text-muted">
              {path ? "You haven't added any recipes yet." : "No recipes available."}
            </p>
            {path && (
              <Link to="/addfoodRecipe" className="btn-getstarted mt-3">
                Add Your First Recipe
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  )
}