import React, { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Link } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2" 
import Modal from "../components/Modal"
import InputForm from "../components/InputForm"
import { IoTimeOutline } from "react-icons/io5"
import { CiEdit } from "react-icons/ci"
import { MdDelete } from "react-icons/md"

export default function Home(){
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const isMyRecipePage = location.pathname === "/myRecipe"

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true)
      setError(null)
      
      try {
        if (isMyRecipePage) {
          const token = localStorage.getItem("token")
          if (!token) {
            setRecipes([])
            setLoading(false)
            return
          }
          
          const res = await axios.get('http://localhost:5000/api/recipes/my', {
            headers: {
              'authorization': 'bearer ' + token
            }
          })
          setRecipes(res.data)
        } else {
          const res = await axios.get('http://localhost:5000/api/recipes')
          setRecipes(res.data)
        }
        setLoading(false)
      } catch (err) {
        console.error("Erreur:", err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    fetchRecipes()
  }, [isMyRecipePage])

  const addRecipe = () => {
    let token = localStorage.getItem("token")
    if(token){
      navigate("/addRecipe")
    }
    else{ 
      setIsOpen(true)
    }
  }

  const onDelete = async(id) => {
    // Confirmation avec SweetAlert2
    const result = await Swal.fire({
      title: 'Are you sure ?',
      text: "This action is irreversible!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`http://localhost:5000/recipe/${id}`, {
          headers: {
            'authorization': 'bearer ' + localStorage.getItem("token")
          }
        })

        // Si la suppression réussit
        if (response.data.success) {
          // Afficher le message de succès
          Swal.fire({
            title: 'Deleted!',
            text: 'Recipe was successfully deleted.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })
          
          // Retirer la recette de la liste
          setRecipes(recipes => recipes.filter(recipe => recipe._id !== id))
        } else {
          // Erreur renvoyée par le backend
          Swal.fire({
            title: 'Erreur!',
            text: response.data.message || 'Impossible de supprimer la recette.',
            icon: 'error'
          })
        }
      } catch (err) {
        console.error("Error deleting recipe:", err)
        Swal.fire({
          title: 'Erreur!',
          text: 'Une erreur est survenue lors de la suppression.',
          icon: 'error'
        })
      }
    }
  }

  return (
    <>
      <main className="main">
        {/* Hero Section */}
        <section id="hero" className="hero section light-background">
          <div className="container">
            <div className="row gy-4 justify-content-center justify-content-lg-between">
              <div className="col-lg-5 order-2 order-lg-1 d-flex flex-column justify-content-center">
                <h1>Share Your Culinary Creations</h1>
                <p>
                  Discover amazing recipes from food lovers around the world, 
                  and build a community united by the love of great food.
                </p>
                <div className="d-flex">
                  <button onClick={addRecipe} className="btn-get-started">
                    Share Your Recipe
                  </button>
                </div>
              </div>
              <div className="col-lg-5 order-1 order-lg-2 hero-img">
                <img src="/template/assets/img/hero-img.png" className="img-fluid animated" alt="Food Recipe" />
              </div>
            </div>
          </div>
        </section>

        {/* Recipe Section */}
        <section id="menu" className="menu section">
          <div className="container section-title">
            <h2>{isMyRecipePage ? "My Recipes" : "Our Recipes"}</h2>
            <p>
              <span>{isMyRecipePage ? "Manage Your" : "Check Our"}</span>{" "}
              <span className="description-title">Delicious Recipes</span>
            </p>
          </div>

          <div className="container">
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading recipes...</p>
              </div>
            )}

            {error && (
              <div className="alert alert-danger" role="alert">
                Error loading recipes: {error}
                <br />
                Make sure your backend is running on http://localhost:5000
              </div>
            )}

            {!loading && !error && recipes.length === 0 && (
              <div className="text-center py-5">
                <p className="fs-5 text-muted">
                  {isMyRecipePage ? "You haven't added any recipes yet." : "No recipes available yet."}
                </p>
                {isMyRecipePage && (
                  <button onClick={addRecipe} className="btn-get-started mt-3">
                    Add Your First Recipe
                  </button>
                )}
              </div>
            )}

            <div className="row gy-4">
              {recipes.map((item, index) => (
                <div key={index} className="col-xl-3 col-lg-4 col-md-6 menu-item">
                  <Link to={`/recipe/${item._id}`}>
                    <img 
                      src={`http://localhost:5000/images/${item.coverImage}`} 
                      className="menu-img img-fluid" 
                      alt={item.title}
                      style={{ 
                        width: '100%', 
                        height: '200px', 
                        objectFit: 'contain', 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease',
                        backgroundColor: '#f8f9fa'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </Link>
                  
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <h4 className="text-center w-100">{item.title}</h4>
                    {isMyRecipePage && (
                      <div className="d-flex gap-2" style={{ minWidth: 'fit-content' }}>
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
                  
                  <p className="ingredients d-flex align-items-center justify-content-center gap-2 mt-2">
                    <IoTimeOutline size={18} />
                    {item.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <InputForm setIsOpen={() => setIsOpen(false)} />
        </Modal>
      )}
    </>
  )
}