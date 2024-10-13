// server/routes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to data files
const moviesFilePath = path.join(__dirname, '../data/movies.json');
const usersFilePath = path.join(__dirname, '../data/users.json');

// Load movie data
function loadMovies() {
  return JSON.parse(fs.readFileSync(moviesFilePath, 'utf8'));
}

// Load user data
function loadUsers() {
  return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
}

// Save user data
function saveUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session && req.session.username) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}

// Get movies by tag
router.get('/movies/tag/:tag', isAuthenticated, (req, res) => {
  const movies = loadMovies(); // Load movies from the JSON file
  const tag = req.params.tag;
  const filteredMovies = movies.filter(movie => movie.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()));
  res.json(filteredMovies);
});

// Get movie details by ID
router.get('/movies/:id', isAuthenticated, (req, res) => {
  const movies = loadMovies(); // Load movies from the JSON file
  const movie = movies.find(m => m.id === parseInt(req.params.id));
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send('Movie not found');
  }
});

// Add a movie to a user's list (favorites, watched, wishlist, watching)
router.post('/user/:listType', isAuthenticated, (req, res) => {
  const listType = req.params.listType; // 'favorites', 'watched', 'watching', 'wishlist'
  const movieId = req.body.movieId;
  const username = req.session.username;

  const users = loadUsers();
  const user = users.find(u => u.name === username);
  
  if (user) {
    user[listType] = user[listType] || [];
    if (!user[listType].includes(movieId)) {
      user[listType].push(movieId);
      saveUsers(users); // Save updated users list
    }
    res.json({ success: true, message: `${listType} updated` });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// Post a review for a movie
router.post('/movies/:id/review', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { review } = req.body;
  const username = req.session.username;

  if (!review) {
    return res.status(400).json({ success: false, message: 'Review text is required' });
  }

  const movies = loadMovies();
  const movie = movies.find(m => m.id === parseInt(id));

  if (movie) {
    const newReview = { username, review };
    movie.reviews.push(newReview);
    fs.writeFileSync(moviesFilePath, JSON.stringify(movies, null, 2));
    res.json({ success: true, review: newReview });
  } else {
    res.status(404).json({ success: false, message: 'Movie not found' });
  }
});

// Get all reviews for a movie
router.get('/movies/:id/reviews', isAuthenticated, (req, res) => {
  const movies = loadMovies();
  const movie = movies.find(m => m.id === parseInt(req.params.id));
  if (movie) {
      res.json(movie.reviews);
  } else {
      res.status(404).json({ success: false, message: 'Movie not found' });
  }
});


// Get all movies
router.get('/movies', isAuthenticated, (req, res) => {
  const movies = loadMovies(); // Load movies from the JSON file
  res.json(movies);
});

// Get user profile data
router.get('/profile', isAuthenticated, (req, res) => {
  const users = loadUsers();
  const user = users.find(u => u.name === req.session.username);
  if (user) {
    res.json({
      name: user.name,
      favorites: user.favorites,
      watched: user.watched,
      watching: user.watching,
      wishlist: user.wishlist
    });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

module.exports = router;
