import React, { useEffect, useState } from "react";
import { getStats } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getStats();
      console.log("Stats reçues:", data); // Debug
      setStats(data.data); // data.data au lieu de data
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container-fluid"><p>Chargement...</p></div>;
  if (!stats) return <div className="container-fluid"><p>Erreur de chargement</p></div>;

  // Préparer les données pour le graphique
  const chartData = [
    { label: "Utilisateurs", value: stats.users.total },
    { label: "Recettes totales", value: stats.recipes.total },
    { label: "Recettes officielles", value: stats.recipes.official },
    { label: "Recettes utilisateurs", value: stats.recipes.user },
  ];

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Statistiques</h1>

      {/* Cards statistiques */}
      <div className="row mb-4">
        <div className="col-xl-6 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Utilisateurs totaux
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

        <div className="col-xl-6 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Recettes totales
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
      </div>

      {/* Graphique */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Vue d'ensemble</h6>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4e73df" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics;