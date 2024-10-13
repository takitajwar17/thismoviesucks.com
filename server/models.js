const fs = require('fs');
const path = require('path');

// Movie class
class Movie {
  constructor(title, tags, id, description) {
    this.title = title;
    this.tags = tags;
    this.id = id;
    this.description = description;
    this.reviews = [];
  }

  static getMoviesFromFile() {
    const filePath = path.join(__dirname, '../data/movies.json');
    const movieData = fs.readFileSync(filePath);
    return JSON.parse(movieData).map(movie => new Movie(movie.title, movie.tags, movie.id, movie.description));
  }

  static saveMoviesToFile(movies) {
    const filePath = path.join(__dirname, '../data/movies.json');
    fs.writeFileSync(filePath, JSON.stringify(movies, null, 2));
  }

  addReview(review) {
    this.reviews.push(review);
  }
}

// User class
class User {
  constructor(name, userid) {
    this.name = name;
    this.userid = userid;
    this.favorites = [];
    this.statuses = { watched: [], watching: [], wishlist: [] };
  }

  static createUser(name, userid) {
    return new User(name, userid);
  }

  addFavorite(movie) {
    this.favorites.push(movie);
  }

  addMovieToStatus(movie, status) {
    this.statuses[status].push(movie);
  }

  static getUsersFromFile() {
    const filePath = path.join(__dirname, '../data/users.json');
    const userData = fs.readFileSync(filePath);
    return JSON.parse(userData).map(user => new User(user.name, user.userid));
  }

  static saveUsersToFile(users) {
    const filePath = path.join(__dirname, '../data/users.json');
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  }
}

// Review class
class Review {
  constructor(user, content) {
    this.user = user;
    this.content = content;
  }
}

module.exports = { Movie, User, Review };
