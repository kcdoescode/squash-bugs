const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // 1. Import the connection file

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB(); // 2. Call the connection function

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON data
app.use(express.json());

// A simple test route
app.get('/', (req, res) => {
    res.send('Hello from Squash Bugs API!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});