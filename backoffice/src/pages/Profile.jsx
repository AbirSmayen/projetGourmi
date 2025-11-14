import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailForm, setEmailForm] = useState({ newEmail: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const auth = JSON.parse(localStorage.getItem("auth"));
      
      const { data } = await axios.get(`${base}/admin/profile`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      
      setAdmin(data.data);
      setEmailForm({ newEmail: data.data.email });
    } catch (error) {
      console.error(error);
      setMessage({ type: "danger", text: "Erreur lors du chargement du profil" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const auth = JSON.parse(localStorage.getItem("auth"));

      const { data } = await axios.put(
        `${base}/admin/profile/email`,
        emailForm,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      setMessage({ type: "success", text: data.message });
      setAdmin(data.data);
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.response?.data?.error || "Erreur lors de la modification",
      });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const auth = JSON.parse(localStorage.getItem("auth"));

      const { data } = await axios.put(
        `${base}/admin/profile/password`,
        passwordForm,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      setMessage({ type: "success", text: data.message });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.response?.data?.error || "Erreur lors de la modification",
      });
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Mon Profil Administrateur</h1>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button
            type="button"
            className="close"
            onClick={() => setMessage({ type: "", text: "" })}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      <div className="row">
        {/* Informations générales */}
        <div className="col-lg-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Informations</h6>
            </div>
            <div className="card-body text-center">
              <img
                className="img-profile rounded-circle mb-3"
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="Admin"
                width="100"
                height="100"
              />
              <h5 className="mb-1">{admin?.firstName} {admin?.lastName}</h5>
              <p className="text-muted mb-0">{admin?.email}</p>
              <p className="text-muted small mt-2">
                <i className="fas fa-shield-alt text-primary"></i> Administrateur Principal
              </p>
              <hr />
              <p className="small text-muted mb-0">
                Compte créé le {new Date(admin?.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        </div>

        {/* Formulaires de modification */}
        <div className="col-lg-8">
          {/* Modifier l'email */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">
                <i className="fas fa-envelope mr-2"></i>Modifier l'adresse email
              </h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleEmailChange}>
                <div className="form-group">
                  <label htmlFor="newEmail">Nouvelle adresse email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="newEmail"
                    value={emailForm.newEmail}
                    onChange={(e) =>
                      setEmailForm({ ...emailForm, newEmail: e.target.value })
                    }
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save mr-2"></i>Enregistrer l'email
                </button>
              </form>
            </div>
          </div>

          {/* Modifier le mot de passe */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">
                <i className="fas fa-key mr-2"></i>Modifier le mot de passe
              </h6>
            </div>
            <div className="card-body">
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Mot de passe actuel</label>
                  <input
                    type="password"
                    className="form-control"
                    id="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword">Nouveau mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <small className="form-text text-muted">
                    Minimum 6 caractères
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <button type="submit" className="btn btn-warning">
                  <i className="fas fa-lock mr-2"></i>Changer le mot de passe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;