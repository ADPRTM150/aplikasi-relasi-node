// server/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk baca file statis (HTML, CSS, JS) dari folder public
app.use(express.static(path.join(__dirname, '../public')));

// ============================================================
//  ROUTING HALAMAN
// ============================================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/love-language', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/love-language.html'));
});

app.get('/hasil', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/hasil.html'));
});

// ============================================================
//  START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});