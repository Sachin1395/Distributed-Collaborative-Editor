// import http from 'http'
// import { WebSocketServer } from 'ws'
// import * as Y from 'yjs'
// import WebSocket from 'ws'

// const docs = new Map()

// function getYDoc(docName) {
//   const existing = docs.get(docName)
//   if (existing) return existing
//   const ydoc = new Y.Doc()
//   docs.set(docName, ydoc)
//   return ydoc
// }

// const server = http.createServer()
// const wss = new WebSocketServer({ server })

// wss.on('connection', (ws, req) => {
//   const docName = req.url.slice(1) || 'default'
//   const ydoc = getYDoc(docName)

//   ws.on('message', (message) => {
//     // Here you would handle Yjs sync messages
//     wss.clients.forEach(client => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(message)
//       }
//     })
//   })
// })

// server.listen(1234, () => {
//   console.log('Custom Yjs WebSocket server running on ws://localhost:1234')
// })


// server.js
// import { Server } from "@hocuspocus/server"
// import { Redis } from "@hocuspocus/extension-redis"

// const server = Server.configure({
//   port: 1234,
//   extensions: [
//     new Redis({
//       host: "127.0.0.1",  // or your Upstash/Redis Cloud host
//       port: 6379,         // Upstash gives you a URL instead
//     }),
//   ],
// })

// server.listen()
// console.log("🚀 Hocuspocus server with Redis running at ws://localhost:1234")


// server.js
import { Server } from "@hocuspocus/server"
import { Redis } from "@hocuspocus/extension-redis"

const server = new Server({
  port: 1234,
  extensions: [
    new Redis({
      url: 'rediss://default:**@pretty-glowworm-19249.upstash.io:6379',  // <--- Use the full URL here
      // You don't need host, port, username, password, tls if using the URL
    }),
  ],
})

server.listen()
console.log("🚀 Hocuspocus server with Upstash Redis running at ws://localhost:1234")



