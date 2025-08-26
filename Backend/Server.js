const express = require('express');
const cors = require('cors');
const http = require('http'); // Required for Socket.IO
const dotenv = require('dotenv');
const { connectDb } = require('./config/dbconfig');
const setupSocket = require('./utils/socket'); // Import the Socket.IO setup

dotenv.config();

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = setupSocket(server); // Initialize Socket.IO

// Middleware
app.use(express.json());
app.use(cors());

// Make io instance available to routes
app.set('io', io);

// Routes
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const noteRoutes = require('./routes/noteRoutes');
const groupRoutes = require('./routes/groupRoutes')
app.use('/tasksphere/', taskRoutes);
app.use('/tasksphere/', userRoutes);
app.use('/tasksphere/', projectRoutes);
app.use('/tasksphere/', noteRoutes);
app.use('/tasksphere/', groupRoutes);

// Test route
app.get('/hello', (req, res) => {
    res.send('Hello World!');
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

connectDb();