import axios from "axios"
import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Swal from "sweetalert2"
import { FaRobot, FaUtensils, FaClock, FaLeaf, FaDownload } from "react-icons/fa"

export default function SaveAIRecipe() {
  const location = useLocation()
  const navigate = useNavigate()
  const aiRecipe = location.state?.aiRecipe || null

  const [recipeData, setRecipeData] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    time: ''
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [useAIImage, setUseAIImage] = useState(false)
  const [downloadingImage, setDownloadingImage] = useState(false)

  useEffect(() => {
    if (!aiRecipe) {
      Swal.fire({
        icon: "warning",
        title: "No AI Recipe",
        text: "Please generate a recipe first using the AI Generator",
        confirmButtonColor: "#667eea"
      }).then(() => {
        navigate("/ai-generator")
      })
      return
    }

    // Pré-remplir avec les données de l'IA
    setRecipeData({
      title: aiRecipe.title || '',
      ingredients: aiRecipe.ingredients || '',
      instructions: aiRecipe.instructions || '',
      time: aiRecipe.time || ''
    })

    // Si l'IA a fourni une image, l'afficher comme preview
    if (aiRecipe.image_url) {
      setPreviewUrl(aiRecipe.image_url)
      setUseAIImage(true)
    }
  }, [aiRecipe, navigate])

  const onHandleChange = (e) => {
    if (e.target.name === "file") {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setUseAIImage(false) // L'utilisateur upload une nouvelle image
      
      if (selectedFile) {
        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)
      }
    } else {
      setRecipeData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }))
    }
  }

  const downloadAIImage = async () => {
    if (!aiRecipe.image_url) return false

    setDownloadingImage(true)

    try {
      // Utiliser un proxy CORS ou télécharger via le backend
      // Option 1: Utiliser cors-anywhere (pour développement uniquement)
      const proxyUrl = 'https://api.allorigins.win/raw?url='
      const imageUrl = encodeURIComponent(aiRecipe.image_url)
      
      const response = await fetch(proxyUrl + imageUrl, {
        method: 'GET',
        mode: 'cors'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }

      const blob = await response.blob()
      const fileName = `${recipeData.title.replace(/\s+/g, '_')}_${Date.now()}.jpg`
      const file = new File([blob], fileName, { type: 'image/jpeg' })
      
      setFile(file)
      setUseAIImage(false)
      
      Swal.fire({
        icon: "success",
        title: "Image Downloaded",
        text: "AI image has been set as your recipe image",
        timer: 1500,
        showConfirmButton: false
      })

      return true
    } catch (error) {
      console.error("Error downloading AI image:", error)
      
      // Fallback: Demander à l'utilisateur d'uploader manuellement
      Swal.fire({
        icon: "warning",
        title: "Image Download Issue",
        text: "Could not download the AI image automatically. Please upload your own image or try again.",
        confirmButtonText: "OK"
      })

      return false
    } finally {
      setDownloadingImage(false)
    }
  }

  const onHandleSubmit = async (e) => {
    e.preventDefault()
    
    // Si on utilise l'image de l'IA et qu'on n'a pas encore de fichier
    if (useAIImage && !file) {
      const downloaded = await downloadAIImage()
      if (!downloaded) {
        // Si le téléchargement échoue, demander à l'utilisateur d'uploader
        Swal.fire({
          icon: "warning",
          title: "Image Required",
          text: "Please upload an image for your recipe",
          confirmButtonText: "OK"
        })
        return
      }
    }

    // Vérifier qu'on a bien un fichier maintenant
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "Image Required",
        text: "Please add an image for your recipe"
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('title', recipeData.title)
      formData.append('ingredients', recipeData.ingredients)
      formData.append('instructions', recipeData.instructions)
      formData.append('time', recipeData.time)
      formData.append('file', file)

      const token = localStorage.getItem("token")
      await axios.post("http://localhost:5000/api/recipes", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'authorization': 'bearer ' + token
        }
      })

      await Swal.fire({
        icon: "success",
        title: "Recipe Saved!",
        text: "Your AI-generated recipe has been added to your collection",
        timer: 2000,
        showConfirmButton: false
      })
      
      navigate("/myRecipe")
    } catch (err) {
      console.error("Error:", err)
      
      if (err.response?.data?.isBlocked) {
        Swal.fire({
          icon: "error",
          title: "Account Blocked",
          text: "Your account has been blocked. You cannot add recipes.",
          confirmButtonColor: "#d33"
        }).then(() => {
          navigate("/")
        })
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "Error saving recipe"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!aiRecipe) {
    return null
  }

  return (
    <section className="book-a-table section" style={{ paddingTop: "100px" }}>
      <div className="container section-title">
        <h2>
          <FaRobot style={{ marginRight: "10px", color: "#667eea" }} />
          Save AI Recipe
        </h2>
        <p>
          <span>Customize &</span>{" "}
          <span className="description-title">Save Your AI Recipe</span>
        </p>
      </div>

      <div className="container">
        <div className="row g-4">
          {/* Info Card avec Image Preview */}
          <div className="col-lg-4">
            <div className="card shadow-sm" style={{ borderRadius: "15px", position: "sticky", top: "100px" }}>
              <div className="card-body p-4">
                <div 
                  className="text-center mb-3 p-3" 
                  style={{ 
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "10px",
                    color: "white"
                  }}
                >
                  <FaRobot size={40} />
                  <h5 className="mt-2 mb-0">AI Generated</h5>
                </div>

                {/* PREVIEW DE L'IMAGE */}
                {previewUrl && (
                  <div className="mb-3">
                    <img 
                      src={previewUrl} 
                      alt="Recipe Preview" 
                      className="img-fluid rounded shadow-sm"
                      style={{ 
                        width: "100%", 
                        height: "250px", 
                        objectFit: "cover",
                        border: "3px solid #667eea"
                      }}
                      onError={(e) => {
                        // Fallback si l'image ne charge pas
                        e.target.style.display = 'none'
                      }}
                    />
                    {useAIImage && !file && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary w-100 mt-2"
                        onClick={downloadAIImage}
                        disabled={downloadingImage}
                      >
                        {downloadingImage ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <FaDownload className="me-2" />
                            Use This AI Image
                          </>
                        )}
                      </button>
                    )}
                    {file && (
                      <div className="alert alert-success mt-2 mb-0 py-2 small">
                        ✓ Image ready to upload
                      </div>
                    )}
                  </div>
                )}

                {aiRecipe.cuisine_type && (
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <FaUtensils className="text-muted" />
                    <span>Cuisine: <strong>{aiRecipe.cuisine_type}</strong></span>
                  </div>
                )}

                {aiRecipe.time && (
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <FaClock className="text-muted" />
                    <span>Time: <strong>{aiRecipe.time}</strong></span>
                  </div>
                )}

                {aiRecipe.nutrition && (
                  <div className="mt-3 pt-3 border-top">
                    <h6><FaLeaf className="me-2 text-success" />Nutrition Info</h6>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {aiRecipe.nutrition.calories > 0 && (
                        <span className="badge bg-warning text-dark">
                          {aiRecipe.nutrition.calories.toFixed(0)} cal
                        </span>
                      )}
                      {aiRecipe.nutrition.protein > 0 && (
                        <span className="badge bg-info">
                          {aiRecipe.nutrition.protein.toFixed(0)}g protein
                        </span>
                      )}
                      {aiRecipe.nutrition.carbs > 0 && (
                        <span className="badge bg-secondary">
                          {aiRecipe.nutrition.carbs.toFixed(0)}g carbs
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="col-lg-8">
            <div className="card shadow-sm" style={{ borderRadius: "15px" }}>
              <div className="card-body p-4">
                <div className="alert alert-info mb-4">
                  <FaRobot className="me-2" />
                  This recipe was generated by AI. You can customize it before saving!
                </div>

                <form onSubmit={onHandleSubmit}>
                  <div className="row gy-4">
                    <div className="col-lg-6 col-md-6">
                      <label htmlFor="title" className="form-label fw-bold">
                        Recipe Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        id="title"
                        value={recipeData.title}
                        onChange={onHandleChange}
                        required
                      />
                    </div>

                    <div className="col-lg-6 col-md-6">
                      <label htmlFor="time" className="form-label fw-bold">
                        Preparation Time *
                      </label>
                      <input
                        type="text"
                        name="time"
                        className="form-control"
                        id="time"
                        value={recipeData.time}
                        onChange={onHandleChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="ingredients" className="form-label fw-bold">
                        Ingredients *
                      </label>
                      <textarea
                        className="form-control"
                        name="ingredients"
                        id="ingredients"
                        rows="5"
                        value={recipeData.ingredients}
                        onChange={onHandleChange}
                        required
                      ></textarea>
                      <small className="text-muted">Separate ingredients with commas</small>
                    </div>

                    <div className="col-12">
                      <label htmlFor="instructions" className="form-label fw-bold">
                        Instructions *
                      </label>
                      <textarea
                        className="form-control"
                        name="instructions"
                        id="instructions"
                        rows="8"
                        value={recipeData.instructions}
                        onChange={onHandleChange}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label htmlFor="file" className="form-label fw-bold">
                        Recipe Image *
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        name="file"
                        id="file"
                        accept="image/*"
                        onChange={onHandleChange}
                      />
                      <small className="text-muted">
                        {useAIImage && !file
                          ? "Click 'Use This AI Image' button above, or upload your own image" 
                          : file 
                            ? `Selected: ${file.name}`
                            : "Upload your own image or use the AI generated image above"}
                      </small>
                    </div>
                  </div>

                  <div className="d-flex gap-3 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-grow-1"
                      onClick={() => navigate("/ai-generator")}
                    >
                      ← Back to Generator
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-grow-1"
                      disabled={loading || downloadingImage}
                      style={{ 
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none"
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaRobot className="me-2" />
                          Save Recipe
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}