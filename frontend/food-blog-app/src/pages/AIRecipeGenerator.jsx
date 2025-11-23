import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { generateRecipes, getCuisines, checkAIHealth } from "../services/aiService";
import { FaRobot, FaClock, FaUtensils, FaCheckCircle, FaPlus, FaTimes, FaSearch, FaLeaf, FaChevronDown, FaChevronUp, FaExclamationTriangle } from "react-icons/fa";
import { GiCookingPot } from "react-icons/gi";
import Modal from "../components/Modal";
import InputForm from "../components/InputForm";

export default function AIRecipeGenerator() {
  const navigate = useNavigate();

  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [cuisines, setCuisines] = useState([]);
  const [maxRecipes, setMaxRecipes] = useState(5);
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoading, setImageLoading] = useState({});

  useEffect(() => {
    const checkStatus = async () => {
      const health = await checkAIHealth();
      setAiStatus(health.status === "healthy");
    };
    checkStatus();
    loadCuisines();
  }, []);

  const loadCuisines = async () => {
    try {
      const result = await getCuisines();
      if (result.success) setCuisines(result.cuisines);
    } catch (err) {
      console.error("Error loading cuisines:", err);
    }
  };

  const addIngredient = () => {
    const trimmed = inputValue.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setInputValue("");
    }
  };

  const removeIngredient = (ing) => {
    setIngredients(ingredients.filter((i) => i !== ing));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Ingredients",
        text: "Please add at least one ingredient",
      });
      return;
    }

    if (!cuisineType) {
      Swal.fire({
        icon: "warning",
        title: "Cuisine Required",
        text: "Please select a cuisine type",
      });
      return;
    }

    setLoading(true);
    setGeneratedRecipes([]);
    setSelectedRecipe(null);
    setImageErrors({});
    setImageLoading({});

    try {
      const result = await generateRecipes(ingredients, cuisineType, maxRecipes);

      if (result.success && result.recipes.length > 0) {
        console.log("Recipes received:", result.recipes);
        
        // Vérifier les URLs d'images
        result.recipes.forEach(recipe => {
          console.log(`Recipe: ${recipe.title}`);
          console.log(`Image URL: ${recipe.image_url}`);
          console.log(`URL valide: ${recipe.image_url?.startsWith('http')}`);
        });

        setGeneratedRecipes(result.recipes);
        Swal.fire({
          icon: "success",
          title: "Recipes Generated!",
          text: `${result.total_found} recipe(s) found matching your ingredients`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "info",
          title: "No Recipes Found",
          text: "Try different ingredients or cuisine type",
        });
      }
    } catch (err) {
      console.error("Generation error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate recipes. Make sure the AI server is running on port 8000",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = (recipe) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoginModalOpen(true);
      return;
    }

    navigate("/save-ai-recipe", {
      state: {
        aiRecipe: {
          title: recipe.title,
          ingredients: recipe.ingredients.join(", "),
          instructions: recipe.instructions.join("\n\n"),
          time: `${recipe.prep_time} minutes`,
          nutrition: recipe.nutrition,
          cuisine_type: recipe.cuisine_type,
          image_url: recipe.image_url,
        },
      },
    });
  };

  const handleImageLoad = (recipeId) => {
    console.log(`Image loaded successfully for recipe ${recipeId}`);
    setImageLoading(prev => ({ ...prev, [recipeId]: false }));
  };

  const handleImageError = (recipeId, recipeTitle, imageUrl) => {
    console.error(`Image failed to load for recipe: ${recipeTitle}`);
    console.error(`   URL was: ${imageUrl}`);
    setImageErrors(prev => ({ ...prev, [recipeId]: true }));
    setImageLoading(prev => ({ ...prev, [recipeId]: false }));
  };

  const getFallbackGradient = (title) => {
    // Créer un dégradé unique basé sur le titre
    const hue = Math.abs(title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360);
    return `linear-gradient(135deg, hsl(${hue}, 70%, 50%) 0%, hsl(${(hue + 60) % 360}, 70%, 40%) 100%)`;
  };

  return (
    <section className="book-a-table section" style={{ minHeight: "100vh", paddingTop: "100px" }}>
      <div className="container section-title">
        <h1>
          <FaRobot style={{ marginRight: "10px" }} /> AI Recipe Generator
        </h1>
        <p>
          <span>Generate</span> <span className="description-title">Smart Recipes</span>
        </p>
      </div>

      <div className="container">
        <div className="row g-4">
          {/* FORM */}
          <div className="col-lg-5">
            <div className="card shadow-sm" style={{ borderRadius: "15px" }}>
              <div className="card-body p-4">
                <h2 className="card-title mb-4">
                  <GiCookingPot size={24} className="me-2" />
                  What's in your kitchen?
                </h2>

                {/* Status de l'API */}
                {aiStatus === false && (
                  <div className="alert alert-danger" role="alert">
                    <FaExclamationTriangle className="me-2" />
                    AI Server is offline. Please start api.py on port 8000
                  </div>
                )}

                {/* INGREDIENT INPUT */}
                <div className="mb-4">
                  <label className="form-label">Add Ingredients</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., chicken, tomato, garlic..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!aiStatus}
                    />
                    <button
                      className="btn"
                      onClick={addIngredient}
                      disabled={!aiStatus}
                      style={{ backgroundColor: "#ce1212", color: "#fff" }}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                {/* INGREDIENT LIST */}
                <div className="mb-4">
                  <label className="form-label">Your Ingredients ({ingredients.length})</label>
                  <div className="d-flex flex-wrap gap-2">
                    {ingredients.length === 0 ? (
                      <span className="text-muted">No ingredients added yet</span>
                    ) : (
                      ingredients.map((ing, idx) => (
                        <span
                          key={idx}
                          className="badge bg-success d-flex align-items-center gap-1"
                          style={{ padding: "8px 12px" }}
                        >
                          <FaLeaf size={12} />
                          {ing}
                          <FaTimes style={{ cursor: "pointer" }} onClick={() => removeIngredient(ing)} />
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* CUISINE SELECT */}
                <div className="mb-4">
                  <label className="form-label">Cuisine Type</label>
                  <select
                    className="form-select"
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                    disabled={!aiStatus}
                  >
                    <option value="" disabled>
                      -- Select a Cuisine --
                    </option>
                    {cuisines.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label} {c.count && `(${c.count.toLocaleString()} recipes)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* RANGE */}
                <div className="mb-4">
                  <label className="form-label">Number of Recipes: {maxRecipes}</label>
                  <input
                    type="range"
                    className="form-range"
                    min="1"
                    max="10"
                    value={maxRecipes}
                    onChange={(e) => setMaxRecipes(parseInt(e.target.value))}
                    disabled={!aiStatus}
                  />
                </div>

                <button
                  className="btn btn-primary w-100 py-3"
                  onClick={handleGenerate}
                  disabled={loading || !aiStatus || ingredients.length === 0}
                  style={{ background: "#ce1212", border: "none" }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaSearch className="me-2" />
                      Generate Recipes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RESULTS - AVEC GESTION D'ERREURS AMÉLIORÉE */}
          <div className="col-lg-7">
            {generatedRecipes.length === 0 ? (
              <div className="text-center py-5">
                <GiCookingPot size={80} style={{ color: "#ccc" }} />
                <h5 className="mt-3 text-muted">Your generated recipes will appear here</h5>
              </div>
            ) : (
              <div className="row g-3">
                {generatedRecipes.map((recipe, idx) => (
                  <div key={idx} className="col-12">
                    <div
                      className="card shadow-sm"
                      style={{
                        borderRadius: "15px",
                        overflow: "hidden",
                        border: selectedRecipe?.id === recipe.id ? "2px solid #ce1212" : "none",
                        transition: "all 0.3s ease"
                      }}
                    >
                      {/* IMAGE DE LA RECETTE - AVEC FALLBACK AMÉLIORÉ */}
                      <div 
                        style={{ 
                          height: "200px", 
                          overflow: "hidden",
                          position: "relative",
                          backgroundColor: "#f8f9fa"
                        }}
                      >
                        {!recipe.image_url || imageErrors[recipe.id] ? (
                          // Fallback CSS avec dégradé unique
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: getFallbackGradient(recipe.title),
                              color: "white",
                              fontSize: "18px",
                              fontWeight: "bold",
                              textAlign: "center",
                              padding: "20px"
                            }}
                          >
                            <div>
                              <div style={{ fontSize: "48px", marginBottom: "10px" }}>🍽️</div>
                              <div style={{ fontSize: "16px", opacity: 0.9, textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                                {recipe.title.substring(0, 40)}
                                {recipe.title.length > 40 ? '...' : ''}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Indicateur de chargement */}
                            {imageLoading[recipe.id] !== false && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "#f8f9fa",
                                  zIndex: 1
                                }}
                              >
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Image réelle */}
                            <img 
                              src={recipe.image_url} 
                              alt={recipe.title}
                              style={{ 
                                width: "100%", 
                                height: "100%", 
                                objectFit: "cover",
                                filter: selectedRecipe?.id === recipe.id ? "brightness(0.9)" : "brightness(1)",
                                display: imageLoading[recipe.id] === false ? 'block' : 'none'
                              }}
                              onLoad={() => handleImageLoad(recipe.id)}
                              onError={() => handleImageError(recipe.id, recipe.title, recipe.image_url)}
                              crossOrigin="anonymous"
                            />
                          </>
                        )}
                        
                        {/* Badge de temps */}
                        <div 
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            background: "rgba(0,0,0,0.7)",
                            padding: "5px 10px",
                            borderRadius: "20px",
                            color: "white",
                            fontSize: "12px",
                            zIndex: 2
                          }}
                        >
                          <FaClock className="me-1" />
                          {recipe.prep_time} min
                        </div>
                      </div>

                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h2 className="mb-0" style={{ fontSize: "1.5rem" }}>{recipe.title}</h2>
                          <span className="badge bg-info">{recipe.cuisine_type}</span>
                        </div>

                        {/* STATS DE LA RECETTE */}
                        <div className="d-flex gap-3 mb-3 text-muted" style={{ fontSize: "14px" }}>
                          <span>
                            <FaLeaf className="me-1 text-success" />
                            {recipe.n_ingredients} ingredients
                          </span>
                          <span>
                            <FaCheckCircle className="me-1 text-primary" />
                            {recipe.match_percentage}% match
                          </span>
                        </div>

                        {/* INGRÉDIENTS CORRESPONDANTS */}
                        <div className="mb-2">
                          <small className="text-success fw-bold">
                            ✓ Matching: {recipe.matching_ingredients.slice(0, 3).join(", ")}
                            {recipe.matching_ingredients.length > 3 && ` +${recipe.matching_ingredients.length - 3} more`}
                          </small>
                        </div>

                        {/* BOUTON POUR VOIR DÉTAILS */}
                        <button 
                          className="btn btn-sm btn-outline-primary w-100 mb-2"
                          onClick={() => setSelectedRecipe(selectedRecipe?.id === recipe.id ? null : recipe)}
                        >
                          {selectedRecipe?.id === recipe.id ? (
                            <>
                              <FaChevronUp className="me-2" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <FaChevronDown className="me-2" />
                              View Instructions
                            </>
                          )}
                        </button>

                        {/* DÉTAILS EXPANDUS */}
                        {selectedRecipe?.id === recipe.id && (
                          <div className="mt-3 pt-3 border-top">
                            <h3 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>📝 Instructions:</h3>
                            <ol className="ps-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
                              {recipe.instructions.map((step, i) => (
                                <li key={i} className="mb-2">{step}</li>
                              ))}
                            </ol>

                            {/* NUTRITION INFO */}
                            {recipe.nutrition && (
                              <div className="mt-3 p-2 bg-light rounded">
                                <h3 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>🥗 Nutrition:</h3>
                                <div className="d-flex flex-wrap gap-2">
                                  <span className="badge bg-warning text-dark">
                                    {recipe.nutrition.calories?.toFixed(0) || 0} cal
                                  </span>
                                  <span className="badge bg-info">
                                    {recipe.nutrition.protein?.toFixed(0) || 0}g protein
                                  </span>
                                  <span className="badge bg-secondary">
                                    {recipe.nutrition.carbs?.toFixed(0) || 0}g carbs
                                  </span>
                                  <span className="badge bg-danger">
                                    {recipe.nutrition.fat?.toFixed(0) || 0}g fat
                                  </span>
                                </div>
                              </div>
                            )}

                            <button
                              className="btn btn-success w-100 mt-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                saveRecipe(recipe);
                              }}
                            >
                              <FaPlus className="me-2" />
                              Save to My Recipes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoginModalOpen && (
        <Modal onClose={() => setIsLoginModalOpen(false)}>
          <InputForm setIsOpen={() => setIsLoginModalOpen(false)} />
        </Modal>
      )}
    </section>
  );
}