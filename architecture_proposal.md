# 🏟️ BSCCA App: High-Performance Hybrid Architecture

This document outlines the proposed modern architecture for the **BSCCA Platform**, combining the best-in-class free-tier services to achieve a professional, real-time, and globally scalable application.

---

## 🏗️ The Tech Stack

| Component | Technology | Hosting Provider | Why? |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Next.js 16 (React 19)** | **Vercel** | Industry-standard for speed, SEO, and edge performance. |
| **Backend** | **Rust (Axum)** | **Hugging Face Spaces** | High-performance Rust binary on a free 16GB RAM CPU tier. |
| **Database** | **Turso (LibSQL)** | **Turso Edge** | Best for real-time scores (SSE) and structured data. |
| **Storage** | **HF Hub (Datasets)** | **Hugging Face Hub** | 100GB+ free private storage with Global CloudFront CDN. |

---

## 🔄 Core Workflows

### 1. The "Guru" Real-time Data Flow
For live scores and match updates, we prioritize **latency**:
- **Source**: Admin updates score on the device.
- **Process**: Rust backend (Axum) writes to **Turso DB** and immediately broadcasts via **Server-Sent Events (SSE)**.
- **Result**: Global users see the score change in < 500ms without refreshing.

### 2. High-Capacity Media Storage
For player photos and match highlights (Videos), we avoid bloating the database:
- **Upload**: User uploads a 1080p video or high-res photo.
- **Handshake**: Rust backend streams the file to a **Private Hugging Face Dataset**.
- **Reference**: The backend saves only the **CDN URL** in Turso.
- **Delivery**: Files are served via CloudFront (HF Edge) for instant worldwide loading.

---

## 🛠️ Infrastructure Strategy

### ⚡ Persistent Hosting (Anti-Sleep)
Since Hugging Face Spaces (Free) go to sleep after inactivity:
- **Solution**: We will use **Uptime Robot** (or a similar health-check service) to ping the backend API every 5 minutes.
- **Benefit**: Ensures the Space stays "Awake" 24/7 for zero cold starts.

### 🛡️ Security Model
- **API Security**: Mutation routes (Create/Delete/Update) are protected by an `X-API-Key` header.
- **Data Safety**: Historical scorecard data is preserved via "Name Snapshots," ensuring that even if a player is deleted, their contribution to a past match remains in the history.

---

## 💰 Cost Benefit Analysis
By using this hybrid model:
- **Total Hosting Cost**: $0.00 / month.
- **Storage Capability**: 100GB+ (Private) / Unlimited (Public).
- **Scalability**: Can handle thousands of concurrent users during live matches.

---

## 🚀 Future Scalability
If the platform grows to millions of users, this architecture can be upgraded linearly:
- **Vercel Pro**: For more bandwidth.
- **HF GPU Tiers**: For AI-powered video highlight generation.
- **Turso Scaler**: For increased DB read/write limits.

> [!TIP]
> This "Guru" architecture ensures that the BSCCA app isn't just a simple website, but a robust enterprise-ready platform.
