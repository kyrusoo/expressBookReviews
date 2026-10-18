const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const isValid = (username) => users.some((user) => user.username === username);

const authenticatedUser = (username, password) =>
  users.some((user) => user.username === username && user.password === password);

// POST /customer/login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' ||
      !authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });
  req.session.authorization = { accessToken };
  return res.status(200).json({ message: 'User successfully logged in' });
});

// PUT /customer/auth/review/:isbn?review=Great%20book
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const review = req.query.review ?? (req.body && req.body.review);
  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ message: 'Review must be a non-empty string' });
  }

  book.reviews[req.user.username] = review;
  return res.status(200).json({
    message: 'Review added/updated successfully',
    reviews: book.reviews,
  });
});

// DELETE /customer/auth/review/:isbn
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  if (!Object.prototype.hasOwnProperty.call(book.reviews, req.user.username)) {
    return res.status(404).json({ message: 'Review not found for this user' });
  }

  delete book.reviews[req.user.username];
  return res.status(200).json({
    message: 'Review deleted successfully',
    reviews: book.reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
