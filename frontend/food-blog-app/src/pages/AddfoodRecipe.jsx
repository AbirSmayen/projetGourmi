import axios from "axios"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function AddfoodRecipe() {
  const [recipeData, setRecipeData] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    time: ''
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onHandleChange = (e) => {
    if (e.target.name === "file") {
      // Gérer le fichier séparément
      setFile(e.target.files[0])
    } else {
      // Gérer les autres champs
      setRecipeData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }))
    }
  }

  const onHandleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Créer FormData
      const formData = new FormData()
      formData.append('title', recipeData.title)
      formData.append('ingredients', recipeData.ingredients)
      formData.append('instructions', recipeData.instructions)
      formData.append('time', recipeData.time)
      if (file) {
        formData.append('file', file)
      }

      // Envoyer la requête
      const token = localStorage.getItem("token")
      await axios.post("http://localhost:5000/recipe", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'authorization': 'bearer ' + token
        }
      })

      alert("Recipe added successfully!")
      navigate("/myRecipe")
    } catch (err) {
      console.error("Error:", err)
      alert("Error adding recipe: " + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="book-a-table section">
      <div className="container section-title">
        <h2>Add New Recipe</h2>
        <p>
          <span>Share Your</span>{" "}
          <span className="description-title">Delicious Recipe</span>
        </p>
      </div>

      <div className="container">
        <div className="row g-0">
          <div className="col-lg-12 d-flex align-items-center reservation-form-bg">
            <form className="php-email-form w-100" onSubmit={onHandleSubmit}>
              <div className="row gy-4">
                <div className="col-lg-6 col-md-6">
                  <label htmlFor="title" className="form-label">
                    Recipe Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    id="title"
                    placeholder="Ex: Chocolate Cake"
                    value={recipeData.title}
                    onChange={onHandleChange}
                    required
                  />
                </div>

                <div className="col-lg-6 col-md-6">
                  <label htmlFor="time" className="form-label">
                    Preparation Time *
                  </label>
                  <input
                    type="text"
                    name="time"
                    className="form-control"
                    id="time"
                    placeholder="Ex: 30 minutes"
                    value={recipeData.time}
                    onChange={onHandleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="ingredients" className="form-label">
                    Ingredients (separate with commas) *
                  </label>
                  <textarea
                    className="form-control"
                    name="ingredients"
                    id="ingredients"
                    rows="5"
                    placeholder="Ex: 2 cups flour, 1 cup sugar, 3 eggs..."
                    value={recipeData.ingredients}
                    onChange={onHandleChange}
                    required
                  ></textarea>
                </div>

                <div className="col-12">
                  <label htmlFor="instructions" className="form-label">
                    Instructions *
                  </label>
                  <textarea
                    className="form-control"
                    name="instructions"
                    id="instructions"
                    rows="6"
                    placeholder="Describe the cooking steps..."
                    value={recipeData.instructions}
                    onChange={onHandleChange}
                    required
                  ></textarea>
                </div>

                <div className="col-12">
                  <label htmlFor="file" className="form-label">
                    Recipe Image *
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    name="file"
                    id="file"
                    accept="image/*"
                    onChange={onHandleChange}
                    required
                  />
                  <small className="text-muted">
                    Upload an appetizing photo of your dish
                  </small>
                </div>
              </div>

              <div className="text-center mt-4">
                {loading && <div className="loading">Uploading...</div>}
                <button
                  type="submit"
                  disabled={loading}
                  style={{ opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? "Adding Recipe..." : "Add Recipe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}