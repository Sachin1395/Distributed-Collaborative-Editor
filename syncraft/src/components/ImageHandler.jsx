import { supabase } from "./supabase_client"

function ImageHandler({ editor }) {
  // When user clicks button
  const addImage = () => {
    const url = window.prompt("Enter image URL (leave empty to upload from local)")
    if (url) {
      // Case 1: Public URL provided
      editor.chain().focus().setImage({ src: url }).run()
    } else {
      // Case 2: Upload from local
      document.getElementById("image-upload").click()
    }
  }

  // Handle local file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Unique path: store in "images/public/"
    const filePath = `public/${Date.now()}-${file.name}`

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file)

    if (error) {
      console.error("❌ Upload failed:", error.message)
      return
    }

    // Get public URL
    const { data } = supabase
      .storage
      .from("images")
      .getPublicUrl(filePath)

    const publicUrl = data.publicUrl

    // Insert into editor
    editor.chain().focus().setImage({ src: publicUrl }).run()
  }

  return (
    <>
      {/* Toolbar Button */}
      <button onClick={addImage}>🖼 Add Image</button>

      {/* Hidden input for local files */}
      <input
        type="file"
        accept="image/*"
        id="image-upload"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
    </>
  )
}

export default ImageHandler
