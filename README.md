![SyncDraft Launch](./branding/launch_poster.png)

# SyncDraft
### Real-time collaboration, without conflict

🔗 **Live Demo:** https://syncdraft.vercel.app/  
👉 Try the demo directly in your browser. Open the same document in two tabs to see real-time collaboration.

---

## 🧠 What is SyncDraft?

SyncDraft is an **open-source, CRDT-powered collaborative editor** inspired by tools like Google Docs, but built to be **offline-first**, **conflict-free**, and **scalable by design**.

Instead of relying on central locking or last-write-wins strategies, SyncDraft uses **Conflict-free Replicated Data Types (CRDTs)** to ensure that:
- edits never overwrite each other
- documents automatically converge across users
- collaboration works even with unstable or intermittent networks

This project was built to deeply understand how modern collaborative systems work under the hood — and shipped as a real, usable product.

---

## ✨ Features

- Real-time collaborative editing using **CRDTs (Yjs)**
- Conflict-free merging (no locks, no overwrites)
- Offline-first support with automatic resynchronization
- Multi-user presence & awareness
- Version snapshots & history
- Secure authentication via Supabase
- Horizontally scalable WebSocket backend
- Metrics-ready architecture (Prometheus-compatible)

---

## 🏗 Architecture Overview


- **Yjs** manages shared document state and conflict resolution  
- **Hocuspocus** handles collaborative WebSocket sessions  
- **Redis** enables horizontal scaling across server instances  
- **Supabase** provides authentication and persistent metadata  

---

## 🧰 Tech Stack

### Frontend
- React
- TipTap
- Yjs

### Backend
- Node.js
- Hocuspocus
- WebSockets
- Redis (Upstash)

### Infrastructure
- Supabase (Auth & Database)
- Vercel (Frontend hosting)
- Render (Backend hosting)

---

## 🌍 Deployment

- **Frontend:** Vercel  
- **Backend:** Render  
- **Redis:** Upstash  
- **Authentication & DB:** Supabase  

---

## 🧪 Try It Online

You don’t need to set anything up to try SyncDraft.

👉 **Live Demo:** https://syncdraft.vercel.app/

- Create a document
- Open it in two tabs or browsers
- See real-time collaboration in action

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js **18+**
- npm **9+**
- Redis instance (local or Upstash)
- Supabase project
- Updated env vars

---

### Clone the repository
```bash
git clone https://github.com/your-username/syncdraft.git
cd syncdraft
npm start

cd server
node custom_server


