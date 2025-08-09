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

import React, { useCallback } from 'react'
import { MdFormatBold, MdFormatItalic, MdFormatUnderlined } from 'react-icons/md'
import { AiOutlineOrderedList, AiOutlineUnorderedList } from 'react-icons/ai'
import { MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight } from 'react-icons/md'
import { MdLooksOne, MdLooksTwo, MdLooks3 } from 'react-icons/md'
import { MdImage } from 'react-icons/md'
import './editor.css'


import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
// import { HocuspocusProvider } from '@hocuspocus/provider'

import { WebsocketProvider } from 'y-websocket'
const ydoc = new Y.Doc()
const provider = new WebsocketProvider('ws://localhost:1234', 'my-doc', ydoc)



// const ydoc = new Y.Doc();
// const provider = new HocuspocusProvider({
//   url: "ws://localhost:1234", 
//   name: "my-document", 
//   document: ydoc,
// });

const Tiptap = () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, BulletList, ListItem, OrderedList, Heading.configure({
      levels: [1, 2, 3],
    }), Bold, Italic, Image, Underline,Collaboration.configure({
      document: ydoc,
    }), TextAlign.configure({
      types: ['heading', 'paragraph'],
    }), CollaborationCaret.configure({
        provider,
        user: {
          name: 'Sachin',
          color: '#f783ac',
        },
      }),Placeholder.configure({
        placeholder: 'Write something … It’ll be shared with everyone else looking at this example.',
      }),
    ],
    
    // content: '<h1>Hello World!</hi></br><p> Dream it. Build it. Own it. You Can! </p>',
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
        <div className="toolbar">
          <div className="group">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}><MdFormatBold /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}><MdFormatItalic /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'active' : ''}><MdFormatUnderlined /></button>
          </div>

          <div className="group">
            <button onClick={() => editor.chain().focus().toggleBulletList().run()}><AiOutlineUnorderedList /></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()}><AiOutlineOrderedList /></button>
          </div>

          <div className="group">
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><MdLooksOne /></button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><MdLooksTwo /></button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><MdLooks3 /></button>
          </div>

          <div className="group">
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()}><MdFormatAlignLeft /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()}><MdFormatAlignCenter /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()}><MdFormatAlignRight /></button>
          </div>

          <div className="group">
            <button onClick={addImage}><MdImage /></button>
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
