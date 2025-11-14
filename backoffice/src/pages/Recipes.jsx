import React, { useEffect, useState } from "react";
import { getRecipes, validateRecipe, deleteRecipe } from "../services/api";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data } = await getRecipes();
      console.log("Recettes reçues:", data);
      setRecipes(data.data || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id, currentStatus) => {
    const action = currentStatus ? "retirer le statut officiel de" : "valider";
    if (window.confirm(`Voulez-vous ${action} cette recette ?`)) {
      try {
        await validateRecipe(id, !currentStatus);
        fetchRecipes(); // Recharger la liste
      } catch (error) {
        console.error("Erreur lors de la validation:", error);
        alert("Erreur lors de la validation de la recette");
      }
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Supprimer la recette "${title}" ?`)) {
      try {
        await deleteRecipe(id);
        fetchRecipes(); // Recharger la liste
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression de la recette");
      }
    }
  };

  // Fonction pour afficher le nom de l'auteur
  const getAuthorName = (recipe) => {
    if (!recipe.createdBy) return "Anonyme";
    
    const { firstName, lastName } = recipe.createdBy;
    
    // Si les deux sont définis
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    // Si seulement un des deux
    if (firstName) return firstName;
    if (lastName) return lastName;
    
    return "Anonyme";
  };

  // Filtrer les recettes
  const filteredRecipes = recipes.filter((recipe) => {
    const search = searchTerm.toLowerCase();
    const authorName = getAuthorName(recipe).toLowerCase();
    return (
      recipe.title?.toLowerCase().includes(search) ||
      authorName.includes(search)
    );
  });

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Recipe Moderation</h1>
      
      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">
            Recipe List ({filteredRecipes.length})
          </h6>
          <div className="input-group" style={{ width: "300px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="input-group-append">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Creation Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <strong>{r.title}</strong>
                      </td>
                      <td>{getAuthorName(r)}</td>
                      <td>{r.time || "Non spécifié"}</td>
                      <td>
                        {r.isOfficial ? (
                          <span className="badge badge-success">
                            <i className="fas fa-check-circle"></i> Official
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            <i className="fas fa-clock"></i> User
                          </span>
                        )}
                      </td>
                      <td>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="text-nowrap">
                        <button
                          onClick={() => handleValidate(r._id, r.isOfficial)}
                          className={`btn btn-sm me-2 mb-1 ${
                            r.isOfficial ? 'btn-secondary' : 'btn-success'
                          }`}
                          title={r.isOfficial ? "Retirer le statut officiel" : "Valider comme officielle"}
                        >
                          {r.isOfficial ? (
                            <>
                              <i className="fas fa-times"></i> Reject
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check"></i> Confirm
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => handleDelete(r._id, r.title)} 
                          className="btn btn-danger btn-sm mb-1"
                          title="Supprimer cette recette"
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      {searchTerm ? "Aucune recette trouvée" : "Aucune recette enregistrée"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recipes;