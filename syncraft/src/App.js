import { Routes, Route, Navigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "./components/supabase_client"
import Login from "./components/login"
import Documents from "./components/documents"
import Tiptap from "./components/editor"

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

  if (loading) return <div>Loading...</div>

  if (!session) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      {/* Redirect root → documents list */}
      <Route
        path="/"
        element={<Navigate to={`/my-documents/${session.user.id}`} replace />}
      />

      {/* User’s documents list */}
      <Route path="/my-documents/:userId" element={<Documents />} />

      {/* Editor page */}
      <Route
        path="/documents/:userId/:docId"
        element={<EditorWrapper user={session.user} />}
      />

      {/* Catch-all → send back to docs list */}
      <Route
        path="*"
        element={<Navigate to={`/my-documents/${session.user.id}`} replace />}
      />
    </Routes>
  )
}

function EditorWrapper({ user }) {
  const { docId } = useParams()
  return <Tiptap docId={docId} user={user} />
}

export default App
