import React from "react"
import { useState } from "react"
import axios from 'axios'

export default function InputForm({ setIsOpen }){
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [regime, setRegime] = useState([])
  const [objectifs, setObjectifs] = useState([])
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const regimeOptions = ["omnivore", "végétarien", "keto"]
  const objectifsOptions = ["perte de poids", "prise de masse", "santé équilibrée", "autre"]

  const handleCheckboxChange = (value, setState, currentState) => {
    if (currentState.includes(value)) {
      setState(currentState.filter(item => item !== value))
    } else {
      setState([...currentState, value])
    }
  }

  const handleOnSubmit = async(e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    let endpoint = isSignUp ? "signUp" : "login"
    
    const requestData = isSignUp 
      ? { 
          email, 
          password, 
          firstName, 
          lastName,
          preferences: {
            regime,
            objectifs
          }
        }
      : { email, password }
    
    await axios.post(`http://localhost:5000/${endpoint}`, requestData)
      .then((res) => {
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("user", JSON.stringify(res.data.user))
        setIsOpen()
      })
      .catch(data => {
        setError(data.response?.data?.error || data.response?.data?.message || "An error occurred")
        setLoading(false)
      })
  }

  const resetForm = () => {
    setFirstName("")
    setLastName("")
    setRegime([])
    setObjectifs([])
    setError("")
  }

  return (
    <form className="php-email-form" onSubmit={handleOnSubmit}>
      <div className="row gy-3">
        {isSignUp && (
          <>
            <div className="col-md-6">
              <label htmlFor="firstName" className="form-label">First Name *</label>
              <input 
                type="text" 
                className="form-control" 
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}  
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="lastName" className="form-label">Last Name *</label>
              <input 
                type="text" 
                className="form-control" 
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)} 
                required
              />
            </div>
          </>
        )}

        <div className="col-12">
          <label htmlFor="email" className="form-label">Email *</label>
          <input 
            type="email" 
            className="form-control" 
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}  
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="col-12">
          <label htmlFor="password" className="form-label">Password *</label>
          <input 
            type="password" 
            className="form-control" 
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required
            placeholder="••••••••"
            minLength="6"
          />
          {isSignUp && (
            <small className="text-muted">At least 6 characters</small>
          )}
        </div>

        {isSignUp && (
          <>
            {/* Dietary Preferences */}
            <div className="col-12 mt-3">
              <label className="form-label fw-bold">Diet Type (optional)</label>
              <div className="row g-2">
                {regimeOptions.map((option) => (
                  <div key={option} className="col-6">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id={`regime-${option}`}
                        checked={regime.includes(option)}
                        onChange={() => handleCheckboxChange(option, setRegime, regime)}
                      />
                      <label className="form-check-label" htmlFor={`regime-${option}`}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">Goals (optional)</label>
              <div className="row g-2">
                {objectifsOptions.map((option) => (
                  <div key={option} className="col-md-6">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id={`objectif-${option}`}
                        checked={objectifs.includes(option)}
                        onChange={() => handleCheckboxChange(option, setObjectifs, objectifs)}
                      />
                      <label className="form-check-label" htmlFor={`objectif-${option}`}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        )}

        <div className="col-12 mt-3">
          <button 
            type="submit" 
            className="btn btn-danger w-100"
            disabled={loading}
            style={{ padding: '12px' }}
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
                resetForm()
              }}
              style={{ cursor: 'pointer', textDecoration: 'underline', color: '#ce1212' }}
            >
              {isSignUp ? "Already have an account? Login" : "Create new account"}
            </a>
          </p>
        </div>
      </div>
    </form>
  )
}