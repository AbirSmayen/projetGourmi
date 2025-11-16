import React, { useEffect, useState } from "react";
import { getUsers, deleteUser, updateUser, blockUser } from "../services/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      const normalUsers = (data.data || []).filter(u => u.role !== "admin");
      setUsers(normalUsers);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cet utilisateur ?")) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression de l'utilisateur");
      }
    }
  };

  const handleBlock = async (userId, currentStatus) => {
    const action = currentStatus ? "débloquer" : "bloquer";
    if (window.confirm(`Voulez-vous ${action} cet utilisateur ?`)) {
      try {
        await blockUser(userId, !currentStatus);
        fetchUsers();
      } catch (error) {
        console.error("Erreur lors du blocage:", error);
        alert(`Erreur lors du ${action}age de l'utilisateur`);
      }
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      password: "" // Laisser vide par défaut
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    setUpdateLoading(true);
    try {
      // Préparer les données à envoyer (ne pas envoyer le mot de passe s'il est vide)
      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };

      // Ajouter le mot de passe seulement s'il est rempli
      if (formData.password.trim() !== "") {
        dataToSend.password = formData.password;
      }

      await updateUser(selectedUser._id, dataToSend);
      alert("Utilisateur modifié avec succès");
      closeEditModal();
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert(error.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setUpdateLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      (user.firstName?.toLowerCase().includes(search) || false) ||
      (user.lastName?.toLowerCase().includes(search) || false) ||
      (user.email?.toLowerCase().includes(search) || false)
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
      <h1 className="h3 mb-4 text-gray-800">User Management</h1>
      
      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">
            User List ({filteredUsers.length})
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
                  <th>Last Name</th>
                  <th>First Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>{u.lastName || "-"}</td>
                      <td>{u.firstName || "-"}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge badge-${u.isBlocked ? 'danger' : 'success'}`}>
                          {u.isBlocked ? 'Bloqué' : 'Actif'}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <button 
                          onClick={() => openEditModal(u)} 
                          className="btn btn-primary btn-sm mr-2"
                          title="Modifier cet utilisateur"
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button 
                          onClick={() => handleBlock(u._id, u.isBlocked)} 
                          className={`btn btn-${u.isBlocked ? 'warning' : 'secondary'} btn-sm mr-2`}
                          title={u.isBlocked ? "Débloquer" : "Bloquer"}
                        >
                          <i className={`fas fa-${u.isBlocked ? 'unlock' : 'ban'}`}></i> 
                          {u.isBlocked ? ' Unblock' : ' Block'}
                        </button>
                        <button 
                          onClick={() => handleDelete(u._id)} 
                          className="btn btn-danger btn-sm"
                          title="Supprimer cet utilisateur"
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      {searchTerm ? "Aucun utilisateur trouvé" : "Aucun utilisateur enregistré"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit user</h5>
                <button type="button" className="close" onClick={closeEditModal}>
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleSubmitEdit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New password (leave blank so as not to change)</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Leave blank if no change"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeEditModal}
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2"></span>
                        Registration...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;