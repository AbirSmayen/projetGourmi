import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"

export default function RecipeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRecipe = async () => {
      console.log("Fetching recipe with ID:", id)
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get(`http://localhost:5000/api/recipes/${id}`)
        console.log("Recipe data:", res.data)
        setRecipe(res.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching recipe:", err)
        setError(err.response?.data?.message || err.message || "Failed to load recipe")
        setLoading(false)
      }
    }

    if (id) {
      fetchRecipe()
    }
  }, [id])

  // Fonction pour obtenir les ingrédients en tableau
  const getIngredientsArray = (ingredients) => {
    if (Array.isArray(ingredients)) {
      return ingredients
    }
    if (typeof ingredients === 'string') {
      return ingredients.split(',').map(item => item.trim())
    }
    return []
  }

  // Fonction pour obtenir le nom complet de l'utilisateur
  const getUserFullName = (createdBy) => {
    if (!createdBy) return "Utilisateur anonyme"
    
    const firstName = createdBy.firstName || ""
    const lastName = createdBy.lastName || ""
    
    // Si les deux sont disponibles
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    
    // Si seulement un des deux est disponible
    if (firstName) return firstName
    if (lastName) return lastName
    
    // Sinon utiliser l'email
    return createdBy.email || "Utilisateur anonyme"
  }

  if (loading) {
    return (
      <div className="container text-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h2 className="mt-4">Loading recipe...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger" role="alert">
          <h4>Error loading recipe</h4>
          <p>{error}</p>
        </div>
        <button onClick={() => navigate("/")} className="btn-get-started mt-3">
          Back to Home
        </button>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="container text-center py-5">
        <h2>Recipe not found</h2>
        <button onClick={() => navigate("/")} className="btn-get-started mt-3">
          Back to Home
        </button>
      </div>
    )
  }

  const ingredientsArray = getIngredientsArray(recipe.ingredients)

  return (
    <section className="section" style={{ paddingTop: '80px' }}>
      <div className="container">
        {/* Header */}
        <div className="section-title">
          <h2 style={{ fontWeight: "bold", fontSize: "2.2rem" }}>
            {recipe.title}
          </h2>
          <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
            <span className="badge bg-primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              ⏱️ {recipe.time}
            </span>
            {recipe.createdBy && (
              <span className="badge bg-secondary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                👤 {getUserFullName(recipe.createdBy)}
              </span>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-6 col-md-8 col-sm-10">
            <img
              src={`http://localhost:5000/images/${recipe.coverImage}`}
              alt={recipe.title}
              className="img-fluid rounded shadow-lg"
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: '15px'
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="row gy-4">
          {/* Ingredients */}
          <div className="col-lg-5">
            <div className="card h-100 shadow-sm" style={{ borderRadius: '10px' }}>
              <div className="card-body">
                <h3 className="card-title mb-4" style={{ color: '#ce1212' }}>
                  🛒 Ingredients
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '16px' }}>
                  {ingredientsArray.map((ing, i) => (
                    <li
                      key={i}
                      style={{
                        marginBottom: '12px',
                        paddingLeft: '25px',
                        position: 'relative',
                        lineHeight: '1.6'
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          color: '#28a745',
                          fontSize: '18px'
                        }}
                      >
                        ✓
                      </span>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="col-lg-7">
            <div className="card h-100 shadow-sm" style={{ borderRadius: '10px' }}>
              <div className="card-body">
                <h3 className="card-title mb-4" style={{ color: '#ce1212' }}>
                  📝 Instructions
                </h3>
                <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontSize: '16px' }}>
                  {recipe.instructions}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-5 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="btn-get-started"
            style={{ padding: '12px 30px' }}
          >
            ← Back
          </button>
        </div>
      </div>
    </section>
  )
}