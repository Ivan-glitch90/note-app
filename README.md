# Notes App

A full-stack note-taking application built with Node.js, Express, MongoDB (Mongoose), and a vanilla HTML/CSS/JavaScript front-end. Users sign in with Google, and can create, view, edit, and delete their own personal notes. Every route is protected — each user can only ever see or modify their own notes.

Built as part of the AI Software Development Bootcamp with Circuit Stream.

---

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** Passport.js with Google OAuth 2.0, `express-session`
- **Front-end:** Plain HTML, CSS, and JavaScript (Bootstrap 5 for styling), communicating with the back-end entirely through `fetch()` calls to a JSON API
- **Architecture:** MVC (Model–View–Controller) — models define the data shape, controllers hold the request-handling logic, routes map URLs to controllers

---

## Project Structure

```
note-app/
├── controllers/
│   └── noteControllers.js   # request-handling logic for every notes endpoint
├── models/
│   └── noteModel.js         # Mongoose schema for a Note
├── middleware/
│   └── requireLogin.js      # blocks unauthenticated requests
├── routes/
│   └── noteRoutes.js        # maps URLs/methods to controller functions
├── public/
│   ├── index.html           # the front-end page
│   ├── styles.css
│   └── script.js            # all front-end fetch/DOM logic
├── .env                     # local secrets (not committed)
├── .gitignore
├── index.js                 # app entry point: middleware, Passport, DB connection, server start
└── package.json
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Ivan-glitch90/note-app.git
cd note-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up MongoDB

Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas) (or use a local MongoDB instance), and get your connection string.

### 4. Set up Google OAuth credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project (or use an existing one).
3. Under **APIs & Services → OAuth consent screen**, configure the app as **External**, and add your own Google account under **Test users** (required while the app is in Testing mode).
4. Under **APIs & Services → Credentials**, create an **OAuth Client ID** of type **Web application**.
5. Add this exact Authorized redirect URI:
   ```
   http://localhost:3000/auth/google/callback
   ```
6. Copy the generated **Client ID** and **Client Secret**.

### 5. Create a `.env` file

In the project root, create a file named `.env` with the following:

```
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=any_long_random_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

`SESSION_SECRET` isn't provided by Google — it's any long, random string you choose, used internally to sign session cookies. You can generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Run the app

```bash
node index.js
```

Visit `http://localhost:3000` in your browser. Sign in with Google to start creating notes.

---

## Authentication

- Visiting `/auth/google` starts the Google sign-in flow.
- On success, Google redirects to `/auth/google/callback`, and the user is logged in via a session cookie.
- `/logout` ends the session.
- `GET /api/me` tells the front-end whether someone is currently logged in (and their email/name), so the static front-end can update its own UI accordingly — it does **not** require login itself, since it needs to answer truthfully in both the logged-in and logged-out case.
- Every route under `/api/notes/*` requires an active session. Unauthenticated requests receive a `401 Unauthorized`.
- The server always determines a note's `owner` from the authenticated session (`req.user`) — it is never taken from the request body or a URL parameter, preventing one user from creating, editing, or viewing notes under someone else's identity.

---

## API Endpoints

All endpoints below are prefixed with `/api/notes` and require an authenticated session (except where noted).

### `POST /api/notes`
Create a new note. `owner` is set automatically from the logged-in session.

**Request body:**
```json
{
  "title": "Buy groceries",
  "content": "Milk, eggs, bread",
  "urgency": 3,
  "status": "unread"
}
```

**Responses:**
- `201 Created` — returns the newly created note document
- `400 Bad Request` — a required field (`title`, `content`, or `urgency`) is missing
- `500 Internal Server Error` — unexpected server/database failure

---

### `GET /api/notes/owner`
Return every note belonging to the currently logged-in user.

**Responses:**
- `200 OK` — an array of note objects (an empty array if the user has no notes yet — this is a valid, successful state, not an error)
- `401 Unauthorized` — not logged in
- `500 Internal Server Error` — unexpected server/database failure

---

### `GET /api/notes/userNote/:id`
Return a single note by its MongoDB `_id`. Used to pre-fill the edit form.

**Responses:**
- `200 OK` — the matching note object
- `404 Not Found` — no note exists with that id
- `500 Internal Server Error` — unexpected server/database failure

---

### `PATCH /api/notes/updatenote/:id`
Update an existing note. Accepts any subset of the note's editable fields. `owner` is always forced to the logged-in user's email, regardless of what (if anything) is sent in the request body, so a note's ownership can never be reassigned by a client.

**Request body (any combination of):**
```json
{
  "title": "Updated title",
  "content": "Updated content",
  "urgency": 5,
  "status": "read"
}
```

**Responses:**
- `200 OK` — the updated note document
- `404 Not Found` — no note exists with that id
- `500 Internal Server Error` — unexpected server/database failure

---

### `DELETE /api/notes/delete/:id`
Delete a note by its `_id`. Only succeeds if the note's `owner` matches the logged-in user — this prevents any user from deleting a note that isn't theirs, even if they know or guess its id.

**Responses:**
- `200 OK` — `{ "message": "Note erased", "deleteNote": { ...the deleted note... } }`
- `404 Not Found` — no matching note found for that id **and** the logged-in user (either it doesn't exist, or it belongs to someone else)
- `500 Internal Server Error` — unexpected server/database failure

---

## Data Model

Each note (collection: `notes`) has the following fields:

| Field       | Type    | Required | Notes                                              |
|-------------|---------|----------|-----------------------------------------------------|
| `owner`     | String  | Yes      | Email of the note's creator; set server-side only    |
| `title`     | String  | Yes      | Trimmed on save                                       |
| `content`   | String  | Yes      | The body of the note                                  |
| `status`    | String  | No       | e.g. `"unread"` / `"read"`                            |
| `urgency`   | Number  | Yes      | 1 (low) to 5 (high)                                   |
| `assigned`  | String  | No       | Reserved for a future note-sharing feature            |
| `createdAt` | Date    | auto     | Set automatically by Mongoose                         |
| `updatedAt` | Date    | auto     | Updated automatically by Mongoose on every save/update |

---

## Known Limitations / Future Improvements

- Front-end error and confirmation messages currently rely on browser console logging in a few places; a full on-page alert system is a planned improvement.
- The `assigned` field exists in the schema but has no dedicated feature built around it yet — a future version may allow assigning a note to another user, alongside a completed/pending workflow.
