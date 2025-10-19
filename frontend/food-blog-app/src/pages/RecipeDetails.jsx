import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function RecipeDetails() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      const res = await axios.get(`http://localhost:5000/recipe/${id}`);
      setRecipe(res.data);
    };
    fetchRecipe();
  }, [id]);

  if (!recipe) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <h2>Loading...</h2>
    </div>
  );

  return (
    <div className="recipe-details-container">
      <div className="recipe-header">
        <h1 className="recipe-title">{recipe.title}</h1>
        <div className="recipe-meta">
          <span className="time-badge">
            <span className="icon">⏱</span>
            {recipe.time}
          </span>
        </div>
      </div>

      <div className="recipe-image-wrapper">
        <img 
          src={`http://localhost:5000/images/${recipe.coverImage}`} 
          alt={recipe.title}
          className="recipe-detail-img" 
        />
      </div>

      <div className="recipe-content">
        <div className="ingredients-section">
          <h3 className="section-title">
            <span className="icon">🧾</span>
            Ingredients
          </h3>
          <ul className="ingredients-list">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="ingredient-item">{ing}</li>
            ))}
          </ul>
        </div>

        <div className="instructions-section">
          <h3 className="section-title">
            <span className="icon">👨‍🍳</span>
            Instructions
          </h3>
          <p className="instructions-text">{recipe.instructions}</p>
        </div>

        <div className="author-section">
          <span className="icon">👤</span>
          Created by: <strong>{recipe.createdBy?.name || recipe.createdBy?.email}</strong>
        </div>
      </div>
    </div>
  );
}