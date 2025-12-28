# SyncDraft  
### Real-time collaboration, without conflict

[![Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://syncdraft.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Issues](https://img.shields.io/github/issues/Sachin1395/Distributed-Collaborative-Editor)](https://github.com/Sachin1395/Distributed-Collaborative-Editor/issues)

![SyncDraft Launch](./branding/launch_poster.png)

🔗 **Live Demo:** https://syncdraft.vercel.app/  
👉 Open the same document in two tabs to see real-time collaboration.

---

## Contribute

We welcome contributors of all levels! If you'd like to help, please read [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started, our workflow, and a list of issues suitable for beginners. Look for issues labeled `good first issue` or `help wanted`.

---

## 📑 Table of Contents
- What is SyncDraft?
- Features
- Architecture Overview
- Tech Stack
- Live Demo
- Quick Start (Local Development)
- Environment Configuration
- Running Locally
- Metrics
- UI Preview
- Troubleshooting
- Security Notes
- Contributing
- Roadmap
- License

---

## 🧠 What is SyncDraft?

SyncDraft is an open-source, CRDT-powered collaborative editor inspired by tools like Google Docs — built to be offline-first, conflict-free, and horizontally scalable.

SyncDraft uses Yjs as the CRDT engine to guarantee:
- No overwriting of edits  
- Automatic document convergence  
- Seamless collaboration even on unstable networks

This project is intended as a production-minded reference implementation for real-time collaborative systems.

---

## ✨ Features

- Real-time collaborative editing using Yjs
- Conflict-free merging (CRDTs — no locks, no last-write-wins)
- Offline-first editing with automatic resynchronization (via Yjs)
- Multi-user presence & cursor awareness
- (Planned) Version snapshots & document history using Yjs snapshot APIs
- Authentication integration with Supabase
- Horizontally scalable WebSocket backend (Hocuspocus + Redis)
- Prometheus-compatible metrics endpoint

Note: Some higher-level features (persistent, long-term document history / snapshots and fine-grained permissions) are mentioned as planned — see Roadmap for details.

---

## 🏗 Architecture Overview

Frontend (React + TipTap)
        ↓
Yjs CRDT Document State
        ↓
Hocuspocus WebSocket Server
        ↓
Redis (Awareness + Horizontal Scaling / Upstash)
        ↓
Supabase (Auth & Metadata — optional persistence)

### Key Components
- Yjs — Shared document state and conflict resolution
- TipTap — Editor layer (ProseMirror-based)
- Hocuspocus — Collaborative WebSocket sessions (backend)
- Redis / Upstash — Awareness + horizontal scaling support
- Supabase — Authentication & optional metadata persistence
- prom-client — Metrics for Prometheus

---

## 🧰 Tech Stack

### Frontend
- React (Create React App)
- TipTap
- Yjs
- Supabase JS client

### Backend
- Node.js (ESM)
- @hocuspocus/server (Hocuspocus)
- @hocuspocus/extension-redis
- ioredis / Upstash compatible settings
- prom-client (Prometheus metrics)

### Infrastructure / Hosting
- Supabase (Auth & Database)
- Vercel (Frontend hosting)
- Render (Backend hosting) — optional example

---

## 🌍 Live Demo

👉 https://syncdraft.vercel.app/

Try this:
1. Create a document (via demo UI)
2. Open the same document in two tabs or browsers
3. Watch edits sync in real time — conflict-free

(If the demo is down, feel free to run locally — instructions below.)

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (recommended)
- npm 9+
- Redis instance (Upstash or other Redis with TLS)
- Supabase project (optional for auth functionality)

Project structure of interest:
- server/ — Hocuspocus backend
- syncraft/ — React frontend

### Clone the repository
```bash
git clone https://github.com/Sachin1395/Distributed-Collaborative-Editor.git
cd Distributed-Collaborative-Editor
```

### Install dependencies
Open two terminals or use a multiplexer:

Terminal A — backend:
```bash
cd server
npm install
```

Terminal B — frontend:
```bash
cd syncraft
npm install
```

---

## 🔐 Environment Configuration

This repository uses per-package `.env.example` files. Copy and edit each `.env.example` into a `.env` file in the same directory.

- server/.env.example — backend settings
- syncraft/.env.example — frontend settings

Important: do not commit `.env` files or secrets.

Example (server/.env.example):
```env
# server/.env.example
PORT=1234
REDIS_URL=rediss://<token_or_credentials>@<host>:<port>   # Upstash or Redis Cloud (use TLS)
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>        # keep this secret and never expose to the browser
ALLOWED_ORIGINS=http://localhost:3000
METRICS_PORT=4000
METRICS_TOKEN=<optional-metrics-token>
```

Example (syncraft/.env.example — frontend uses Create React App ENV prefix):
```env
# syncraft/.env.example
REACT_APP_SUPABASE_URL=https://<project>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<public-anon-key>
REACT_APP_WS_URL=ws://localhost:1234
```

Notes:
- The frontend uses `REACT_APP_*` env variables because it is a Create React App project. Do NOT use `NEXT_PUBLIC_*` unless you migrate the frontend to Next.js.
- For Upstash, prefer `rediss://` (TLS). The backend code configures ioredis with TLS and `enableReadyCheck: false` for Upstash compatibility.

---

## ▶️ Running Locally

1) Start the backend (Hocuspocus server)
```bash
cd server
npm start
```
By default the server listens on port 1234 (WS and HTTP). If you set PORT in server/.env it will be used.

Accessible at:
- WebSocket: ws://localhost:1234
- HTTP: http://localhost:1234 (Hocuspocus itself is a WS server — see metrics below)

2) Start the frontend
```bash
cd syncraft
npm start
```
By default the React app runs at:
- http://localhost:3000

Make sure `REACT_APP_WS_URL` in `syncraft/.env` points to your backend WS URL (e.g. `ws://localhost:1234`).

---

## 📊 Metrics

The backend exposes a Prometheus-compatible metrics endpoint. Configure the following server env vars:

- METRICS_PORT (default in code: 4000)
- METRICS_TOKEN (optional) — if set, requests to /metrics must include `Authorization: Bearer <METRICS_TOKEN>`

Metrics endpoint example:
```
http://localhost:4000/metrics
```

The backend includes a gauge for active WebSocket connections (ws_active_connections) and also registers default process metrics.

---

## 🖥 UI Preview

![Editor Preview](./branding/Editor.jpeg)

---

## 🛠 Troubleshooting

- WebSocket not connecting
  - Ensure backend is running and `REACT_APP_WS_URL` points to the correct host and port (default ws://localhost:1234).
  - Check browser console for CORS/Origin errors; ensure `ALLOWED_ORIGINS` in server/.env contains your frontend origin (e.g. http://localhost:3000).

- Redis Errors
  - Upstash requires TLS — use a `rediss://` URL and the backend creates the Redis client with TLS enabled.
  - Ensure REDIS_URL is set in server/.env. The server will throw an error and exit if REDIS_URL is not provided.

- CORS / Origin blocked
  - The Hocuspocus server checks the `Origin` header and will reject connections not in ALLOWED_ORIGINS when that list is non-empty.

- Metrics unauthorized
  - If METRICS_TOKEN is set, requests to /metrics must include the header `Authorization: Bearer <METRICS_TOKEN>`.

---

## Security Notes

- Never expose the Supabase Service Role Key or any privileged keys to the browser or commit them to source control. SUPABASE_SERVICE_ROLE_KEY belongs in server/.env only.
- Keep `.env` files out of your repository (they are not included in this repo).
- Upstash / Redis credentials are sensitive — use access controls and rotation as needed.

---

## Persistence & Snapshots (Clarification)

- The project uses Hocuspocus + Redis for session state, awareness and horizontal scaling. Long-term document persistence (durable snapshots / database-stored history) is not yet fully implemented in this repository.
- Yjs supports snapshots and you can persist them to storage (S3, Postgres, etc.). If you need durable history, add a persistence extension to Hocuspocus or export Yjs snapshots to your DB in the backend.

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started and the Code of Conduct.

---

## 🗺 Roadmap

Planned / desirable improvements:
- Granular document permissions & ACLs
- Comments & suggestions mode (comment threads)
- Export to Word Document / PDF (frontend export presets)
- Improved offline persistence / background sync
- End-to-end encryption (E2EE) for document content
- Persistent snapshot storage & version history

---

## 📄 License

This project is licensed under the MIT License.  
See the `LICENSE` file for details.
