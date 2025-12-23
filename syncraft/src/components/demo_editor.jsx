import React, { useEffect, useMemo, useRef, useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { useNavigate } from 'react-router-dom'
import Document from "@tiptap/extension-document"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import Heading from "@tiptap/extension-heading"
import Bold from "@tiptap/extension-bold"
import Italic from "@tiptap/extension-italic"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { BulletList, OrderedList, ListItem } from "@tiptap/extension-list"
import CodeBlock from "@tiptap/extension-code-block"
import { TableKit } from "@tiptap/extension-table"
import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCaret from "@tiptap/extension-collaboration-caret"
import { Placeholder } from "@tiptap/extensions"

import {
  MdUndo, MdRedo, MdImage,
  MdFormatBold, MdFormatItalic, MdFormatUnderlined,
  MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight,
  MdLooksOne, MdLooksTwo, MdLooks3,MdHome
} from "react-icons/md"
import {
  AiOutlineOrderedList,
  AiOutlineUnorderedList,
} from "react-icons/ai"

import * as Y from "yjs"
import { HocuspocusProvider } from "@hocuspocus/provider"

import "./editor.css"


// ─────────────────────────────────────────────
// DEMO CONSTANTS
// ─────────────────────────────────────────────
const DEMO_DOC_ID = "syncdraft-demo-doc"

const DEMO_USER = {
  name: `Guest-${Math.floor(Math.random() * 1000)}`,
  color: `hsl(${Math.random() * 360}, 70%, 60%)`,
}

const DEMO_CONTENT = `
<h1>SyncDraft</h1>
<p>
  A real-time collaborative editor for focused, fast writing.
</p>

<h2>Live collaboration</h2>
<p>
  Open this page in two tabs and type together. Changes sync instantly.
</p>

<h2>Rich editing</h2>
<ul>
  <li>Headings, lists, alignment</li>
  <li>Code blocks and tables</li>
  <li>Images and formatting</li>
</ul>

<pre><code>console.log("Real-time collaboration");</code></pre>

<hr />

<p>
  <strong>Sign in to unlock the full experience:</strong><br />
  persistent documents, version history, and team collaboration.
</p>

<p style="opacity: 0.6; font-size: 14px;">
  Demo changes reset on refresh.
</p>
`


// ─────────────────────────────────────────────
// DEMO EDITOR
// ─────────────────────────────────────────────
const DemoEditor = () => {
  const ydocRef = useRef(new Y.Doc())
  const providerRef = useRef(null)
const navigate = useNavigate()

  // ─────────────────────────────────────────────
  // Hocuspocus Provider
  // ─────────────────────────────────────────────
  if (!providerRef.current) {
    const WS_URL =
      process.env.REACT_APP_WS_URL || "ws://localhost:1234"

    providerRef.current = new HocuspocusProvider({
      url: WS_URL,
      name: DEMO_DOC_ID,
      document: ydocRef.current,
    })
  }

  const extensions = useMemo(() => [
    Document,
    Paragraph,
    Text,
    Heading.configure({ levels: [1, 2, 3] }),
    BulletList,
    OrderedList,
    ListItem,
    Bold,
    Italic,
    Underline,
    CodeBlock,
    TableKit.configure({ resizable: true }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Collaboration.configure({
      document: ydocRef.current,
    }),
    CollaborationCaret.configure({
      provider: providerRef.current,
      user: DEMO_USER,
    }),
    Placeholder.configure({
      placeholder: "Write something…",
    }),
  ], [])

  const editor = useEditor({
    extensions,
    editable: true,
  })

  // ─────────────────────────────────────────────
  // Load demo content once
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(DEMO_CONTENT)
    }
  }, [editor])

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────
  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const resetDemo = () => {
    editor.commands.clearContent()
    editor.commands.setContent(DEMO_CONTENT)
  }

  if (!editor) return null

  return (
    <>
      {/* Demo Banner */}
      <div className="demo-banner">
        🚀 Demo Mode — no login, no saving, changes reset on refresh
      </div>

      <div className="control-group">
        {/* Toolbar */}
        <div className="toolbar desktop-toolbar">

            <div className="group">
            <button
              onClick={() => navigate('/')}
              className="icon-button home-button"
              title="Go to Home"
            ><MdHome />
            </button>
          </div>

            
          <div className="group">
            <button onClick={() => editor.chain().focus().undo().run()}>
              <MdUndo />
            </button>
            <button onClick={() => editor.chain().focus().redo().run()}>
              <MdRedo />
            </button>
          </div>

          <div className="group">
            <button onClick={() => editor.chain().focus().toggleBold().run()}>
              <MdFormatBold />
            </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()}>
              <MdFormatItalic />
            </button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
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
            <button onClick={() => editor.chain().focus().setTextAlign("left").run()}>
              <MdFormatAlignLeft />
            </button>
            <button onClick={() => editor.chain().focus().setTextAlign("center").run()}>
              <MdFormatAlignCenter />
            </button>
            <button onClick={() => editor.chain().focus().setTextAlign("right").run()}>
              <MdFormatAlignRight />
            </button>
          </div>

          <div className="group">
            <button onClick={addImage}>
              <MdImage />
            </button>
          </div>

          <div className="group">
            <button
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
            >
              Table
            </button>
          </div>

          <div className="group" style={{ marginLeft: "auto" }}>
            <button onClick={resetDemo}>
              Reset Demo
            </button>
          </div>
        </div>
      </div>

      <EditorContent className="editor-div" editor={editor} />
    </>
  )
}

export default DemoEditor
