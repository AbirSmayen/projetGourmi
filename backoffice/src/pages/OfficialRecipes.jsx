import React, { useState } from "react";
import { createOfficialRecipe } from "../services/api";

const OfficialRecipes = () => {
  const [form, setForm] = useState({
    title: "",
    ingredients: "",
    instructions: "",
    time: "",
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setMessage({ type: "", text: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "danger", text: "L'image ne doit pas dépasser 5MB" });
        e.target.value = null;
        return;
      }
      setForm({ ...form, file });
      setMessage({ type: "", text: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      // Validation
      if (!form.title || !form.ingredients || !form.instructions || !form.time) {
        setMessage({ type: "danger", text: "Tous les champs sont requis" });
        setLoading(false);
        return;
      }

      // Créer FormData pour l'upload
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("ingredients", form.ingredients);
      formData.append("instructions", form.instructions);
      formData.append("time", form.time);
      
      if (form.file) {
        formData.append("file", form.file);
      }

      // ✅ NE PAS envoyer l'ID de l'admin
      // Les recettes officielles auront createdBy: null dans le backend

      await createOfficialRecipe(formData);

      setMessage({ type: "success", text: "Recette officielle ajoutée avec succès !" });
      
      // Réinitialiser le formulaire
      setForm({
        title: "",
        ingredients: "",
        instructions: "",
        time: "",
        file: null
      });
      
      // Réinitialiser l'input file
      document.getElementById("fileInput").value = null;

    } catch (error) {
      console.error("Erreur:", error);
      setMessage({ 
        type: "danger", 
        text: error.response?.data?.message || "Erreur lors de l'ajout de la recette" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Ajouter une recette officielle</h1>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.type === "success" ? (
            <i className="fas fa-check-circle mr-2"></i>
          ) : (
            <i className="fas fa-exclamation-circle mr-2"></i>
          )}
          {message.text}
          <button
            type="button"
            className="close"
            onClick={() => setMessage({ type: "", text: "" })}
          >
            <span>&times;</span>
          </button>
        </div>
      )}

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">
            <i className="fas fa-plus-circle mr-2"></i>
            Formulaire d'ajout
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Titre */}
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="title">
                    Titre de la recette <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    placeholder="Ex: Gâteau au Chocolat"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Temps de préparation */}
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="time">
                    Temps de préparation <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="time"
                    name="time"
                    className="form-control"
                    placeholder="Ex: 30 minutes"
                    value={form.time}
                    onChange={handleChange}
                    required
                  />
                  <small className="form-text text-muted">
                    Format: "30 min" ou "1h 30min"
                  </small>
                </div>
              </div>
            </div>

            {/* Ingrédients */}
            <div className="form-group">
              <label htmlFor="ingredients">
                Ingrédients (séparés par des virgules) <span className="text-danger">*</span>
              </label>
              <textarea
                id="ingredients"
                name="ingredients"
                className="form-control"
                rows="4"
                placeholder="Ex: 200g de farine, 100g de sucre, 3 œufs..."
                value={form.ingredients}
                onChange={handleChange}
                required
              />
              <small className="form-text text-muted">
                Séparez chaque ingrédient par une virgule
              </small>
            </div>

            {/* Instructions */}
            <div className="form-group">
              <label htmlFor="instructions">
                Instructions de préparation <span className="text-danger">*</span>
              </label>
              <textarea
                id="instructions"
                name="instructions"
                className="form-control"
                rows="6"
                placeholder="Décrivez les étapes de préparation..."
                value={form.instructions}
                onChange={handleChange}
                required
              />
            </div>

            {/* Image */}
            <div className="form-group">
              <label htmlFor="fileInput">
                Image de la recette
              </label>
              <div className="custom-file">
                <input
                  type="file"
                  className="custom-file-input"
                  id="fileInput"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                />
                <label className="custom-file-label" htmlFor="fileInput">
                  {form.file ? form.file.name : "Choisir une image..."}
                </label>
              </div>
              <small className="form-text text-muted">
                Formats acceptés: JPG, PNG, GIF, WEBP (max 5MB)
              </small>
            </div>

            {/* Boutons */}
            <div className="form-group mt-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Ajouter la recette officielle
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg ml-2"
                onClick={() => {
                  setForm({
                    title: "",
                    ingredients: "",
                    instructions: "",
                    time: "",
                    file: null
                  });
                  document.getElementById("fileInput").value = null;
                  setMessage({ type: "", text: "" });
                }}
              >
                <i className="fas fa-undo mr-2"></i>
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OfficialRecipes;