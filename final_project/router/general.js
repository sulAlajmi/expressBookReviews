const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.get('/', async (req, res) => {
  try {
    const getBooks = () => new Promise((resolve) => resolve(books));
    const bookList = await getBooks();
    return res.status(200).json({ books: bookList });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching book list." });
  }
});

public_users.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
    const getBookByISBN = (isbn) => new Promise((resolve, reject) => {
      books[isbn] ? resolve(books[isbn]) : reject("Book not found");
    });
    const book = await getBookByISBN(isbn);
    return res.status(200).json(book);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});

public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;
  const getBooksByAuthor = (author) => new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter(book => book.author === author);
    filteredBooks.length > 0 ? resolve(filteredBooks) : reject("No books found by this author");
  });

  getBooksByAuthor(author)
    .then(books => res.status(200).json({ books }))
    .catch(err => res.status(404).json({ message: err }));
});

public_users.get('/title/:title', async (req, res) => {
  const { title } = req.params;
  try {
    const getBooksByTitle = (title) => new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(book => book.title === title);
      filteredBooks.length > 0 ? resolve(filteredBooks) : reject("No books found with this title");
    });
    const booksByTitle = await getBooksByTitle(title);
    return res.status(200).json({ books: booksByTitle });
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});

public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  if (books[isbn]?.reviews) {
    return res.status(200).json({ reviews: books[isbn].reviews });
  }
  return res.status(404).json({ message: "No reviews found for this book" });
});

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users[username]) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users[username] = { password };
  return res.status(201).json({ message: "User registered successfully" });
});

module.exports.general = public_users;
