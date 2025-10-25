import axios from "axios"
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Swal from "sweetalert2" 

export default function EditRecipe(){
  const [recipeData, setRecipeData] = useState({})
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    const getData = async() => {
      try {
        const response = await axios.get(`http://localhost:5000/recipe/${id}`)
        let res = response.data
        setRecipeData({
          title: res.title,
          ingredients: Array.isArray(res.ingredients) ? res.ingredients.join(", ") : res.ingredients,
          instructions: res.instructions,
          time: res.time
        })
        setLoading(false)
      } catch (err) {
        console.error("Error loading recipe:", err)
        Swal.fire({
          title: 'Erreur!',
          text: 'Impossible de charger la recette.',
          icon: 'error'
        }).then(() => navigate("/myRecipe"))
      }
    }
    getData()
  }, [id, navigate])

  const onHandleChange = (e) => {
    if (e.target.name === "file") {
      setFile(e.target.files[0])
    } else {
      setRecipeData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }))
    }
  }

  const onHandleSubmit = async(e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('title', recipeData.title)
      formData.append('ingredients', recipeData.ingredients)
      formData.append('instructions', recipeData.instructions)
      formData.append('time', recipeData.time)
      
      if (file) {
        formData.append('file', file)
      }

      const token = localStorage.getItem("token")
      const response = await axios.put(`http://localhost:5000/recipe/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'authorization': 'bearer ' + token
        }
      })
      
      // Utiliser SweetAlert au lieu de alert
      if (response.data.success) {
        await Swal.fire({
          title: 'Succès!',
          text: 'La recette a été modifiée avec succès.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
        navigate("/myRecipe")
      } else {
        Swal.fire({
          title: 'Erreur!',
          text: response.data.message || 'Impossible de modifier la recette.',
          icon: 'error'
        })
      }
    } catch (err) {
      console.error("Error updating recipe:", err)
      Swal.fire({
        title: 'Erreur!',
        text: err.response?.data?.message || 'Une erreur est survenue.',
        icon: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading recipe...</p>
      </div>
    )
  }

  return (
    <section className="book-a-table section">
      <div className="container section-title">
        <h2>Edit Recipe</h2>
        <p><span>Update Your</span> <span className="description-title">Recipe Details</span></p>
      </div>

      <div className="container">
        <div className="row g-0">
          <div className="col-lg-12 d-flex align-items-center reservation-form-bg">
            <form className="php-email-form w-100" onSubmit={onHandleSubmit}>
              <div className="row gy-4">
                <div className="col-lg-6 col-md-6">
                  <label htmlFor="title" className="form-label">Recipe Title *</label>
                  <input 
                    type="text" 
                    name="title" 
                    className="form-control" 
                    id="title" 
                    onChange={onHandleChange}
                    value={recipeData.title || ''}
                    required
                  />
                </div>

                <div className="col-lg-6 col-md-6">
                  <label htmlFor="time" className="form-label">Preparation Time *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="time" 
                    id="time" 
                    onChange={onHandleChange}
                    value={recipeData.time || ''}
                    required
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="ingredients" className="form-label">Ingredients (separate with commas) *</label>
                  <textarea 
                    className="form-control" 
                    name="ingredients" 
                    id="ingredients"
                    rows="5" 
                    onChange={onHandleChange}
                    value={recipeData.ingredients || ''}
                    required
                  ></textarea>
                </div>

                <div className="col-12">
                  <label htmlFor="instructions" className="form-label">Instructions *</label>
                  <textarea 
                    className="form-control" 
                    name="instructions" 
                    id="instructions"
                    rows="6" 
                    onChange={onHandleChange}
                    value={recipeData.instructions || ''}
                    required
                  ></textarea>
                </div>

                <div className="col-12">
                  <label htmlFor="file" className="form-label">Recipe Image (optional)</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    name="file" 
                    id="file"
                    accept="image/*"
                    onChange={onHandleChange}
                  />
                  <small className="text-muted">Leave empty to keep the current image</small>
                </div>
              </div>

              <div className="text-center mt-4">
                {submitting && <div className="loading">Updating...</div>}
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? 'Updating Recipe...' : 'Update Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}