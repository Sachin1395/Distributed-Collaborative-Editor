import React from 'react'
import './editor.css'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'

import ThemeToggle from './toggletheme'

// Menu bar buttons
const MenuBar = ({ editor }) => {
  if (!editor) return null

  const buttons = [
    { label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }) },
    { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }) },
    { label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold') },
    { label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic') },
    { label: 'Strike', action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike') },
    { label: 'Highlight', action: () => editor.chain().focus().toggleHighlight().run(), isActive: editor.isActive('highlight') },
    { label: 'Left', action: () => editor.chain().focus().setTextAlign('left').run(), isActive: editor.isActive({ textAlign: 'left' }) },
    { label: 'Center', action: () => editor.chain().focus().setTextAlign('center').run(), isActive: editor.isActive({ textAlign: 'center' }) },
    { label: 'Right', action: () => editor.chain().focus().setTextAlign('right').run(), isActive: editor.isActive({ textAlign: 'right' }) },
    { label: 'Justify', action: () => editor.chain().focus().setTextAlign('justify').run(), isActive: editor.isActive({ textAlign: 'justify' }) },
  ]

  return (
    <div className="menu-bar">
      {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.action}
          className={btn.isActive ? 'is-active' : ''}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'left',
      }),
    ],
    content: `
      <h1>Getting started</h1>
      <p>Welcome to the <em>Simple Editor</em>! This integrates <strong>open source</strong> UI components.</p>
    `,
  })

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  if (!editor) return null

  return (
    <div className="editor-wrapper">
      <ThemeToggle />

      <BubbleMenu editor={editor} className="bubble-menu">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>
          B
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>
          I
        </button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>
          S
        </button>
      </BubbleMenu>

      <FloatingMenu editor={editor} className="floating-menu">
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>
          H1
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>
          H2
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>
          • List
        </button>
      </FloatingMenu>

      <div className="editor-div">
        <MenuBar editor={editor} />
        <button onClick={addImage} className="image-btn">+ Add Image</button>
        <EditorContent editor={editor} className="tiptap" />
      </div>
    </div>
  )
}

export default Editor
