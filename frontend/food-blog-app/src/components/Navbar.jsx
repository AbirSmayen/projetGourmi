import React, { useEffect, useState } from "react"
import Modal from "./Modal"
import InputForm from "./InputForm"
import { NavLink } from "react-router-dom"

export default function Navbar(){
  const [isOpen, setIsOpen] = useState(false)
  let token = localStorage.getItem("token")
  const [isLogin, setIsLogin] = useState(token ? false : true)
  let user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    setIsLogin(token ? false : true)
  }, [token])

  const checkLogin = () => {
    if(token){
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setIsLogin(true)
    }
    else{
      setIsOpen(true)
    }
  }

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
                <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
                  Home
                </NavLink>
              </li>
              <li onClick={() => isLogin && setIsOpen(true)}>
                <NavLink 
                  to={!isLogin ? "/myRecipe" : "/"} 
                  className={({ isActive }) => isActive ? "active" : ""}
                >
                  My Recipe
                </NavLink>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    checkLogin()
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {isLogin ? "Login" : "Logout"}
                  {user?.email ? ` (${user?.email})` : ""}
                </a>
              </li>
            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
          </nav>
        </div>
      </header>

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <InputForm setIsOpen={() => setIsOpen(false)} />
        </Modal>
      )}
    </>
  )
}