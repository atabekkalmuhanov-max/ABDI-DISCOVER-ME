# Setup Guide — Discover Me

## Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or pnpm

---

## 1. Clone & Install

```bash
git clone <repo-url> discover-me
cd discover-me

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

## 2. Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE discover_me;"

# Run schema
psql -U postgres -d discover_me -f database/schema.sql

# Seed sample data
psql -U postgres -d discover_me -f database/seeds/destinations.sql
```

---

## 3. Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials and a strong `JWT_SECRET`.

---

## 4. Run Development Servers

**Backend** (http://localhost:5000)
```bash
cd backend
npm run dev
```

**Frontend** (http://localhost:5173)
```bash
cd frontend
npm run dev
```

---

## 5. Build for Production

```bash
cd frontend
npm run build        # outputs to frontend/dist/

cd ../backend
npm start
```

Serve the `frontend/dist/` folder via Express static or a CDN.

---

## Environment Variables Reference

| Variable        | Description                     | Default               |
|-----------------|---------------------------------|-----------------------|
| `PORT`          | Backend server port             | `5000`                |
| `DB_HOST`       | PostgreSQL host                 | `localhost`           |
| `DB_PORT`       | PostgreSQL port                 | `5432`                |
| `DB_NAME`       | Database name                   | `discover_me`         |
| `DB_USER`       | Database user                   | `postgres`            |
| `DB_PASSWORD`   | Database password               | —                     |
| `JWT_SECRET`    | JWT signing secret              | —                     |
| `JWT_EXPIRES_IN`| Token expiry                    | `7d`                  |
| `CLIENT_URL`    | Frontend origin (for CORS)      | `http://localhost:5173`|
