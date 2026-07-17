# EstateHub — MERN Real Estate Marketplace

EstateHub is a modern, full-stack real estate marketplace built on the MERN stack (MongoDB, Express, React, Node.js) with Tailwind CSS. It supports full user authentication, property listing CRUD, map-based location pinning, multi-currency pricing, and advanced search — all wrapped in a clean, responsive UI.

---

## 🌟 Features

### 🔐 Authentication
- Secure signup and signin with hashed passwords (bcrypt) and JWT stored in HTTP-only cookies.
- Persistent client-side session via Redux Toolkit + local storage.
- Protected routes for Profile, Create Listing, and Update Listing.
- Signout endpoint that clears the auth cookie.

### 🏠 Property Listing CRUD
- **Create** — add a listing with full details, images, and a pinned map location.
- **Read (single)** — dedicated listing page with an image gallery, specs, and map.
- **Read (all / search)** — paginated, filterable, sortable listing feed.
- **Update** — owner-only editing, including re-pinning the location.
- **Delete** — owner-only deletion.

### 🗺️ Map & Location (OpenStreetMap + Leaflet)
- Every listing stores `country`, `state`, `city`, `latitude`, and `longitude`.
- When creating or editing a listing, click **Locate** next to the address to geocode it automatically (free, no API key — powered by [OpenStreetMap Nominatim](https://nominatim.org/)).
- Drag the marker on the map to fine-tune the exact pin; the city/state/country auto-update via reverse geocoding.
- The listing details page renders an interactive Leaflet map with a marker, the full address, and raw coordinates.

### 💱 Multi-Currency Display
- A country selector in the header converts all displayed prices into the local currency using live exchange rates (cached for 12 hours, with an offline fallback).

### 👥 Profile & Account
- Update username, email, password, and avatar.
- Delete account (cascades to delete that user's listings).
- View, edit, and delete your own listings from one dashboard.

### 🔍 Search & Filtering
- Full-text search across title, description, address, city, state, and country.
- Filters: rent/sale, parking, furnished, special offer — all combinable.
- Sort by newest, oldest, price low→high, or price high→low.
- "Show More" pagination on both the Home page and Search results.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 (Vite), Tailwind CSS v4, Redux Toolkit, React Router DOM, Axios, React Icons, Leaflet.
- **Backend**: Node.js, Express 5, JWT, bcryptjs, cookie-parser, Mongoose.
- **Database**: MongoDB (MongoDB Atlas or local).
- **Geocoding**: OpenStreetMap Nominatim (free, no key required).

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ installed.
- A MongoDB Atlas cluster (or a local MongoDB instance).

### 1. Install dependencies
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure environment variables

**`server/.env`** (see `server/.env.example`):
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
NODE_ENV=development
```

**`client/.env`** (see `client/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ **Security note:** `.env` files hold real credentials and are already excluded via `.gitignore`. Never commit them. If you're reusing credentials that were ever shared, pasted, or reviewed by anyone else (including in a chat or AI tool), rotate the database password and `JWT_SECRET` before treating them as private again.

### 3. Seed sample data (optional but recommended)
Populates the database with 10 realistic properties (different cities, prices, specs, and images) plus a seed user (`seed@example.com` / `password123`):
```bash
cd server
node seed.js
```

---

## 🚀 Running Locally

**Backend** (http://localhost:5000):
```bash
cd server
npm run dev
```

**Frontend** (http://localhost:5173):
```bash
cd client
npm run dev
```

Open `http://localhost:5173` in your browser once both are running.

---

## ☁️ Deployment

### Backend (Render / Railway / any Node host)
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL=<your deployed frontend URL>`, `PORT`.

### Frontend (Vercel / Netlify)
- Root directory: `client`
- Framework preset: Vite
- Environment variable: `VITE_API_URL=<your deployed backend URL>/api`

---

## 🗂️ Project Structure

```
DevWeekends-Estate-project/
├── client/                      # React frontend (Vite)
│   └── src/
│       ├── components/          # Header, AuthForm, ListingCard, Map, PrivateRoute
│       ├── layouts/              # MainLayout (header + footer shell)
│       ├── pages/                 # Home, Search, Listing, Profile, CreateListing, UpdateListing, SignIn, SignUp, About
│       ├── redux/                 # Redux Toolkit store, auth + marketplace slices
│       ├── services/api.js        # Axios instance
│       └── utils/                 # currency.js, geocode.js
├── server/                      # Express backend
│   ├── config/db.js               # MongoDB connection
│   ├── controllers/               # auth, user, listing controllers
│   ├── middleware/                # JWT verification, error handler
│   ├── models/                    # User, Listing (Mongoose schemas)
│   ├── routes/                    # /api/auth, /api/user, /api/listing
│   ├── utils/error.js             # createError helper
│   ├── seed.js                    # Sample data seeder
│   └── server.js / app.js         # Entry point / Express app
└── README.md
```

---

## 📸 Screenshots

_Add screenshots here after running the app locally, e.g.:_

| Home | Listing Details | Create Listing |
|------|------------------|----------------|
| `screenshots/home.png` | `screenshots/listing.png` | `screenshots/create-listing.png` |

---

## 🔭 Future Improvements

- Image upload (Cloudinary/S3) instead of pasted image URLs.
- Favorites/saved listings for logged-in users.
- Real-time chat between buyer and seller instead of `mailto:` links.
- Server-side pagination cursor instead of skip/limit for large datasets.
- Automated tests (Vitest for the client, `node --test` for the server).

---

## ✅ Submission Checklist

- [x] Full auth flow with JWT in HTTP-only cookies.
- [x] Protected routes for profile, create-listing, update-listing.
- [x] Full CRUD on the Listing model with ownership checks.
- [x] Map-based location picking with free geocoding (OpenStreetMap Nominatim + Leaflet).
- [x] Home page with recent offers, rents, and sales (with loading and empty states).
- [x] Search page with text search, filters, and sorting.
- [x] Profile page with update/delete account and listing management.
- [x] Responsive header with search, country/currency selector, and mobile menu.
- [x] `.env.example` provided for both `client/` and `server/`.
- [x] Centralized error handling middleware.
- [x] 10 realistic, diverse seed listings with unique Unsplash images.
