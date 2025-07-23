// src/Tiptap.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Image from '@tiptap/extension-image'
import Document from '@tiptap/extension-document'
import { BulletList, ListItem, OrderedList  } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import React, { useCallback } from 'react'

const Tiptap = () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, BulletList, ListItem, OrderedList,Bold,Italic, Image],
    content: '<p>Hello World!</p>',
  })

  const addImage = useCallback(() => {
    const url = window.prompt('URL')

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) return null

  return (
    <>
    <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
          >
            Toggle bullet list
          </button>
          <button
            onClick={() => editor.chain().focus().splitListItem('listItem').run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
          >
            Split list item
          </button>
          {/* <button
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
            disabled={!editor.can().sinkListItem('listItem')}
          >
            Sink list item
          </button> */}
          <button
            onClick={() => editor.chain().focus().liftListItem('listItem').run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
          >
            Lift list item
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
          >
            Toggle ordered list
          </button>
          <button
            onClick={() => editor.chain().focus().splitListItem('listItem').run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
          >
            Split list item
          </button>
          {/* <button
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
            disabled={!editor.can().sinkListItem('listItem')}
          >
            Sink list item
          </button> */}
          <button
            onClick={() => editor.chain().focus().liftListItem('listItem').run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
          >
            Lift list item
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
          >
            Toggle bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            Toggle italic
          </button>
           <button onClick={addImage}>Set image</button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}

export default Tiptap
