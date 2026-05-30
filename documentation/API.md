# API Reference — Discover Me

Base URL: `http://localhost:5000/api`

All protected endpoints require:
```
Authorization: Bearer <token>
```

---

## Auth

### POST /auth/register
Register a new user.

**Body**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```
**Response** `201`
```json
{ "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "user" }, "token": "..." }
```

---

### POST /auth/login
**Body**
```json
{ "email": "jane@example.com", "password": "secret123" }
```
**Response** `200`
```json
{ "user": {...}, "token": "..." }
```

---

### GET /auth/me 🔒
Returns the authenticated user's profile.

---

## Destinations

### GET /destinations
Query params: `search`, `category`, `featured`, `limit`, `offset`

**Response** `200`
```json
{ "destinations": [...], "total": 42 }
```

---

### GET /destinations/:id
**Response** `200` — single destination with `rating` and `review_count`.

---

### POST /destinations 🔒 (admin)
**Body**
```json
{
  "name": "Santorini",
  "country": "Greece",
  "description": "...",
  "image_url": "https://...",
  "category": "Beach",
  "best_season": "Spring",
  "price_level": 3,
  "featured": true
}
```

---

### PUT /destinations/:id 🔒 (admin)
Same body as POST.

---

### DELETE /destinations/:id 🔒 (admin)
**Response** `204`

---

## Reviews

### GET /reviews/destination/:destinationId
Returns all reviews for a destination.

---

### POST /reviews 🔒
**Body**
```json
{ "destination_id": 1, "rating": 4.5, "comment": "Amazing place!" }
```
**Response** `201`

---

### DELETE /reviews/:id 🔒
Only the review author can delete their own review.
**Response** `204`

---

## Health Check

### GET /health
```json
{ "status": "ok", "timestamp": "2026-05-29T10:00:00.000Z" }
```
