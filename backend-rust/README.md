---
title: BSCCA App Backend
emoji: 🏏
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# BSCCA App Backend

Rust-based backend for the Beltala Supreme Council of Cricket Authority (BSCCA) application.

## Tech Stack
- **Languages**: Rust
- **Framework**: Axum (web server)
- **Database**: Turso (LibSQL/SQLite)
- **Hosting**: Hugging Face Spaces (Docker)

## Deployment Instructions

### 1. Hugging Face Space (Backend)
Ensure the following **Secrets** are set in your Hugging Face Space settings:
- `TURSO_DATABASE_URL`: `libsql://bscca-db-1-bscca-db-1.aws-ap-south-1.turso.io`
- `TURSO_AUTH_TOKEN`: (Your Turso API Token)
- `PORT`: `7860`

### 2. Vercel (Frontend)
Ensure the following **Environment Variables** are set in Vercel:
- `NEXT_PUBLIC_API_URL`: `https://bscca-platform-bscca-app-backend.hf.space/api`
- `NEXT_PUBLIC_ADMIN_API_KEY`: `bscca-secret-786` (Default used in logic)

## Manual Database Management
We have included utility scripts in `src/bin/` to manage the database remotely:

### Apply Schema
```bash
cargo run --bin setup_db
```

### Seed Initial Data
```bash
cargo run --bin seed_db
```

### Check Tables
```bash
cargo run --bin check_db
```

## Troubleshooting
If you see a `500 Internal Server Error` in the frontend logs:
1. Check the Hugging Face Space "Logs" tab.
2. We have added `tracing` logs to `handlers.rs` to show the exact database error.
3. Ensure the `seed_db` script has been run at least once to populate the database.
