// server/server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const routes = require('./routes'); // Import routes.js

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Session middleware
app.use(session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', routes);

// Login endpoint
app.post('/login', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const usersFilePath = path.join(__dirname, "../data/users.json");
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    const userExists = users.find(user => user.name === name);

    if (!userExists) {
        return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.session.username = name; // Set session username
    res.json({ success: true });
});

// Signup endpoint
app.post('/signup', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const usersFilePath = path.join(__dirname, "../data/users.json");
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    const userExists = users.find(user => user.name === name);

    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate a unique userid
    const newUserId = Date.now() + Math.floor(Math.random() * 1000); // Simple unique ID generation
    
    // Add new user with userid
    const newUser = { name, userid: newUserId, favorites: [], watched: [], wishlist: [], watching: [] };
    users.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2)); // Save updated users list
    res.json({ success: true, message: 'User registered successfully', userid: newUserId });
});

// Endpoint to get current user
app.get('/current-user', (req, res) => {
    if (req.session.username) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Logout failed' });
            } else {
                res.clearCookie('connect.sid'); // Clear the session cookie
                return res.json({ success: true, message: 'Logged out successfully' });
            }
        });
    } else {
        res.status(400).json({ success: false, message: 'No active session' });
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
