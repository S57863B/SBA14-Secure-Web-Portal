# Secure Web Portal — Innovate Inc.

A secure REST API built with Express, MongoDB, and JWT authentication. Supports local email/password login and GitHub OAuth 2.0.

---

## Tech Stack

- **Express** — web framework
- **MongoDB Atlas + Mongoose** — database
- **bcrypt** — password hashing
- **JWT** — stateless authentication
- **Passport + passport-github2** — GitHub OAuth 2.0

---

## Project Structure

```
├── config/
│   ├── db.js          # MongoDB connection
│   └── passport.js    # GitHub OAuth strategy
├── models/
│   ├── User.js        # User schema (local + GitHub)
│   └── Bookmark.js    # Bookmark schema
├── routes/
│   ├── users.js       # Auth routes
│   └── bookmarks.js   # Bookmark CRUD routes
├── utils/
│   └── auth.js        # JWT utilities + authMiddleware
└── index.js           # App entry point
```

---

## Setup

1. Clone the repo and install dependencies:
```bash
npm install
```

2. Create your `.env` file:
```bash
cp .env.example .env
```

3. Fill in your values:
```
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_jwt_secret
PORT=3000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/users/auth/github/callback
```

4. Start the server:
```bash
npm start
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/register` | Register with email/password | No |
| POST | `/api/users/login` | Login with email/password | No |
| GET | `/api/users/auth/github` | Login with GitHub | No |
| GET | `/api/users/auth/github/callback` | GitHub OAuth callback | No |

### Bookmarks
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bookmarks` | Create a bookmark | Yes |
| GET | `/api/bookmarks` | Get all my bookmarks | Yes |
| GET | `/api/bookmarks/:id` | Get one bookmark | Yes |
| PUT | `/api/bookmarks/:id` | Update a bookmark | Yes |
| DELETE | `/api/bookmarks/:id` | Delete a bookmark | Yes |

---

## Authentication

All bookmark endpoints require a JWT in the Authorization header:
```
Authorization: Bearer <your_token>
```

Get a token by registering or logging in.

---

## Security

- Passwords are hashed with bcrypt (12 salt rounds)
- JWTs expire after 7 days
- Users can only access their own bookmarks
- Login returns identical error messages for wrong email and wrong password (prevents user enumeration)