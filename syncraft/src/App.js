import { Routes, Route, Navigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "./components/supabase_client"
import LandingPage from "./components/LandingPage"
import Login from "./components/login"
import Documents from "./components/documents"
import Tiptap from "./components/editor"
import SyncraftLoader from "./components/Loader"
import UpdatePassword from "./components/UpdatePassword"

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        // 🔹 Request your backend BEFORE screen loads
        const res = await fetch("https://syncdraft-distributed-collaborative.onrender.com/")
        const text = await res.text()
        console.log("Hocuspocus server response:", text)
      } catch (err) {
        console.error("Backend request failed:", err)
      }

      // 🔹 Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <SyncraftLoader message="Loading" />

  return (
    <Routes>
      {/* Landing page - public route */}
      <Route
        path="/"
        element={session ? <Navigate to={`/my-documents/${session.user.id}`} replace /> : <LandingPage />}
      />

      {/* Login/Signup page */}
      <Route
        path="/login"
        element={session ? <Navigate to={`/my-documents/${session.user.id}`} replace /> : <Login />}
      />

      {/* Protected routes - require authentication */}
      <Route
        path="/my-documents/:userId"
        element={session ? <Documents /> : <Navigate to="/" replace />}
      />

      <Route
        path="/documents/:userId/:docId"
        element={session ? <EditorWrapper user={session.user} /> : <Navigate to="/" replace />}
      />

      {/* Catch-all redirect */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

      <Route path="/update-password" element={<UpdatePassword />} />
    </Routes>
  )
}

function EditorWrapper({ user }) {
  const { docId } = useParams()
  if (!user) return <SyncraftLoader message="Loading Editor" />
  return <Tiptap docId={docId} user={user} />
}

export default App