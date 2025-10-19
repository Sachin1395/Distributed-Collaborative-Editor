import { useEditor, EditorContent } from '@tiptap/react'
import Heading from '@tiptap/extension-heading'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Image from '@tiptap/extension-image'
import Document from '@tiptap/extension-document'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Placeholder } from '@tiptap/extensions'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { MdFormatBold, MdFormatItalic, MdFormatUnderlined } from 'react-icons/md'
import { AiOutlineOrderedList, AiOutlineUnorderedList } from 'react-icons/ai'
import { MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight } from 'react-icons/md'
import { MdLooksOne, MdLooksTwo, MdLooks3 } from 'react-icons/md'
import { MdImage } from 'react-icons/md'
import './editor.css'

import InviteCollaborator from './InviteCollaborator'
import Collaborators from './collaborators'
import { useNavigate } from "react-router-dom"
import { supabase } from "./supabase_client"

import { saveAs } from "file-saver"

import html2pdf from "html2pdf.js"
import htmlDocx from "html-docx-js/dist/html-docx"
import jsPDF from "jspdf"

import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'

const Tiptap = ({ docId, user }) => {
  const navigate = useNavigate()


  const ydoc = useMemo(() => new Y.Doc(), [docId])

  const provider = useMemo(() => new HocuspocusProvider({
    url: "ws://localhost:1234",
    name: docId,
    document: ydoc,
  }), [docId, ydoc])

  const [userRole, setUserRole] = useState(null)


  useEffect(() => {
    return () => {
      provider.disconnect()
      ydoc.destroy()
    }
  }, [provider, ydoc])


  useEffect(() => {
    const loadContent = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("content")
        .eq("id", docId)
        .single()

      if (error) {
        console.error("Error loading content:", error)
        return
      }

      if (data?.content) {
        try {
          const binaryString = atob(data.content)
          const update = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            update[i] = binaryString.charCodeAt(i)
          }
          Y.applyUpdate(ydoc, update)
          console.log("Loaded saved content into Y.Doc")
        } catch (err) {
          console.error("Error decoding Y.Doc:", err)
        }
      }
    }
    loadContent()
  }, [docId, ydoc])

  function stringToColor(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    let color = '#'
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff
      color += ('00' + value.toString(16)).slice(-2)
    }
    return color
  }

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id || !docId) return
      console.log("Fetching role for user:", user.id, "and doc:", docId)
      // Step 1: Check if user is owner
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .select("owner_id")
        .eq("id", docId)
        .maybeSingle();



      if (docError) {
        console.error("Error fetching document owner:", docError)
        return
      }

      if (docData?.owner_id === user.id) {
        setUserRole("owner")
        return
      }

      console.log("qwner", docData?.owner_id, "user", user.id)

      // Step 2: If not owner, check collaborators table
      const { data: collabData, error: collabError } = await supabase
        .from("collaborators")
        .select("role")
        .eq("document_id", docId)
        .eq("user_id", user.id)
        .single()

      if (collabError && collabError.code !== "PGRST116") {
        console.error("Error fetching collaborator role:", collabError)
        return
      }

      if (collabData?.role == "editor") {
        setUserRole(collabData.role) // "editor" or "viewer"
      } else if (collabData?.role === "viewer") {
        setUserRole("viewer") // default fallback if not in table
      } else {
        setUserRole("UnidentifiedUser") // no access
      }
    }

    fetchUserRole()
  }, [docId, user?.id])

  console.log("User Role:", userRole)

  const isOwner = userRole === "owner"
  const isEditor = userRole === "editor"
  const isViewer = userRole === "viewer"



  const editor = useEditor({
    editable: userRole !== "viewer",
    extensions: [
      Document,
      Paragraph,
      Text,
      BulletList,
      ListItem,
      OrderedList,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Bold,
      Italic,
      Image,
      Underline,
      Collaboration.configure({
        document: ydoc,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CollaborationCaret.configure({
        provider,
        user: {
          name: user?.email || "Anonymous",
          color: stringToColor(user?.email || "anon"),
        },
      }),
      Placeholder.configure({
        placeholder: 'Write something… It’ll be shared with everyone else looking at this document.',
      }),
    ],
  })

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  useEffect(() => {
    if (userRole && !["owner", "editor", "viewer"].includes(userRole)) {
      alert("You do not have permission to access this document.")
      navigate("/")
    }
  }, [userRole, navigate])

  async function saveDocument(docId, ydoc) {
    try {
      const update = Y.encodeStateAsUpdate(ydoc)
      const base64 = btoa(String.fromCharCode(...update))
      const { error } = await supabase
        .from("documents")
        .update({ content: base64 })
        .eq("id", docId)

      alert("Save successful")
      if (error) {
        console.error("Error saving document:", error)
      } else {
        console.log("✅ Document saved to Supabase")
      }
    } catch (err) {
      console.error("Unexpected error saving doc:", err)
    }
  }

async function downloadAsDocx() {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Arial', sans-serif; font-size: 12pt; }
          h1, h2, h3 { font-weight: bold; }
          p { line-height: 1.5; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>${editor.getHTML()}</body>
      </html>
    `

    const converted = htmlDocx.asBlob(htmlContent, { orientation: "portrait" })
    saveAs(converted, `document-${docId}.docx`)
  } catch (error) {
    console.error("Error exporting DOCX:", error)
  }
}

async function downloadAsPDF() {
  const htmlContent = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: A4; margin: 20mm; }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
          }
          h1, h2, h3 { font-weight: bold; margin-bottom: 8px; }
          p { margin: 0 0 10px; }
          ul, ol { margin: 10px 0; padding-left: 20px; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>${editor.getHTML()}</body>
    </html>
  `

  const element = document.createElement("div")
  element.innerHTML = htmlContent
  document.body.appendChild(element)

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  await pdf.html(element, {
    x: 10,
    y: 10,
    html2canvas: { scale: 1 },
    callback: function (pdf) {
      pdf.save(`document-${docId}.pdf`)
      document.body.removeChild(element)
    },
  })
}


  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  if (!editor || !user?.email) {
    return <div>Loading editor...</div>
  }

  return (
    <>
      <div className="control-group">
        <div className="toolbar">
          {(isOwner || isEditor) && (
            <div className="group">
              <button onClick={() => saveDocument(docId, ydoc)}> Save</button>
            </div>
          )}
          <div className="group">
            <button onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'active' : ''}>
              <MdFormatBold />
            </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'active' : ''}>
              <MdFormatItalic />
            </button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'active' : ''}>
              <MdFormatUnderlined />
            </button>
          </div>

          <div className="group">
            <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <AiOutlineUnorderedList />
            </button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <AiOutlineOrderedList />
            </button>
          </div>

          <div className="group">
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <MdLooksOne />
            </button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <MdLooksTwo />
            </button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <MdLooks3 />
            </button>
          </div>

          <div className="group">
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()}>
              <MdFormatAlignLeft />
            </button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>
              <MdFormatAlignCenter />
            </button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()}>
              <MdFormatAlignRight />
            </button>
          </div>

          <div className="group">
            <button onClick={addImage}><MdImage /></button>
          </div>

          <div className="group">
            <button onClick={handleLogout}>Logout</button>
          </div>
          {(isOwner || isEditor) && (
            <div className="group">
              <button onClick={() => downloadAsDocx()}>Download DOCX</button>
              <button onClick={() => downloadAsPDF()}>Download PDF</button>
            </div>
          )}


          {isOwner && (
            <div>
              <InviteCollaborator documentId={docId} />
            </div>
          )}

          <div className="group" style={{ marginLeft: "auto" }}>
            <Collaborators provider={provider} />
          </div>
        </div>
      </div>

      <EditorContent className='editor-div' editor={editor} />
    </>
  )
}

export default Tiptap




// <button
//             onClick={() => editor.chain().focus().toggleBulletList().run()}
//             className={editor.isActive('bulletList') ? 'is-active' : ''}
//           >
//             Toggle bullet list
//           </button>
//           <button
//             onClick={() => editor.chain().focus().splitListItem('listItem').run()}
//             className={editor.isActive('bulletList') ? 'is-active' : ''}
//           >
//             Split list item
//           </button>
//           {/* <button
//             onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
//             disabled={!editor.can().sinkListItem('listItem')}
//           >
//             Sink list item
//           </button> */}
//           <button
//             onClick={() => editor.chain().focus().liftListItem('listItem').run()}
//             className={editor.isActive('bulletList') ? 'is-active' : ''}
//           >
//             Lift list item
//           </button>

//           <button
//             onClick={() => editor.chain().focus().toggleOrderedList().run()}
//             className={editor.isActive('orderedList') ? 'is-active' : ''}
//           >
//             Toggle ordered list
//           </button>
//           <button
//             onClick={() => editor.chain().focus().splitListItem('listItem').run()}
//             className={editor.isActive('orderedList') ? 'is-active' : ''}
//           >
//             Split list item
//           </button>
