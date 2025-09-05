import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "./supabase_client"

export default function Documents() {
  const [docs, setDocs] = useState([])
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const { userId } = useParams() 

  useEffect(() => {
    const fetchDocs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return
      setUser(user)

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      if (error) console.error(error)
      else setDocs(data)
    }

    fetchDocs()
  }, [userId])

  const createDocument = async () => {
    const { data, error } = await supabase
      .from("documents")
      .insert([{ title: "Untitled Document" }]) 
      .select()

    if (error) console.error(error)
    else {
      const newDoc = data[0]
      setDocs([newDoc, ...docs])
      navigate(`/documents/${userId}/${newDoc.id}`) 
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/") 
  }

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <h2>Your Documents</h2>
      <button onClick={createDocument}>+ New Document</button>
      <ul>
        {docs.map((doc) => (
          <li key={doc.id}>
            <button onClick={() => navigate(`/documents/${userId}/${doc.id}`)}>
              {doc.title}
            </button>
          </li>
        ))}
      </ul>
      <button  onClick={handleLogout} >Logout</button>
    </div>
  )
}
