// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');

const connectToDatabase = require('./Config/db');
const initSocket = require('./sockets');

const app = express();
app.use(cors());
app.use(express.json());

connectToDatabase();

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const canvasRoutes = require('./routes/canvasRoutes');
app.use('/api/canvas', canvasRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the User Management API');
});

// Socket.IO needs a raw HTTP server to attach to (not just the Express
// app), so we create one explicitly instead of using app.listen() directly.
// REST routes above are untouched — they still go through `app` exactly as before.
const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
