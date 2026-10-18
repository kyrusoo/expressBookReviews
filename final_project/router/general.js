const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');
const public_users = express.Router();

// POST /register
public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }
  users.push({ username, password });
  return res.status(200).json({ message: 'User successfully registered. Now you can login.' });
});

// Task 2: all books
public_users.get('/', (req, res) => res.status(200).json(books));

// Task 3: book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.status(200).json(book);
});

// Task 4: books by author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const results = Object.fromEntries(
    Object.entries(books).filter(([, book]) => book.author.toLowerCase() === author)
  );
  return res.status(200).json(results);
});

// Task 5: books by title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const results = Object.fromEntries(
    Object.entries(books).filter(([, book]) => book.title.toLowerCase() === title)
  );
  return res.status(200).json(results);
});

// Task 6: book review by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.status(200).json(book.reviews);
});

// Task 11: asynchronous book retrieval using Axios and async/await.
// These call the local Express API; keep the server running while invoking them.
const API_URL = process.env.BOOK_REVIEW_API_URL || 'http://127.0.0.1:5000';

async function getAllBooks() {
  const response = await axios.get(`${API_URL}/`);
  return response.data;
}

async function getBooksByISBN(isbn) {
  const response = await axios.get(`${API_URL}/isbn/${encodeURIComponent(isbn)}`);
  return response.data;
}

async function getBooksByAuthor(author) {
  const response = await axios.get(`${API_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
}

async function getBooksByTitle(title) {
  const response = await axios.get(`${API_URL}/title/${encodeURIComponent(title)}`);
  return response.data;
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBooksByISBN = getBooksByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
