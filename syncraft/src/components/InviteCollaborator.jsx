import { useState } from "react";
import { supabase } from "./supabase_client";

export default function InviteCollaborator({ documentId }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    setLoading(true);

    try {
      // 🔹 Step 1: Look up user via RPC (works with RLS enabled)
      const { data, error } = await supabase.rpc("get_user_by_email", {
        p_email: email.trim(),
      });

      if (error) throw error;
      if (!data || data.length === 0) {
        alert("No user found with that email");
        setLoading(false);
        return;
      }

      const userId = data[0].id;

      // 🔹 Step 2: Insert collaborator row
      const { error: insertError } = await supabase
        .from("collaborators")
        .insert([{ document_id: documentId, user_id: userId, role }]);

      if (insertError) throw insertError;

      alert(`✅ Invited ${email} as ${role}`);
      setEmail("");
    } catch (err) {
      alert("Error inviting collaborator: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ margin: "1rem 0" }}>
      <h4>Invite Collaborator</h4>
      <input
        type="email"
        placeholder="User email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginRight: "0.5rem" }}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>
      <button onClick={handleInvite} disabled={loading}>
        {loading ? "Inviting..." : "Invite"}
      </button>
    </div>
  );
}
