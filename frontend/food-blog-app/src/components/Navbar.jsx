// frontend/src/components/Navbar.jsx - VERSION MISE À JOUR
import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import InputForm from "./InputForm";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
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
      // Force refresh pour mettre à jour l'état
      window.location.reload();
    }
  };

  const checkLogin = () => {
    if (token) {
      handleLogout();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <header id="header" className="header d-flex align-items-center sticky-top">
        <div className="container position-relative d-flex align-items-center justify-content-between">
          <NavLink to="/" className="logo d-flex align-items-center me-auto me-xl-0">
            <h1 className="sitename">Food Blog</h1>
            <span>.</span>
          </NavLink>

          <nav id="navmenu" className="navmenu">
            <ul>
              <li>
                <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                  Home
                </NavLink>
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

          <div className="d-flex align-items-center gap-2">
            {!isLogin ? (
              // User logged in - Show dropdown menu
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
              // User not logged in - Show login button
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