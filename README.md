# 🍒 CherryReddit

A full-stack Reddit-style community platform with a custom, premium "editorial candy" visual identity — cream paper backgrounds, scalloped dividers, graph-paper texture, and floating cherry illustrations. Same core mechanics as Reddit (communities, nested comments, voting, karma, moderation), entirely original look.

**Stack:** React (Vite) · Express.js · MongoDB/Mongoose · JWT Auth · Cloudinary · Framer Motion · React Router · Axios

---

## ✨ Features

- Email/username + password auth (JWT)
- Communities (create, join/leave, moderators, rules, theming)
- Text / image / link posts with Cloudinary uploads
- Nested/threaded comments (materialized-path storage, unlimited depth)
- Upvote/downvote with optimistic UI, on posts and comments
- Karma system (separate post/comment karma)
- Saved posts
- Global search (posts, communities, users)
- Notifications (replies, upvotes) with unread badge
- User profiles (posts, comments, karma, bio, avatar/banner)
- Infinite scroll feeds (cursor-based pagination)
- Hot / New / Top / Trending sorting (Reddit-style hot-rank algorithm)
- Moderation tools (remove/restore/pin/lock posts, remove comments, add moderators)
- Reports queue + Admin dashboard (site stats, user roles, bans)
- Fully responsive layout
- Rate limiting, input sanitization, centralized error handling

---

## 📁 Project structure

```
cherryreddit/
├── server/                 # Express API
│   ├── config/              # db.js, cloudinary.js
│   ├── models/               # User, Community, Post, Comment, Notification, Report
│   ├── controllers/          # business logic per resource
│   ├── routes/               # route definitions
│   ├── middleware/            # auth, error handler, upload (multer)
│   ├── utils/                # ApiError, catchAsync, karma, voting, seed script
│   └── server.js
├── client/                 # React (Vite) SPA
│   └── src/
│       ├── api/               # axios instance + endpoint modules
│       ├── context/           # AuthContext
│       ├── components/        # Navbar, Sidebar, PostCard, CommentThread, VoteButtons...
│       ├── pages/              # Home, CommunityPage, PostDetail, Profile, Admin...
│       ├── hooks/              # useInfiniteScroll
│       └── styles/global.css   # design tokens (colors, scallop dividers, graph paper)
├── docker-compose.yml       # one-command local stack (mongo + api + client)
├── render.yaml              # Render.com blueprint for the API
└── .github/workflows/ci.yml # build/syntax check on push
```

---

## 🚀 Local development

**Prerequisites:** Node.js 20+, a MongoDB instance (local or Atlas), a free [Cloudinary](https://cloudinary.com) account (for image uploads).

### 1. Clone and configure

```bash
git clone https://github.com/<your-username>/cherryreddit.git
cd cherryreddit
```

### 2. Backend

```bash
cd server
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* keys
npm install
npm run dev               # starts on http://localhost:5000
```

Optional demo data:
```bash
npm run seed
# Seeds two communities and a few posts/comments.
# Login: alice@cherryreddit.dev / password123
# Admin login: admin@cherryreddit.dev / password123
```

### 3. Frontend

```bash
cd client
npm install
npm run dev                # starts on http://localhost:5173, proxies /api to :5000
```

Open **http://localhost:5173**.

---

## 🐳 One-command local run (Docker)

If you'd rather not install Node/Mongo locally:

```bash
cp server/.env.example .env   # only CLOUDINARY_* and JWT_SECRET are used by compose
docker compose up --build
```

This starts MongoDB, the API (port 5000), and the built frontend behind nginx (port 80) — visit **http://localhost**.

---

## ☁️ Deploying for real (recommended path)

GitHub itself only hosts static files (via GitHub Pages), so a MERN app needs the API deployed somewhere that runs Node + connects to MongoDB. The easiest free-tier combo:

| Piece | Where | Notes |
|---|---|---|
| Backend (Express API) | [Render](https://render.com) | `render.yaml` in this repo is a ready-made blueprint — Render detects it automatically when you create a "Blueprint" from your GitHub repo. |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) free tier | Paste the connection string into Render's `MONGO_URI` env var. |
| Frontend | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) | Import the repo, set root directory to `client`, add `VITE_API_URL=https://<your-render-app>.onrender.com/api`. |
| Image uploads | [Cloudinary](https://cloudinary.com) free tier | Add the three `CLOUDINARY_*` keys to the backend's env vars. |

## 🎨 Design system

| Token | Hex | Use |
|---|---|---|
| Cream | `#F9F5EF` | Page background (with subtle graph-paper grid) |
| Soft pink | `#F7D6E6` | Chips, secondary buttons, hover states |
| Rose | `#EAA6C8` | Accents, active states, scrollbar |
| Burgundy | `#6F1D2A` | Headings, primary text on light chips |
| Cherry red | `#D73A49` | Primary actions, upvote highlight |
| Dark brown | `#43332F` | Body text |

Headings use **Fraunces** (vintage editorial serif); body text uses **Nunito** (rounded modern sans). Scalloped dividers are pure CSS (radial-gradient mask), no image assets required.

---

## 🔐 Security notes

- Passwords hashed with bcrypt (10 rounds)
- JWT auth, 7-day expiry by default
- `express-mongo-sanitize` strips Mongo operator injection from input
- `express-rate-limit` on all `/api` routes, stricter on auth routes
- `helmet` for standard security headers
- Ownership/role checks enforced server-side on every mutating route (post/comment edit & delete, moderation actions, admin actions)

- 
## License

MIT — see [LICENSE](./LICENSE).
