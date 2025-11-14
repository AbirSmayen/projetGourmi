import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Réinitialiser l'erreur quand l'utilisateur tape
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const { data } = await axios.post(`${apiUrl}/api/admin/auth/login`, formData);

      // Sauvegarder le token et les infos utilisateur
      localStorage.setItem("auth", JSON.stringify({ 
        token: data.token, 
        user: data.user 
      }));

      // Rediriger vers le dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(
        err.response?.data?.error || 
        "Erreur de connexion. Vérifiez vos identifiants."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}>
      <div className="row justify-content-center w-100">
        <div className="col-xl-6 col-lg-7 col-md-9">
          <div className="card o-hidden border-0 shadow-lg">
            <div className="card-body p-0">
              <div className="row">
                {/* Image de gauche */}
                <div className="col-lg-6 d-none d-lg-block" 
                     style={{
                       background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                       display: "flex",
                       alignItems: "center",
                       justifyContent: "center",
                       color: "white",
                       borderRadius: "0.35rem 0 0 0.35rem",
                     }}>
                  <div className="text-center p-4">
                    <i className="fas fa-user-shield fa-4x mb-4"></i>
                    <h3 className="font-weight-bold">ADMIN</h3>
                    <p className="lead mb-0">Administrator Area</p>
                  </div>
                </div>

                {/* Formulaire de connexion */}
                <div className="col-lg-6">
                  <div className="p-5">
                    <div className="text-center">
                      <h1 className="h4 text-gray-900 mb-4">
                        Administrator Login
                      </h1>
                    </div>

                    {error && (
                      <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        {error}
                      </div>
                    )}

                    <form className="user" onSubmit={handleSubmit}>
                      <div className="form-group">
                        <input
                          type="email"
                          name="email"
                          className="form-control form-control-user"
                          placeholder="E-mail address"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <input
                          type="password"
                          name="password"
                          className="form-control form-control-user"
                          placeholder="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary btn-user btn-block"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                            Connection in progress...
                          </>
                        ) : (
                          "Login"
                        )}
                      </button>
                    </form>

                    <hr />

                    <div className="text-center mt-2">
                      <small className="text-muted">
                        Access restricted to administrators only
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;