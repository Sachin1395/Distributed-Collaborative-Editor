import {
  Undo, Redo, Bold, Italic, Strikethrough, Underline,
  Heading, List, ListOrdered, Quote, Code, Link, Highlighter,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Image
} from 'lucide-react'

import React from 'react'

const MenuBar = ({ editor }) => {
  if (!editor) return null

  const Button = ({ icon: Icon, action, isActive = false, className = '' }) => (
    <button
      onClick={action}
      className={`toolbar-btn ${isActive ? 'is-active' : ''} ${className}`}
    >
      <Icon size={16} />
    </button>
  )

  return (
    <div className="menu-bar-wrapper">
      <div className="toolbar-group">
        <Button icon={Undo} action={() => editor.chain().focus().undo().run()} />
        <Button icon={Redo} action={() => editor.chain().focus().redo().run()} />
      </div>

      <div className="toolbar-group">
        <Button icon={Heading} action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} />
        <Button icon={List} action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} />
        <Button icon={ListOrdered} action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} />
        <Button icon={Quote} action={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} />
      </div>

      <div className="toolbar-group">
        <Button icon={Bold} action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} />
        <Button icon={Italic} action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} />
        <Button icon={Strikethrough} action={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} />
        <Button icon={Underline} action={() => editor.chain().focus().toggleUnderline?.().run()} isActive={editor.isActive('underline')} />
        <Button icon={Code} action={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} />
        <Button icon={Highlighter} action={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} />
        <Button icon={Link} action={() => {
          const url = window.prompt('Enter URL:')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }} />
      </div>

      <div className="toolbar-group">
        <Button icon={AlignLeft} action={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} />
        <Button icon={AlignCenter} action={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} />
        <Button icon={AlignRight} action={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} />
        <Button icon={AlignJustify} action={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} />
      </div>

      <div className="toolbar-group">
        <Button icon={Image} action={() => {
          const url = window.prompt('Enter image URL:')
          if (url) editor.chain().focus().setImage({ src: url }).run()
        }} />
      </div>
    </div>
  )
}

export default MenuBar
