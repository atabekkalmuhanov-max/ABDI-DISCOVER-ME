# Architecture — Discover Me

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                      │
│         React + Vite  ·  Tailwind  ·  Zustand           │
└──────────────────────────┬──────────────────────────────┘
                           │  HTTP / REST  (proxy: /api)
┌──────────────────────────▼──────────────────────────────┐
│                     NODE.JS / EXPRESS                    │
│   Helmet · CORS · Rate-limit · JWT · express-validator  │
│   Routes → Controllers → Models                         │
└──────────────────────────┬──────────────────────────────┘
                           │  pg (node-postgres)
┌──────────────────────────▼──────────────────────────────┐
│                      POSTGRESQL                          │
│   users · destinations · reviews · saved_destinations   │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

```
src/
├── components/
│   ├── layout/       # Navbar, Footer (page chrome)
│   ├── common/       # Reusable domain components (Card, SearchBar, PrivateRoute)
│   └── ui/           # Pure presentational primitives (Spinner, Badge...)
├── pages/            # One file per route
├── services/api.js   # Axios client + all endpoint functions
├── store/authStore.js# Zustand auth state (persisted to localStorage)
├── hooks/            # Custom React hooks
└── utils/constants.js
```

**Key decisions:**
- React Query handles server cache (staleTime 5 min, auto-refetch on window focus)
- Zustand persists auth token/user; Axios interceptor reads it automatically
- Vite dev proxy forwards `/api/*` to the backend, avoiding CORS in dev

---

## Backend Architecture

```
src/
├── app.js        # Express app setup (middleware stack, routes)
├── server.js     # Entry point — DB ping then listen
├── controllers/  # Request/response handling only
├── models/       # All SQL queries (thin Data-Access layer)
├── routes/       # Express routers + input validation rules
├── middleware/
│   ├── auth.js         # JWT verification & role check
│   ├── errorHandler.js # Centralised error → HTTP response
│   └── validate.js     # express-validator result check
└── utils/db.js   # pg Pool singleton
```

**Key decisions:**
- No ORM — raw `pg` queries for simplicity and performance
- Centralised error handler converts DB error codes (e.g. 23505 → 409)
- Rate limiting (100 req / 15 min per IP) applied to all `/api` routes

---

## Database Schema

```
users ──────────< reviews >────────── destinations
                                           ▲
users ──────────< saved_destinations >─────┘
```

- `reviews` has a `UNIQUE(destination_id, user_id)` constraint (one review per user per place)
- `saved_destinations` acts as a many-to-many join for wishlists
- `destinations.featured` flag drives the homepage featured grid
