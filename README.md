# Collaborative Whiteboard

A full-stack real-time collaborative whiteboard application where multiple users can draw together, share canvases, and leave comments — all synced live using Socket.IO.

**Live Demo:** [whiteboard-project-kappa.vercel.app](https://whiteboard-project-kappa.vercel.app/)

---

## Features

- **Authentication** — Register and log in with JWT-based session management and bcrypt password hashing
- **Canvas Management** — Create, save, and delete personal whiteboards from a profile dashboard
- **Drawing Tools** — Brush, line, rectangle, circle, arrow, text, and eraser with undo/redo support
- **Real-Time Collaboration** — Multiple users can draw on the same canvas simultaneously using Socket.IO
- **Canvas Sharing** — Share canvases with other users by email; role-based access control (owner vs shared)
- **Live Comments** — Click anywhere on the canvas to leave a pinned comment, visible to all collaborators in real time
- **Auto-Save** — Drawings are debounced and persisted to MongoDB to avoid unnecessary database writes
- **Download** — Export any canvas as a PNG image

---

## Tech Stack

**Frontend**
- React
- Socket.IO Client
- Axios
- React Router DOM
- Tailwind CSS
- React Icons

**Backend**
- Node.js + Express
- Socket.IO
- MongoDB + Mongoose
- JSON Web Token (JWT)
- bcryptjs

---

## Getting Started

### Prerequisites
- Node.js v16+
- A MongoDB Atlas account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/whiteboard.git
cd whiteboard
```

### 2. Set up the backend

```bash
cd backened
npm install
```

Create a `.env` file inside `backened/`:

```env
PORT=8000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_secret_key
JWT_EXPIRES_IN=7d
```

Start the server:

```bash
npm start
```

Server runs at `http://localhost:8000`

### 3. Set up the frontend

```bash
cd whiteboard-tutorial
npm install
npm start
```

App runs at `http://localhost:3000`

---

## Project Structure

```
├── backened/
│   ├── Config/          # MongoDB connection
│   ├── Controllers/     # Auth and canvas logic
│   ├── middleware/      # JWT auth middleware
│   ├── models/          # User, Canvas, Comment schemas
│   ├── routes/          # REST API routes
│   ├── sockets/         # Socket.IO handlers and room state
│   └── utils/           # JWT helper
│
└── whiteboard-tutorial/
    └── src/
        ├── components/  # Board, Toolbar, Toolbox, Comments, Profile, Login, Register
        ├── store/        # React context and reducer for board state
        └── utils/        # Axios client, API calls, socket singleton, auth helpers
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Log in and receive JWT | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| GET | `/api/canvas/list` | List all owned and shared canvases | Yes |
| POST | `/api/canvas/create` | Create a new canvas | Yes |
| GET | `/api/canvas/load/:id` | Load a canvas by ID | Yes |
| PUT | `/api/canvas/update` | Save canvas elements | Yes |
| PUT | `/api/canvas/share/:id` | Share canvas with a user by email | Yes |
| DELETE | `/api/canvas/:canvasId` | Delete a canvas (owner only) | Yes |

---

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `joinCanvas` | Client → Server | Join a canvas room |
| `canvasData` | Server → Client | Receive current elements and comments on join |
| `drawingUpdate` | Both | Broadcast live drawing changes to other users |
| `newComment` | Client → Server | Post a new comment |
| `receiveComment` | Server → Client | Receive a new comment in real time |
| `canvasError` | Server → Client | Receive access or error messages |
