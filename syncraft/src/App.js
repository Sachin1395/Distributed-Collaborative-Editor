import { Routes, Route, Navigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "./components/supabase_client"
import LandingPage from "./components/LandingPage"
import Login from "./components/login"
import Documents from "./components/documents"
import Tiptap from "./components/editor"
import SyncraftLoader from "./components/Loader"

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

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
        element={session ? <Documents /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/documents/:userId/:docId"
        element={session ? <EditorWrapper user={session.user} /> : <Navigate to="/login" replace />}
      />

      {/* Catch-all redirect */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

function EditorWrapper({ user }) {
  const { docId } = useParams()
  if (!user) return <SyncraftLoader message="Loading Editor" />
  return <Tiptap docId={docId} user={user} />
}

export default App