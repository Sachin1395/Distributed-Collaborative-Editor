import { useEffect, useState } from "react"

export default function Collaborators({ provider }) {
  const [users, setUsers] = useState([])

  useEffect(() => {
    // awareness state contains all connected clients
    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values())
      setUsers(states.map(s => s.user)) // our `user` object from CollaborationCaret
    }

    // initial load
    updateUsers()

    // listen for changes
    provider.awareness.on("change", updateUsers)

    // cleanup
    return () => {
      provider.awareness.off("change", updateUsers)
    }
  }, [provider])

  return (
    <div style={{ margin: "1rem 0", display: "flex", gap: "0.5rem" }}>
      {users.map((u, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.2rem 0.5rem",
            borderRadius: "6px",
            background: u?.color || "#ddd",
            color: "white",
          }}
        >
          <span style={{ fontWeight: "bold" }}>
            {u?.name || "Anonymous"}
          </span>
        </div>
      ))}
    </div>
  )
}
