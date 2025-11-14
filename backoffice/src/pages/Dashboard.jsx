import React, { useEffect, useState } from "react";
import { getStats } from "../services/api"; 

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chargement des statistiques depuis ton backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getStats();
        console.log("Stats reçues:", data); // Pour debug
        setStats(data.data); // ✅ data.data car la réponse est { success: true, data: {...} }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container-fluid">
      {/* Titre principal */}
      <h1 className="h3 mb-4 text-gray-800">Tableau de bord administrateur</h1>

      {loading ? (
        <p>Chargement des statistiques...</p>
      ) : stats ? (
        <div className="row">
          {/* Card Utilisateurs Totaux */}
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-primary shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                      Utilisateurs
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.users.total}
                    </div>
                    <div className="text-xs text-muted mt-1">
                      +{stats.users.recent} ce mois
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
                      Recettes Totales
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.recipes.total}
                    </div>
                    <div className="text-xs text-muted mt-1">
                      +{stats.recipes.recent} ce mois
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
                      Recettes Officielles
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.recipes.official}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-star fa-2x text-gray-300"></i>
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
                      Recettes Utilisateurs
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
        <p className="text-danger">Erreur lors du chargement des statistiques</p>
      )}

      
    </div>
  );
};

export default Dashboard;