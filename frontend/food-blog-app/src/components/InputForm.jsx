import React from "react"
import { useState } from "react"
import axios from 'axios'

export default function InputForm({ setIsOpen }){
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleOnSubmit = async(e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    let endpoint = isSignUp ? "signUp" : "login"
    
    await axios.post(`http://localhost:5000/${endpoint}`, { email, password })
      .then((res) => {
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("user", JSON.stringify(res.data.user))
        setIsOpen()
      })
      .catch(data => {
        setError(data.response?.data?.error || "An error occurred")
        setLoading(false)
      })
  }

  return (
    <form className="php-email-form" onSubmit={handleOnSubmit}>
      <div className="row gy-4">
        <div className="col-12">
          <label htmlFor="email" className="form-label">Email</label>
          <input 
            type="email" 
            className="form-control" 
            id="email"
            onChange={(e) => setEmail(e.target.value)}  
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="col-12">
          <label htmlFor="password" className="form-label">Password</label>
          <input 
            type="password" 
            className="form-control" 
            id="password"
            onChange={(e) => setPassword(e.target.value)} 
            required
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        )}

        <div className="col-12">
          <button 
            type="submit" 
            className="btn btn-danger w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Loading...
              </>
            ) : (
              isSignUp ? "Sign Up" : "Login"
            )}
          </button>
        </div>

        <div className="col-12 text-center">
          <p className="mb-0">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault()
                setIsSignUp(pre => !pre)
                setError("")
              }}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isSignUp ? "Already have an account? Login" : "Create new account"}
            </a>
          </p>
        </div>
      </div>
    </form>
  )
}