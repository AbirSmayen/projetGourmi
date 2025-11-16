import React, { useEffect, useState } from "react";
import { getStats, getRecipes, acceptRecipe, deleteRecipe } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Chargement des statistiques
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getStats();
        console.log("Stats reçues:", data);
        setStats(data.data);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Chargement des recettes
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
      setLoadingRecipes(false);
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

  // Filtrer les recettes
  const filteredRecipes = recipes.filter((recipe) => {
    const search = searchTerm.toLowerCase();
    const authorName = getAuthorName(recipe).toLowerCase();
    return (
      recipe.title?.toLowerCase().includes(search) ||
      authorName.includes(search)
    );
  });

  return (
    <div className="container-fluid">
      {/* Titre principal */}
      <h1 className="h3 mb-4 text-gray-800">Dashboard Admin</h1>

      {/* Section Statistiques */}
      {loading ? (
        <p>Loading statistics...</p>
      ) : stats ? (
        <div className="row">
          {/* Card Utilisateurs Totaux */}
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-primary shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                      Users
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.users.total}
                    </div>
                    <div className="text-xs text-muted mt-1">
                      +{stats.users.recent} this month
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-users fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Recettes Totales */}
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-success shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                      Total Recipes
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.recipes.total}
                    </div>
                    <div className="text-xs text-muted mt-1">
                      +{stats.recipes.recent} this month
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-utensils fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Recettes Officielles */}
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-info shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                      Official Recipes
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.recipes.official}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-crown fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Recettes Utilisateurs */}
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-warning shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                      User Recipes
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.recipes.user}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-danger">Error loading statistics</p>
      )}

      {/* Section Tableau de gestion des recettes */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 font-weight-bold text-primary">
                Recipe Management ({filteredRecipes.length})
              </h6>
              <div className="input-group" style={{ width: "300px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search recipes..."
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
              {loadingRecipes ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;