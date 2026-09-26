# 🐳 Docker Deployment Guide for Student Management System Frontend

This guide explains how to build, run, and test the production-ready Docker container for the Student Management System React frontend.

---

## 🚀 Quick Start (Production Image)

### 1. Build the Docker Image
```bash
docker build -t sms-frontend:latest .
```

### 2. Run the Container
```bash
docker run -d \
  --name sms-frontend \
  -p 3000:80 \
  --restart unless-stopped \
  sms-frontend:latest
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

### 3. Check Health & Logs
```bash
# Check container status and health
docker ps -f name=sms-frontend

# View live Nginx access/error logs
docker logs -f sms-frontend

# Test healthcheck endpoint directly
curl -i http://localhost:3000/healthz
```

---

## ⚡ Using Docker Compose

To start the frontend container in one command:

```bash
docker compose up -d --build
```

To stop:
```bash
docker compose down
```

---

## ⚙️ Architecture & Features

- **Multi-Stage Build:**
  - **Stage 1 (Node 20 Alpine):** Installs packages and runs `npm run build` with Vite.
  - **Stage 2 (Nginx 1.27 Alpine):** Only packages the compiled static assets into an ultra-lean (<30MB) Nginx container.
- **SPA Client-Side Routing:** Custom `nginx.conf` with `try_files $uri $uri/ /index.html;` ensures page reloads on deep routes don't return 404 errors.
- **High Performance Caching:** 1-year immutable cache header on `/assets/*` and strict `no-cache` on `index.html`.
- **Gzip Compression:** Pre-configured for text, html, css, js, json, svg, and fonts.
- **Security Hardening:** Includes `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`.
- **Healthcheck:** Automatic container health monitoring via `/healthz`.
