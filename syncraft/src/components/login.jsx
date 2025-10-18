import { useState } from "react"
import { supabase } from "./supabase_client"
import { useNavigate } from "react-router-dom"
import "./Auth.css"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  // Handle signup
  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      setSuccess("Check your email for verification link!")
      if (data?.user) {
        setTimeout(() => navigate(`/my-documents/${data.user.id}`), 2000)
      }
    }
    setLoading(false)
  }

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      if (data?.user) {
        navigate(`/my-documents/${data.user.id}`)
      }
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🔒</div>
          <h2>Welcome Back</h2>
          <p>Sign in to your account or create a new one</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            <span>{success}</span>
          </div>
        )}

        <form className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔐</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? <span className="spinner"></span> : "Sign In"}
            </button>

            <button
              onClick={handleSignUp}
              disabled={loading}
              className="btn btn-secondary"
            >
              Create Account
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Protected by enterprise-grade security
        </div>
      </div>
    </div>
  )
}