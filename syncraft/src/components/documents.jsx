import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "./supabase_client"
import "./Documents.css"

export default function Documents() {
  const [docs, setDocs] = useState([])
  const [colDocs, setColDocs] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser()

        if (userError) throw userError

        if (!user) {
          navigate("/")
          return
        }

        setUser(user)

        // Fetch user-owned docs
        const { data: docsData, error: docsError } = await supabase
          .from("documents")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })

        if (docsError) throw docsError
        setDocs(docsData || [])

        // Fetch collaborator references
        const { data: collabData, error: collabError } = await supabase
          .from("collaborators")
          .select("document_id, role")
          .eq("user_id", user.id)

        if (collabError) throw collabError

        console.log("Collaborator entries:", collabData)

        // Get full docs for collaborations
        if (collabData && collabData.length > 0) {
          const documentIds = collabData
            .map((c) => c.document_id?.trim())
            .filter(Boolean)

          console.log("Document IDs to fetch:", documentIds)

          if (documentIds.length > 0) {
            // Force UUID casting with filter
            const { data: colDocsData, error: colDocsError } = await supabase
              .from("documents")
              .select("*")
              .filter('id', 'in', `(${documentIds.map(id => `"${id}"`).join(',')})`)
              .order("created_at", { ascending: false })

            if (colDocsError) {
              console.error("Collaborated docs error:", colDocsError)
              throw colDocsError
            }
            
            setColDocs(colDocsData || [])
            console.log("Collaborated documents fetched:", colDocsData)
          }
        }
      } catch (err) {
        console.error("Error fetching documents:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDocs()
  }, [navigate])

  const createDocument = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("documents")
        .insert([{ title: "Untitled Document", owner_id: user.id }])
        .select()

      if (error) throw error

      const newDoc = data[0]
      setDocs([newDoc, ...docs])
      navigate(`/documents/${user.id}/${newDoc.id}`)
    } catch (err) {
      console.error("Error creating document:", err)
      alert("Failed to create document")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  if (loading) {
    return (
      <div className="loading-container fade-in">
        <div className="loading-spinner"></div>
        <p>Loading your documents...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container fade-in">
        <p>Error: {error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <div className="user-info">
          <h3>Welcome back! 👋</h3>
          <p>{user?.email}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={createDocument}>
            + New Document
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="documents-section">
        <div className="section-header">
          <h2>Your Documents</h2>
        </div>
        {docs.length > 0 ? (
          <ul className="documents-list">
            {docs.map((doc) => (
              <li key={doc.id}>
                <div 
                  className="document-card"
                  onClick={() => navigate(`/documents/${user.id}/${doc.id}`)}
                >
                  <div className="document-icon">📄</div>
                  <div className="document-title">
                    {doc.title || "Untitled Document"}
                  </div>
                  <div className="document-meta">
                    Created {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                   
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No documents yet</p>
            <p style={{ fontSize: '0.9rem' }}>Create your first document to get started</p>
          </div>
        )}
      </div>

      <div className="documents-section">
        <div className="section-header">
          <h2>Shared With You</h2>
        </div>
        {colDocs.length > 0 ? (
          <ul className="documents-list">
            {colDocs.map((doc) => (
              <li key={doc.id}>
                <div 
                  className="document-card"
                  onClick={() => navigate(`/documents/${user.id}/${doc.id}`)}
                >
                  <div className="document-icon">🤝</div>
                  <div className="document-title">
                    {doc.title || "Untitled Document"}
                  </div>
                  <div className="document-meta">
                    Shared document
                  </div>
                  <span className="collab-badge">Collaborator</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>No shared documents</p>
            <p style={{ fontSize: '0.9rem' }}>Documents shared with you will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}