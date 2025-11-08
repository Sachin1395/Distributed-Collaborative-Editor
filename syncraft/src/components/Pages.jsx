// extensions/Page.js
import { Node, mergeAttributes } from '@tiptap/core'
import { v4 as uuidv4 } from 'uuid'

// Export a global map for NodeViews to register their DOM element
export const PageDOMMap = new Map()

export const Page = Node.create({
  name: 'page',
  group: 'block',
  content: 'block+',
  isolating: true, // keeps page contents scoped
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: el => el.getAttribute('data-page-id'),
        renderHTML: attrs => (attrs.id ? { 'data-page-id': attrs.id } : {})
      }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="page"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page', class: 'a4-page' }), 0]
  },

  addNodeView() {
    // TipTap will call this for each page node instance
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('div')
      dom.classList.add('a4-page')
      const id = node.attrs.id || uuidv4()
      dom.setAttribute('data-page-id', id)

      // contentDOM is where ProseMirror will render the node's children
      const content = document.createElement('div')
      content.classList.add('page-content')
      dom.appendChild(content)

      // register DOM element with the page id
      PageDOMMap.set(id, { dom, node, getPos })

      // cleanup when destroyed
      const destroy = () => {
        PageDOMMap.delete(id)
      }

      return {
        dom,
        contentDOM: content,
        destroy,
      }
    }
  },

  // ensure when a new page is inserted, it gets an id
  addCommands() {
    return {
      insertPage:
        () =>
        ({ tr, dispatch, state }) => {
          const { schema } = state
          const page = schema.nodes.page.create({ id: uuidv4() }, schema.nodes.paragraph.create())
          tr = tr.insert(state.selection.to, page)
          if (dispatch) dispatch(tr)
          return true
        }
    }
  }
})
