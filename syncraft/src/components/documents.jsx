import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "./supabase_client"
import "./Documents.css"
import SyncraftLoader from "./Loader"

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

  const getUserInitials = (email) => {
    if (!email) return "U"
    return email.charAt(0).toUpperCase()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <SyncraftLoader message="Loading Documents" />
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
    <div className="dashboard-wrapper fade-in">
      {/* Sticky Header */}
      <header className="dashboard-navbar">
        <div className="navbar-content">
          <div className="user-profile">
            <div className="user-avatar">
              {getUserInitials(user?.email)}
            </div>
            <div className="user-details">
              <h4>{user?.email}</h4>
              <p>Manage your documents</p>
            </div>
          </div>
          <div className="navbar-actions">
            <button className="btn btn-primary" onClick={createDocument}>
              <span className="btn-icon">+</span>
              <span className="btn-text">New Document</span>
            </button>
            <button className="btn btn-secondary" onClick={handleLogout}>
              <span className="btn-icon">→</span>
              <span className="btn-text">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome back! 👋</h1>
          <p className="welcome-subtitle">Here are all your documents</p>
        </div>

        {/* Your Documents Section */}
        <div className="documents-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <span className="section-icon">📄</span>
              <h2>Your Documents</h2>
            </div>
            <span className="document-count">{docs.length} document{docs.length !== 1 ? 's' : ''}</span>
          </div>
          
          {docs.length > 0 ? (
            <ul className="documents-list">
              {docs.map((doc) => (
                <li key={doc.id}>
                  <div 
                    className="document-card"
                    onClick={() => navigate(`/documents/${user.id}/${doc.id}`)}
                  >
                    <div className="card-header">
                      <div className="document-icon">📄</div>
                      <button className="card-menu" onClick={(e) => e.stopPropagation()}>
                        ⋮
                      </button>
                    </div>
                    <div className="document-title">
                      {doc.title || "Untitled Document"}
                    </div>
                    <div className="document-meta">
                      Created {formatDate(doc.created_at)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p className="empty-state-title">No documents yet</p>
              <p className="empty-state-subtitle">Create your first document to get started</p>
            </div>
          )}
        </div>

        {/* Shared Documents Section */}
        <div className="documents-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <span className="section-icon">👥</span>
              <h2>Shared With You</h2>
            </div>
            <span className="document-count">{colDocs.length} document{colDocs.length !== 1 ? 's' : ''}</span>
          </div>
          
          {colDocs.length > 0 ? (
            <ul className="documents-list">
              {colDocs.map((doc) => (
                <li key={doc.id}>
                  <div 
                    className="document-card"
                    onClick={() => navigate(`/documents/${user.id}/${doc.id}`)}
                  >
                    <div className="card-header">
                      <div className="document-icon">🤝</div>
                      <button className="card-menu" onClick={(e) => e.stopPropagation()}>
                        ⋮
                      </button>
                    </div>
                    <div className="document-title">
                      {doc.title || "Untitled Document"}
                    </div>
                    <div className="document-footer">
                      <div className="document-meta">Shared document</div>
                      <span className="collab-badge">Collaborator</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p className="empty-state-title">No shared documents</p>
              <p className="empty-state-subtitle">Documents shared with you will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}