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
// import "dotenv/config"
// import { Server } from "@hocuspocus/server"
// import { Redis } from "@hocuspocus/extension-redis"
// import express from "express"
// import { register, activeConnectionsGauge } from "./metrics.js"

// const {
//   HOCUSPOCUS_PORT = 1234,
//   REDIS_URL,
//   METRICS_PORT = 4000,
//   ALLOWED_ORIGINS = "",
//   METRICS_TOKEN,
// } = process.env

// console.log("REDIS_URL =", REDIS_URL)

// if (!REDIS_URL) {
//   throw new Error("❌ REDIS_URL not set")
// }

// const allowedOrigins = ALLOWED_ORIGINS
//   .split(",")
//   .map(o => o.trim())
//   .filter(Boolean)

// const server = new Server({
//   port: Number(HOCUSPOCUS_PORT),

//   extensions: [
//     new Redis({
//       url: REDIS_URL,
//       redisOptions: {
//         tls: {}, // ✅ CORRECT key for Upstash
//       },
//     }),
//   ],

//   async onConnect({ request }) {
//     const origin = request.headers.origin

//     if (
//       allowedOrigins.length &&
//       origin &&
//       !allowedOrigins.includes(origin)
//     ) {
//       throw new Error("❌ Origin not allowed")
//     }

//     activeConnectionsGauge.inc()
//   },

//   async onDisconnect() {
//     activeConnectionsGauge.dec()
//   },
// })

// server.listen()

// console.log(`🚀 Hocuspocus running at ws://0.0.0.0:${HOCUSPOCUS_PORT}`)

// // ───────────────────────── Metrics ─────────────────────────
// const app = express()

// app.get("/metrics", async (req, res) => {
//   const auth = req.headers.authorization

//   if (METRICS_TOKEN && auth !== `Bearer ${METRICS_TOKEN}`) {
//     return res.status(401).send("Unauthorized")
//   }

//   res.set("Content-Type", register.contentType)
//   res.end(await register.metrics())
// })

// app.listen(METRICS_PORT, () => {
//   console.log(`📊 Metrics at http://localhost:${METRICS_PORT}/metrics`)
// })


import "dotenv/config"
import express from "express"
import cors from "cors"
import http from "http"

import { Server as HocuspocusServer } from "@hocuspocus/server"
import { Redis as HocusRedis } from "@hocuspocus/extension-redis"
import Redis from "ioredis"

import { register, activeConnectionsGauge } from "./metrics.js"

const PORT = process.env.PORT
const REDIS_URL = process.env.REDIS_URL
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || ""
const METRICS_TOKEN = process.env.METRICS_TOKEN

if (!PORT) throw new Error("❌ Render PORT not provided")
if (!REDIS_URL) throw new Error("❌ REDIS_URL not set")

// ─────────────────────────────────────────────
// REDIS
// ─────────────────────────────────────────────
const redis = new Redis(REDIS_URL, {
  tls: {},
  enableReadyCheck: false,
})

redis.on("connect", () => {
  console.log("✅ Connected to Upstash Redis")
})

// ─────────────────────────────────────────────
// ORIGINS
// ─────────────────────────────────────────────
const allowedOrigins = ALLOWED_ORIGINS
  .split(",")
  .map(o => o.trim())
  .filter(Boolean)

// ─────────────────────────────────────────────
// EXPRESS (MAIN SERVER)
// ─────────────────────────────────────────────
const app = express()

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    return cb(new Error("CORS blocked"))
  },
  credentials: true,
}))

app.use(express.json())

// Health endpoint (Render expects this)
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "SyncDraft Backend",
  })
})

// Metrics (same port)
app.get("/metrics", async (req, res) => {
  const auth = req.headers.authorization
  if (METRICS_TOKEN && auth !== `Bearer ${METRICS_TOKEN}`) {
    return res.status(401).send("Unauthorized")
  }

  res.set("Content-Type", register.contentType)
  res.end(await register.metrics())
})

// ─────────────────────────────────────────────
// SINGLE HTTP SERVER (RENDER DEFAULT PORT)
// ─────────────────────────────────────────────
const httpServer = http.createServer(app)

httpServer.listen(PORT, () => {
  console.log(`🌐 Server running on Render port ${PORT}`)
})

// ─────────────────────────────────────────────
// HOCUSPOCUS (ATTACHED TO SAME SERVER)
// ─────────────────────────────────────────────
new HocuspocusServer({
  server: httpServer,

  extensions: [
    new HocusRedis({ redis }),
  ],

  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      return cb(new Error("WS origin blocked"))
    },
    credentials: true,
  },

  async onConnect() {
    activeConnectionsGauge.inc()
  },

  async onDisconnect() {
    activeConnectionsGauge.dec()
  },
})

console.log("🚀 Hocuspocus attached to Render server")
