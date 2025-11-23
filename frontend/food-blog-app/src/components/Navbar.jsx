import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import InputForm from "./InputForm";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaUser, FaSignOutAlt, FaRobot } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";

export default function Navbar({ onSearch, searchQuery }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  let token = localStorage.getItem("token");
  const [isLogin, setIsLogin] = useState(token ? false : true);
  let user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    setIsLogin(token ? false : true);
  }, [token]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ce1212",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLogin(true);
      
      Swal.fire({
        icon: "success",
        title: "Logged out!",
        text: "You have been successfully logged out",
        timer: 1500,
        showConfirmButton: false,
      });
      
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <>
      <header id="header" className="header d-flex align-items-center sticky-top">
        <div className="container position-relative d-flex align-items-center justify-content-between">
          <NavLink to="/" className="logo d-flex align-items-center me-auto me-xl-0">
            <h1 className="sitename">Gourmi</h1>
            <span>.</span>
          </NavLink>

          <nav id="navmenu" className="navmenu">
            <ul>
              <li>
                <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                  Home
                </NavLink>
              </li>
              
              {/* Lien vers le générateur IA - vérifie l'authentification */}
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!token) {
                      setIsOpen(true); // Ouvrir le modal de connexion
                    } else {
                      navigate("/ai-generator");
                    }
                  }}
                  className={location.pathname === "/ai-generator" ? "active" : ""}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <FaRobot size={16} style={{ color: '#667eea' }} />
                  <span style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '600'
                  }}>
                    AI Generator
                  </span>
                </a>
              </li>

              {!isLogin && (
                <li>
                  <NavLink
                    to="/myRecipe"
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    My Recipe
                  </NavLink>
                </li>
              )}
            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
          </nav>

          <div className="d-flex align-items-center gap-3">
            {/* Barre de recherche */}
            <div className="position-relative d-none d-lg-block" style={{ width: "280px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search recipes..."
                value={searchQuery || ""}
                onChange={(e) => onSearch(e.target.value)}
                style={{
                  paddingLeft: '38px',
                  paddingRight: searchQuery ? '38px' : '12px',
                  borderRadius: '25px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  height: '40px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ce1212';
                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(206, 18, 18, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <IoSearchOutline 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6c757d',
                  pointerEvents: 'none'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearch("")}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6c757d',
                    cursor: 'pointer',
                    fontSize: '20px',
                    padding: '0',
                    width: '20px',
                    height: '20px',
                    lineHeight: '1',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {!isLogin ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-danger dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ borderRadius: "25px", padding: "8px 20px" }}
                >
                  <FaUser />
                  <span className="d-none d-md-inline">{user.firstName || "User"}</span>
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="userDropdown"
                  style={{ minWidth: "200px" }}
                >
                  <li>
                    <NavLink
                      className="dropdown-item"
                      to="/profile"
                      style={{ padding: "10px 20px" }}
                    >
                      <FaUser className="me-2" />
                      My Profile
                    </NavLink>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                      style={{ padding: "10px 20px", cursor: "pointer" }}
                    >
                      <FaSignOutAlt className="me-2" />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <a
                href="#"
                className="btn-getstarted"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(true);
                }}
              >
                Get Started
              </a>
            )}
          </div>
        </div>
      </header>

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <InputForm setIsOpen={() => setIsOpen(false)} />
        </Modal>
      )}
    </>
  );
}