import React, { useEffect, useState } from "react";
import { getRecipes, acceptRecipe, deleteRecipe } from "../services/api";

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

  const handleAccept = async (id, currentStatus, isOfficial) => {
    // Ne pas accepter les recettes officielles
    if (isOfficial) {
      alert("Les recettes officielles ne peuvent pas être acceptées");
      return;
    }

    const action = currentStatus ? "retirer l'acceptation de" : "accepter";
    if (window.confirm(`Voulez-vous ${action} cette recette ?`)) {
      try {
        await acceptRecipe(id, !currentStatus);
        fetchRecipes();
      } catch (error) {
        console.error("Erreur lors de l'acceptation:", error);
        alert("Erreur lors de l'acceptation de la recette");
      }
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Supprimer la recette "${title}" ?`)) {
      try {
        await deleteRecipe(id);
        fetchRecipes();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression de la recette");
      }
    }
  };

  const getAuthorName = (recipe) => {
    if (!recipe.createdBy) return "Admin";
    const { firstName, lastName } = recipe.createdBy;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return "Anonyme";
  };

  const getRecipeStatus = (recipe) => {
    if (recipe.isOfficial) {
      return {
        badge: "badge-primary",
        icon: "fa-crown",
        text: "Official"
      };
    }
    if (recipe.isAccepted) {
      return {
        badge: "badge-success",
        icon: "fa-check-circle",
        text: "Accepted"
      };
    }
    return {
      badge: "badge-warning",
      icon: "fa-clock",
      text: "Pending"
    };
  };

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
                  filteredRecipes.map((r) => {
                    const status = getRecipeStatus(r);
                    return (
                      <tr key={r._id}>
                        <td>
                          <strong>{r.title}</strong>
                        </td>
                        <td>{getAuthorName(r)}</td>
                        <td>{r.time || "Non spécifié"}</td>
                        <td>
                          <span className={`badge ${status.badge}`}>
                            <i className={`fas ${status.icon}`}></i> {status.text}
                          </span>
                        </td>
                        <td>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                        <td className="text-nowrap">
                          {!r.isOfficial && (
                            <button
                              onClick={() => handleAccept(r._id, r.isAccepted, r.isOfficial)}
                              className={`btn btn-sm me-2 mb-1 ${
                                r.isAccepted ? 'btn-secondary' : 'btn-success'
                              }`}
                              title={r.isAccepted ? "Retirer l'acceptation" : "Accepter cette recette"}
                            >
                              {r.isAccepted ? (
                                <>
                                  <i className="fas fa-times"></i> Reject
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-check"></i> Accept
                                </>
                              )}
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(r._id, r.title)} 
                            className="btn btn-danger btn-sm mb-1"
                            title="Supprimer cette recette"
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
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