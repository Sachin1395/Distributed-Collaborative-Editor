import { useEditor, EditorContent } from '@tiptap/react'
import Heading from '@tiptap/extension-heading'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Document from '@tiptap/extension-document'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Placeholder } from '@tiptap/extensions'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import { ResizableImage } from './ResizableImage'
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button'
import CodeBlock from '@tiptap/extension-code-block'
import RenameModal from './RenameModal'
import { MdMenu, MdClose, MdSave, MdLogout, MdDownload, MdImage } from 'react-icons/md'
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { MdFormatBold, MdFormatItalic, MdFormatUnderlined } from 'react-icons/md'
import { AiOutlineOrderedList, AiOutlineUnorderedList } from 'react-icons/ai'
import { MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight } from 'react-icons/md'
import { MdLooksOne, MdLooksTwo, MdLooks3 } from 'react-icons/md'
import { FaFilePdf, FaFileWord } from 'react-icons/fa'
import './editor.css'
import { FontFamily } from './FontFamily'
import { IndexeddbPersistence } from 'y-indexeddb'
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
import SyncraftLoader from './Loader'

const Tiptap = ({ docId, user }) => {
  const renderCountRef = useRef(0)
  renderCountRef.current++
  console.log("🌀 Tiptap render count:", renderCountRef.current, "for docId:", docId, "user:", user?.email)

  const navigate = useNavigate()
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [currentTitle, setCurrentTitle] = useState("")
  const [userRole, setUserRole] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ✅ Memoize ydoc and provider so they're created once per docId
  const { ydoc, provider } = useMemo(() => {
    console.log("🌐 Creating provider for:", docId)
    const ydoc = new Y.Doc()
    const provider = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: docId,
      document: ydoc,
    })
    return { ydoc, provider }
  }, [docId])

  // ✅ Cleanup when docId changes or component unmounts
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up provider and ydoc for:", docId)
      provider.disconnect()
      ydoc.destroy()
    }
  }, [provider, ydoc, docId])

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

      console.log("owner", docData?.owner_id, "user", user.id)

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
        setUserRole(collabData.role)
      } else if (collabData?.role === "viewer") {
        setUserRole("viewer")
      } else {
        setUserRole("UnidentifiedUser")
      }
    }

    fetchUserRole()
  }, [docId, user?.id])

  console.log("User Role:", userRole)

  const isOwner = userRole === "owner"
  const isEditor = userRole === "editor"
  const isViewer = userRole === "viewer"

  // Memoize extensions to prevent recreation
  const extensions = useMemo(() => [
    Document,
    Paragraph,
    FontFamily,
    Text,
    BulletList,
    ListItem,
    OrderedList,
    Heading.configure({
      levels: [1, 2, 3],
    }),
    Bold,
    Italic,
    ResizableImage,
    Underline,
    Collaboration.configure({
      document: ydoc,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    CodeBlock.configure({ HTMLAttributes: { class: 'my-code-block' } }),
    CollaborationCaret.configure({
      provider: provider,
      user: {
        name: user?.email || "Anonymous",
        color: stringToColor(user?.email || "anon"),
      },
    }),
    Placeholder.configure({
      placeholder: 'Write something… It will be shared with everyone else looking at this document.',
    }),
  ], [ydoc, provider, user?.email])

  const editor = useEditor({
    editable: userRole !== "viewer",
    extensions,
  })

  // Update editability when userRole changes
  useEffect(() => {
    if (editor && userRole !== null) {
      editor.setEditable(userRole !== "viewer")
    }
  }, [editor, userRole])

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
      // 1️⃣ Fetch current title
      const { data: docData, error: fetchError } = await supabase
        .from("documents")
        .select("title")
        .eq("id", docId)
        .single()

      if (fetchError) {
        console.error("Error fetching document title:", fetchError)
        return
      }

      // 2️⃣ If it's "Untitled Document", show rename modal
      if (docData?.title === "Untitled Document") {
        setCurrentTitle(docData.title)
        setShowRenameModal(true)
        setMobileMenuOpen(false)
        return // Don't save yet, wait for rename
      }

      // 3️⃣ Continue with content save
      const update = Y.encodeStateAsUpdate(ydoc)
      const base64 = btoa(String.fromCharCode(...update))

      const { error } = await supabase
        .from("documents")
        .update({ content: base64 })
        .eq("id", docId)

      if (error) {
        console.error("Error saving document:", error)
        alert("Failed to save document.")
      } else {
        alert("✅ Save successful")
        console.log("✅ Document saved to Supabase")
      }
      setMobileMenuOpen(false)
    } catch (err) {
      console.error("Unexpected error saving doc:", err)
    }
  }

  // Add this new function to handle renaming from the modal
  const handleRenameAndSave = async (newTitle) => {
    try {
      // Update the title
      const { error: titleError } = await supabase
        .from("documents")
        .update({ title: newTitle })
        .eq("id", docId)

      if (titleError) {
        throw titleError
      }

      console.log(`📝 Title updated to: ${newTitle}`)

      // Now save the content
      const update = Y.encodeStateAsUpdate(ydoc)
      const base64 = btoa(String.fromCharCode(...update))

      const { error: contentError } = await supabase
        .from("documents")
        .update({ content: base64 })
        .eq("id", docId)

      if (contentError) {
        throw contentError
      }

      alert("✅ Document renamed and saved successfully")
      console.log("✅ Document saved to Supabase")

      setShowRenameModal(false)
    } catch (err) {
      console.error("Error saving document:", err)
      throw err // Re-throw so the modal can show the error
    }
  }

  function normalizeImageSizes(html) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const images = doc.querySelectorAll('img')

    images.forEach(img => {
      const style = img.getAttribute('style') || ''
      const widthMatch = style.match(/width:\s*(\d+)px/)
      const heightMatch = style.match(/height:\s*(\d+)px/)

      if (widthMatch) img.setAttribute('width', widthMatch[1])
      if (heightMatch) img.setAttribute('height', heightMatch[1])
    })

    return doc.body.innerHTML
  }

  async function downloadAsDocx() {
    try {
      let htmlWithBase64Images = await convertImagesToBase64(editor.getHTML())

      // Ensure empty paragraphs have a real invisible space inside
      htmlWithBase64Images = htmlWithBase64Images.replace(
        /<p>(\s|<br\s*\/?>)*<\/p>/g,
        "<p>&#8203;</p>"
      )

      const htmlContent = `
      <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body>${htmlWithBase64Images}</body>
  </html>
    `

      const converted = htmlDocx.asBlob(htmlContent)
      saveAs(converted, `document-${docId}.docx`)
      setMobileMenuOpen(false)
    } catch (error) {
      console.error("Error exporting DOCX:", error)
    }
  }

  async function downloadAsPDF() {
    const htmlWithBase64Images = await convertImagesToBase64(editor.getHTML())

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
            img { display: block; }
          </style>
        </head>
        <body>${htmlWithBase64Images}</body>
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
      html2canvas: {
        scale: 0.8,
        useCORS: true,
        allowTaint: true
      },
      callback: function (pdf) {
        pdf.save(`document-${docId}.pdf`)
        document.body.removeChild(element)
        setShowDownloadMenu(false)
        setMobileMenuOpen(false)
      },
    })
  }

  async function convertImagesToBase64(html) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const images = doc.querySelectorAll('img')

    const promises = Array.from(images).map(async (img) => {
      try {
        const src = img.getAttribute('src')

        if (src.startsWith('data:')) {
          return
        }

        const response = await fetch(src)
        const blob = await response.blob()
        const base64 = await blobToBase64(blob)

        img.setAttribute('src', base64)
      } catch (error) {
        console.error('Error converting image:', error)
      }
    })

    await Promise.all(promises)
    return doc.body.innerHTML
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  if (!editor || !user?.email) {
    return <SyncraftLoader message='Craft in Progress'></SyncraftLoader>
  }

  return (
    <>
      <div className="control-group">
        {/* Desktop Toolbar */}
        <div className="toolbar desktop-toolbar">
          {(isOwner || isEditor) && (
            <div className="group">
              <button
                onClick={() => saveDocument(docId, ydoc)}
                className="icon-button"
                title="Save Document"
              >
                <MdSave />
              </button>
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
            <CodeBlockButton
              editor={editor}
              hideWhenUnavailable={true}
              onToggled={() => console.log('Code block toggled!')}
            />
          </div>

          <div className="group">
            <select
              value={editor.getAttributes('textStyle').fontFamily || 'default'}
              onChange={(e) => {
                const v = e.target.value
                if (v === 'default') {
                  editor.chain().focus().unsetFontFamily().run()
                } else {
                  editor.chain().focus().setFontFamily(v).run()
                }
              }}
              style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
            >
              <option value="default">Font</option>
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>

          {(isOwner || isEditor) && (
            <div className="group download-menu-wrapper">
              <button
                className="icon-button"
                onClick={() => setShowDownloadMenu(true)}
                title="Download Document"
              >
                <MdDownload />
              </button>

              {showDownloadMenu && (
                <div
                  className="download-menu"
                  onMouseEnter={() => setShowDownloadMenu(true)}
                  onMouseLeave={() => setShowDownloadMenu(false)}
                >
                  <button onClick={downloadAsPDF} className="download-option">
                    <FaFilePdf className="format-icon pdf" />
                    <span>PDF</span>
                  </button>
                  <button onClick={downloadAsDocx} className="download-option">
                    <FaFileWord className="format-icon docx" />
                    <span>DOCX</span>
                  </button>
                </div>
              )}
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

          <div className="group">
            <button
              onClick={handleLogout}
              className="icon-button logout-button"
              title="Logout"
            >
              <MdLogout />
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="mobile-only mobile-header">
          <div className="mobile-collaborators">
            <Collaborators provider={provider} />
          </div>
          <button className="hamburger-button" onClick={() => setMobileMenuOpen(true)}>
            <MdMenu />
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Mobile Menu Sidebar */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Menu</h3>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#374151' }}
            >
              <MdClose />
            </button>
          </div>

          <div className="mobile-menu-content">
            {(isOwner || isEditor) && (
              <div className="mobile-menu-section">
                <div className="mobile-menu-section-title">Document</div>
                <div className="mobile-menu-buttons">
                  <button onClick={() => saveDocument(docId, ydoc)} className="mobile-menu-button">
                    <MdSave /> Save Document
                  </button>
                  <button onClick={downloadAsPDF} className="mobile-menu-button">
                    <FaFilePdf className="pdf" /> Download PDF
                  </button>
                  <button onClick={downloadAsDocx} className="mobile-menu-button">
                    <FaFileWord className="docx" /> Download DOCX
                  </button>
                </div>
              </div>
            )}

            <div className="mobile-menu-section">
              <div className="mobile-menu-section-title">Formatting</div>
              <div className="mobile-menu-buttons">
                <button onClick={() => { editor.chain().focus().toggleBold().run(); setMobileMenuOpen(false); }} className="mobile-menu-button">
                  <MdFormatBold /> Bold
                </button>
                <button onClick={() => { editor.chain().focus().toggleItalic().run(); setMobileMenuOpen(false); }} className="mobile-menu-button">
                  <MdFormatItalic /> Italic
                </button>
                <button onClick={() => { editor.chain().focus().toggleUnderline().run(); setMobileMenuOpen(false); }} className="mobile-menu-button">
                  <MdFormatUnderlined /> Underline
                </button>
              </div>
            </div>

            <div className="mobile-menu-section">
              <div className="mobile-menu-section-title">Lists & Headings</div>
              <div className="mobile-menu-buttons">
                <button onClick={() => { editor.chain().focus().toggleBulletList().run(); setMobileMenuOpen(false); }} className="mobile-menu-button">
                  <AiOutlineUnorderedList /> Bullet List
                </button>
                <button onClick={() => { editor.chain().focus().toggleOrderedList().run(); setMobileMenuOpen(false); }} className="mobile-menu-button">
                  <AiOutlineOrderedList /> Numbered List
                </button>
                <button onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setMobileMenuOpen(false); }} className="mobile-menu-button">
                  <MdLooksOne /> Heading 1
                </button>
                <button onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setMobileMenuOpen(false); }} className="mobile-menu-button">
                  <MdLooksTwo /> Heading 2
                </button>
              </div>
            </div>

            <div className="mobile-menu-section">
              <div className="mobile-menu-section-title">Alignment</div>
              <div className="mobile-menu-buttons">
                <button onClick={() => { editor.chain().focus().setTextAlign('left').run(); setMobileMenuOpen(false); }} className="mobile-menu-button">
                  <MdFormatAlignLeft /> Align Left
                </button>
                <button onClick={() => { editor.chain().focus().setTextAlign('center').run(); setMobileMenuOpen(false); }} className="mobile-menu-button">
                  <MdFormatAlignCenter /> Align Center
                </button>
                <button onClick={() => { editor.chain().focus().setTextAlign('right').run(); setMobileMenuOpen(false); }} className="mobile-menu-button">
                  <MdFormatAlignRight /> Align Right
                </button>
              </div>
            </div>

            <div className="mobile-menu-section">
              <div className="mobile-menu-section-title">Insert</div>
              <div className="mobile-menu-buttons">
                <button onClick={() => { addImage(); setMobileMenuOpen(false); }} className="mobile-menu-button">
                  <MdImage /> Add Image
                </button>
              </div>
            </div>

            <div className="mobile-menu-section">
              <div className="mobile-menu-buttons">
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="mobile-menu-button logout-mobile">
                  <MdLogout /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditorContent className='editor-div' editor={editor} />
      {showRenameModal && (
        <RenameModal
          currentTitle={currentTitle}
          onRename={handleRenameAndSave}
          onCancel={() => setShowRenameModal(false)}
        />
      )}
    </>
  )
}

export default Tiptap