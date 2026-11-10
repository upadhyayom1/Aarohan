# Aarohan — Production Docker Deployment Guide

This guide details how to deploy the Aarohan platform into production using Docker and Docker Compose.

---

## 1. System Architecture Overview

The production deployment consists of four containerized services orchestrated by Docker Compose:

```
                      Internet Traffic (HTTPS :443 / HTTP :80)
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    aarohan_nginx (Gateway)    │
                      │  - Gzip compression          │
                      │  - 20MB file upload limit     │
                      │  - Unified routing (No CORS)  │
                      └───────┬───────┬───────┬───────┘
                              │       │       │
          ┌───────────────────┘       │       └───────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  aarohan_client  │        │  aarohan_server  │        │    aarohan_ai    │
│  React 19 SPA    │        │  Node.js Express │        │  Python FastAPI  │
│  Static Nginx    │        │  Port 8000       │        │  Port 8001       │
└──────────────────┘        └─────────┬────────┘        └─────────┬────────┘
                                      │                           │
                                      ▼                           ▼
                               ┌─────────────────────────────────────────┐
                               │       resume_uploads (Shared Volume)     │
                               │   Server: Read/Write   AI: Read-Only    │
                               └─────────────────────────────────────────┘
                                      │                           │
                                      └─────────────┬─────────────┘
                                                    │
                                                    ▼
                                      ┌───────────────────────────┐
                                      │    PostgreSQL Database    │
                                      │  (Neon / AWS RDS / Cloud) │
                                      └───────────────────────────┘
```

---

## 2. Prerequisites

1. **A Cloud Server / VPS**:
   - Minimum: 2 vCPU, 4GB RAM, 20GB SSD (e.g. AWS EC2 `t3.medium`, DigitalOcean Droplet $24/mo, Hetzner CX22 €4/mo, or GCP `e2-medium`).
   - OS: Ubuntu 22.04 LTS or Ubuntu 24.04 LTS.
2. **A Registered Domain Name** (e.g., `aarohan.youruniversity.edu` or `aarohan.example.com`).
3. **Managed PostgreSQL Database**:
   - Recommended: Neon DB (Serverless PostgreSQL with connection pooling), Supabase, or AWS RDS.
4. **Google Gemini API Key**:
   - For resume parsing and intelligent ATS matching.

---

## 3. Step-by-Step VPS Deployment (AWS, DigitalOcean, Hetzner, GCP)

### Step 3.1: Connect to Your Server

```bash
ssh ubuntu@YOUR_SERVER_IP
```

### Step 3.2: Install Docker Engine and Docker Compose

Run the official Docker convenience script:

```bash
# Update package index
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Add current user to docker group (avoids typing sudo for docker commands)
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Verify Docker installation
docker --version
docker compose version
```

### Step 3.3: Configure Server Firewall

Allow SSH, HTTP, and HTTPS traffic:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Step 3.4: Clone Repository & Setup Environment

```bash
# Clone the repository
git clone https://github.com/upadhyayom1/Aarohan.git /opt/aarohan
cd /opt/aarohan

# Copy production environment template
cp .env.example .env
```

Edit `.env` with your production values:

```bash
nano .env
```

Ensure the following variables are configured:

```ini
# Production Environment Configuration
NODE_ENV=production
DATABASE_URL="postgresql://user:password@ep-your-db-pooler.neon.tech/neondb?sslmode=require"
JWT_SECRET="generate_a_secure_random_64_character_secret_key"
GEMINI_API_KEY="your-production-gemini-api-key"
CLIENT_URL="https://yourdomain.com"
```

> **Security Tip**: Generate a cryptographically secure 64-character JWT secret using:
> ```bash
> openssl rand -hex 32
> ```

### Step 3.5: Run Database Migrations and Seed

Before starting the application, synchronize the database schema:

```bash
# Generate Prisma Client & push schema to PostgreSQL
docker compose run --rm server npx prisma db push

# (Optional) Seed initial demo & governance data
docker compose run --rm server node prisma/seed.js
```

### Step 3.6: Build and Launch Containers

```bash
# Build and start all services in detached mode
docker compose up --build -d
```

Check running container status:

```bash
docker compose ps
```

Verify service logs:

```bash
docker compose logs -f
```

---

## 4. Configuring Domain Name & SSL / HTTPS (Let's Encrypt)

To secure traffic with free, auto-renewing SSL certificates:

### Method A: Host-Level Nginx Reverse Proxy (Recommended for Simplicity)

Install Certbot and Nginx directly on the Ubuntu host:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Configure `/etc/nginx/sites-available/aarohan`:

```nginx
server {
    server_name aarohan.yourdomain.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 120s;
        proxy_connect_timeout 60s;
    }
}
```

Enable the site and obtain the SSL certificate:

```bash
# In docker-compose.yml, change nginx port mapping to:
# ports:
#   - "127.0.0.1:8080:80"
# (Then update proxy_pass http://127.0.0.1:8080; in the host nginx config)

sudo ln -s /etc/nginx/sites-available/aarohan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Issue Let's Encrypt SSL certificate
sudo certbot --nginx -d aarohan.yourdomain.com
```

Certbot automatically configures auto-renewal via systemd timers.

---

## 5. Automated CI/CD Deployment with GitHub Actions

You can automate deployment whenever changes are pushed to `main`.

Add these secrets in **GitHub Repository → Settings → Secrets and variables → Actions**:
- `SSH_HOST`: Your server IP address
- `SSH_USER`: `ubuntu`
- `SSH_PRIVATE_KEY`: Your server's private SSH key

A pre-configured GitHub Actions workflow is provided at `.github/workflows/ci-cd.yml`:
1. Runs automated tests (React lint/tests, Express 56-test suite, FastAPI pytest suite).
2. SSHs into your server and executes:
   ```bash
   cd /opt/aarohan
   git pull origin main
   docker compose up --build -d
   ```

---

## 6. Maintenance & Operational Runbook

### Updating to the Latest Version

```bash
cd /opt/aarohan
git pull origin main
docker compose up --build -d
```

### Viewing Real-Time Logs

```bash
# All containers
docker compose logs -f

# Specific container
docker compose logs -f server
docker compose logs -f ai
docker compose logs -f nginx
```

### Backing Up Uploaded Resumes

Uploaded candidate resumes are stored in the persistent Docker volume `resume_uploads`. To back them up:

```bash
docker run --rm \
  -v aarohan_resume_uploads:/data \
  -v $(pwd):/backup \
  alpine tar -czvf /backup/resumes_backup_$(date +%Y%m%d).tar.gz -C /data .
```

### Restoring Uploaded Resumes

```bash
docker run --rm \
  -v aarohan_resume_uploads:/data \
  -v $(pwd):/backup \
  alpine tar -xzvf /backup/resumes_backup_YYYYMMDD.tar.gz -C /data
```

### Stopping or Restarting Services

```bash
# Graceful shutdown
docker compose down

# Restart
docker compose restart
```
