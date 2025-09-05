import { useState } from "react"
import { supabase } from "./supabase_client"
import { useNavigate } from "react-router-dom"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Handle signup
  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      alert(error.message)
    } else {
      alert("Check your email for verification link!")
      // Optional: redirect after signup if you want immediate access
      if (data?.user) {
        navigate(`/my-documents/${data.user.id}`)
      }
    }
    setLoading(false)
  }

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
    } else {
      if (data?.user) {
        navigate(`/my-documents/${data.user.id}`)
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Login / Signup</h2>
      <form>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", margin: "0.5rem 0", width: "100%" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", margin: "0.5rem 0", width: "100%" }}
        />
        <button onClick={handleLogin} disabled={loading} style={{ marginRight: "1rem" }}>
          Log In
        </button>
        <button onClick={handleSignUp} disabled={loading}>
          Sign Up
        </button>
      </form>
    </div>
  )
}
