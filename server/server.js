// server/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk baca file statis
app.use(express.static(path.join(__dirname, '../public')));

// ============================================================
//  ENDPOINT: Kirim Firebase Config ke Frontend
// ============================================================
app.get('/api/firebase-config', (req, res) => {
    res.json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    });
});

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