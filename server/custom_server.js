import http from 'http'
import { WebSocketServer } from 'ws'
import * as Y from 'yjs'
import WebSocket from 'ws'

const docs = new Map()

function getYDoc(docName) {
  const existing = docs.get(docName)
  if (existing) return existing
  const ydoc = new Y.Doc()
  docs.set(docName, ydoc)
  return ydoc
}

const server = http.createServer()
const wss = new WebSocketServer({ server })

wss.on('connection', (ws, req) => {
  const docName = req.url.slice(1) || 'default'
  const ydoc = getYDoc(docName)

  ws.on('message', (message) => {
    // Here you would handle Yjs sync messages
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  })
})

server.listen(1234, () => {
  console.log('Custom Yjs WebSocket server running on ws://localhost:1234')
})
