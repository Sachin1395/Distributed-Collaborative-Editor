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

import React, { useCallback, useEffect } from 'react'
import { MdFormatBold, MdFormatItalic, MdFormatUnderlined } from 'react-icons/md'
import { AiOutlineOrderedList, AiOutlineUnorderedList } from 'react-icons/ai'
import { MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight } from 'react-icons/md'
import { MdLooksOne, MdLooksTwo, MdLooks3 } from 'react-icons/md'
import { MdImage } from 'react-icons/md'
import './editor.css'

import Collaborators from './collaborators'


import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "./supabase_client"

import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'

const Tiptap = ({ docId, user }) => {
  const navigate = useNavigate()
  // Create a Y.Doc for CRDT
  const ydoc = new Y.Doc()

  // Connect to Hocuspocus server with docId
  const provider = new HocuspocusProvider({
    url: "ws://localhost:1234",
    name: docId, // <-- dynamic per document
    document: ydoc,
  })

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
  }, [docId])

  const editor = useEditor({
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
          name: user?.email || "Anonymous", // <-- dynamic user from Supabase
          color: stringToColor(user?.email || "anon"), // random color from email
        },
      }),
      Placeholder.configure({
        placeholder: 'Write something… It’ll be shared with everyone else looking at this document.',
      }),
    ],
  })

  // helper: map email → color
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

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])





  async function saveDocument(docId, ydoc) {
    try {
      // Encode Yjs document into Base64
      const update = Y.encodeStateAsUpdate(ydoc)
      const base64 = btoa(String.fromCharCode(...update))

      // Save to Supabase
      const { error } = await supabase
        .from("documents")
        .update({ content: base64 })
        .eq("id", docId)

      alert("Save successfull")

      if (error) {
        console.error("Error saving document:", error)
      } else {
        console.log("✅ Document saved to Supabase")
      }
    } catch (err) {
      console.error("Unexpected error saving doc:", err)
    }
  }





  if (!editor) return null

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  return (
    <>
      <div className="control-group">
        <div className="toolbar">
          <div className="group">
            <button onClick={() => saveDocument(docId, ydoc)}> Save</button>

          </div>
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
