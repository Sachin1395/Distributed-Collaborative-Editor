// plugins/pageBreakPlugin.js
import { Plugin, PluginKey } from 'prosemirror-state'
import { PageDOMMap } from './Pages' // import the map
import { Node as ProseMirrorNode } from 'prosemirror-model'

const A4_HEIGHT_PX = 1122 // baseline - adjust for your DPI and padding (experiment)

/**
 * Helper: given a page node's Pos in the document and its ProseMirror node,
 * return array of child block nodes with their start/end positions.
 */
function getChildBlocks(state, pagePos, pageNode) {
  const blocks = []
  let index = 0
  pageNode.forEach((child, offset, i) => {
    // compute start pos = pagePos + 1 (the opening) + offset in the page
    // In ProseMirror, positions are measured in document coords; we can compute using node.resolve
    blocks.push({
      node: child,
      index,
      // startPos and endPos will be computed by walking document
    })
    index++
  })
  return blocks
}

/**
 * Given the editorView and a page's getPos function, compute each direct child's
 * doc positions (start, end) and return an array.
 */
function getPageChildPositions(view, pagePos) {
  const pageNode = view.state.doc.nodeAt(pagePos)
  const children = []
  if (!pageNode) return children

  let pos = pagePos + 1 // first child starts after opening of page node
  pageNode.forEach((child) => {
    const start = pos
    const end = pos + child.nodeSize
    children.push({ node: child, start, end })
    pos = end
  })

  return children
}

export const PageBreakPlugin = new Plugin({
  key: new PluginKey('page-break'),

  view(editorView) {
    // called when plugin is initialized; return object with update method
    const checkAllPagesAndReflow = () => {
      // iterate pages from page map; but to maintain doc order, we also iterate doc
      const { state } = editorView
      const pages = []

      // traverse doc to find page nodes and their positions (ordered)
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'page') {
          pages.push({ node, pos })
          return false
        }
        return true
      })

      // We'll build a tr and apply once at the end to avoid repeated dispatch
      let tr = null

      for (let i = 0; i < pages.length; i++) {
        const { node: pageNode, pos: pagePos } = pages[i]
        // find page DOM by id attribute
        const id = pageNode.attrs.id
        const entry = PageDOMMap.get(id)
        if (!entry) continue
        const dom = entry.dom
        if (!dom) continue

        // measure content height (we assume content is inside .page-content)
        const contentEl = dom.querySelector('.page-content') || dom
        const contentHeight = contentEl.scrollHeight

        // compute allowed content height in px — derive from CSS A4 min-height minus padding.
        // A practical way is to measure the DOM height of the page (clientHeight),
        // and compare contentHeight to page clientHeight.
        const allowed = dom.clientHeight // page height in px according to computed layout

        // if contentHeight <= allowed => ok
        if (contentHeight <= allowed) continue

        // otherwise overflow: we need to move trailing blocks to a new page
        // compute child block start/end positions in doc
        const children = getPageChildPositions(editorView, pagePos)

        // find split index: earliest child that if moved reduces content below allowed
        // conservative approach: move last child(s) until content fits
        // We'll estimate by temporarily removing the last children until measured height <= allowed
        // To do accurate measurement we may need to create a temporary clone in DOM — simpler: move blocks progressively.

        // We'll build a tr for moving from this pagePos: move blocks from child k..end to new page
        // Move minimal number of trailing blocks: start from last block and move them out until fits.

        let moveFromIndex = children.length // default none
        // We'll progressively simulate moving last child blocks
        // For performance and simplicity we remove last block(s) until content fits.
        // (Note: this means paragraphs may split across pages if they are very large.)
        const movedBlocks = []
        let tempHeight = contentHeight

        for (let j = children.length - 1; j >= 0; j--) {
          const child = children[j]
          // Find the DOM node for this child within the page DOM
          // best effort: use nth-child
          const childDom = contentEl.children[j]
          const childHeight = childDom ? childDom.scrollHeight : 0
          tempHeight -= childHeight
          movedBlocks.unshift(child) // we will move from j to end
          if (tempHeight <= allowed) {
            moveFromIndex = j
            break
          }
        }

        if (moveFromIndex === children.length) {
          // nothing would reduce the height (maybe a single very big block) — fallback:
          // create a new page and move the last child to it (so at least progress happens)
          moveFromIndex = children.length - 1
        }

        // Build transaction to move children[moveFromIndex..end] into a new page inserted after current page
        if (!tr) tr = editorView.state.tr
        // create new page node
        const schema = editorView.state.schema
        const pageNodeType = schema.nodes.page
        const sliceNodes = []

        for (let k = moveFromIndex; k < children.length; k++) {
          const c = children[k]
          // take node from doc at range [c.start, c.end)
          const nodeToMove = editorView.state.doc.nodeAt(c.start)
          // append nodeToMove to sliceNodes (we'll insert them into a new page)
          sliceNodes.push(nodeToMove)
        }

        // Build the content for new page
        const nodesToInsert = sliceNodes.map(n => n.copy(n.content))

        // remove nodes from original page (delete from last to first to keep positions valid)
        for (let k = children.length - 1; k >= moveFromIndex; k--) {
          const c = children[k]
          tr = tr.delete(c.start, c.end)
        }

        // compute insertion position: after the current page (pagePos + pageNode.nodeSize)
        const insertPos = pagePos + pageNode.nodeSize
        // construct a new page node with the moved nodes inside
        const newPage = pageNodeType.create(
          { id: (pageNode.attrs && pageNode.attrs.id) ? undefined : undefined },
          nodesToInsert.length ? nodesToInsert : schema.nodes.paragraph.create()
        )

        tr = tr.insert(insertPos, newPage)
        // after making a change, break — we'll let update re-run and paginate next pages in next tick
        // (Or continue to process other pages by recalculating positions — but that's more complex.)
        break
      } // end pages loop

      if (tr && tr.docChanged) {
        // normalize selection if needed
        editorView.dispatch(tr)
      }
    } // end checkAllPagesAndReflow

    // debounce/respectively throttle updates: run once after small delay
    let scheduled = null
    const scheduleCheck = () => {
      if (scheduled) clearTimeout(scheduled)
      scheduled = setTimeout(() => {
        scheduled = null
        try {
          checkAllPagesAndReflow()
        } catch (e) {
          console.error('Pagination error', e)
        }
      }, 120) // 120ms debounce
    }

    // register mutation observer for container to catch external layout changes
    const root = editorView.dom
    const observer = new MutationObserver(scheduleCheck)
    observer.observe(root, { childList: true, subtree: true, characterData: true })

    // Also trigger on initial load
    scheduleCheck()

    return {
      update(view, prevState) {
        // run on every update (debounced)
        scheduleCheck()
      },
      destroy() {
        observer.disconnect()
      }
    }
  }
})
