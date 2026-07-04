// server/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
//  🔥 MIDDLEWARE: Cegah akses langsung ke .html
// ============================================================
app.use((req, res, next) => {
    // Jika URL mengandung .html, redirect ke tanpa .html
    if (req.path.endsWith('.html')) {
        const newPath = req.path.replace(/\.html$/, '');
        // Pertahankan query string jika ada
        const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        return res.redirect(301, newPath + query);
    }
    next();
});

// Middleware untuk baca file statis dari folder public
app.use(express.static(path.join(__dirname, '../public')));

// ============================================================
//  ROUTING HALAMAN USER (Tanpa .html)
// ============================================================

// Beranda
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Login User
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Love Language
app.get('/love-language', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/love-language.html'));
});

// Hasil Tes
app.get('/hasil', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/hasil.html'));
});

// Relationship Check
app.get('/relationship-check', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/relationship-check.html'));
});

// Profil User
app.get('/profil', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/profil.html'));
});

// ============================================================
//  ROUTING ADMIN (Tanpa .html)
// ============================================================

// Dashboard Admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// Login Admin
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/login.html'));
});

// ============================================================
//  REDIRECT: Jika user akses dengan .html, pindah ke tanpa .html
// ============================================================

// Redirect .html → tanpa .html (semua halaman)
app.get('/*.html', (req, res) => {
    const url = req.originalUrl.replace(/\.html$/, '');
    res.redirect(301, url);
});

// ============================================================
//  REDIRECT LAINNYA (Mencegah akses salah)
// ============================================================

// /login/admin → /admin
app.get('/login/admin', (req, res) => {
    res.redirect('/admin');
});

// /admin/login/ → /admin/login
app.get('/admin/login/', (req, res) => {
    res.redirect('/admin/login');
});

// ============================================================
//  HANDLE 404
// ============================================================
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Halaman Tidak Ditemukan</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f7f3eb; }
                h1 { font-size: 72px; color: #1d3b36; }
                p { color: #5a6f6a; }
                a { color: #3a7d76; text-decoration: none; font-weight: 600; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>404</h1>
            <p>Maaf, halaman yang kamu cari tidak ditemukan.</p>
            <a href="/">← Kembali ke Beranda</a>
        </body>
        </html>
    `);
});

// ============================================================
//  START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📁 Admin: http://localhost:${PORT}/admin`);
    console.log(`🔑 Login Admin: http://localhost:${PORT}/admin/login`);
});