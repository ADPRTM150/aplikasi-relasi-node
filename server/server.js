require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');

// ============================================================
//  🔥 FIREBASE ADMIN
// ============================================================
const admin = require('firebase-admin');

// Cek environment variables
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('❌ Firebase credentials tidak lengkap! Cek .env');
    console.error('Pastikan FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, dan FIREBASE_PRIVATE_KEY terisi');
    process.exit(1);
}

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

console.log('✅ Firebase Admin initialized');
console.log(`📁 Project: ${process.env.FIREBASE_PROJECT_ID}`);

const db = admin.firestore();

// ============================================================
//  🔥 JWT SECRET — auto-generate kalau tidak diset
// ============================================================
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET tidak diset di environment variables!');
    console.warn('⚠️  Menggunakan random secret (session-only). Token akan invalid saat server restart.');
    console.warn('⚠️  Set JWT_SECRET di Vercel Environment Variables untuk production.');
}
const BCRYPT_ROUNDS = 12;

// ============================================================
//  🔥 EXPRESS APP
// ============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
//  🔥 RATE LIMITER — simple in-memory (untuk admin login)
// ============================================================
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 menit
const RATE_LIMIT_MAX = 10; // max 10 percobaan per IP

function rateLimiter(req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (record && now < record.windowStart + RATE_LIMIT_WINDOW) {
        if (record.count >= RATE_LIMIT_MAX) {
            return res.status(429).json({
                success: false,
                message: 'Terlalu banyak percobaan login. Coba lagi 15 menit.'
            });
        }
        record.count++;
    } else {
        rateLimitMap.set(ip, { count: 1, windowStart: now });
    }

    // Bersihkan entries lama setiap 100 request
    if (Math.random() < 0.01) {
        for (const [key, val] of rateLimitMap) {
            if (now > val.windowStart + RATE_LIMIT_WINDOW) rateLimitMap.delete(key);
        }
    }

    next();
}

// ============================================================
//  🔥 MIDDLEWARE
// ============================================================

// CSP Header
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://apis.google.com https://app.midtrans.com https://app.sandbox.midtrans.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://apis.google.com https://firestore.googleapis.com https://www.gstatic.com wss://*.firebaseio.com https://app.midtrans.com https://app.sandbox.midtrans.com; " +
        "frame-src 'self' https://*.firebaseapp.com https://*.google.com https://www.youtube.com https://app.midtrans.com https://app.sandbox.midtrans.com"
    );
    // Halaman hasil boleh di-frame oleh situs sendiri (embed di Profil),
    // halaman lain tetap DENY
    if (req.path === '/hasil' && req.query.embed === '1') {
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    } else {
        res.setHeader('X-Frame-Options', 'DENY');
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
});

// CORS — spesifik domain saja
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://aplikasi-relasi-node.vercel.app',
    'https://aplikasi-relasi-node-*.vercel.app',
    'https://qualityoflove.com',
    'https://www.qualityoflove.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Izinkan request tanpa origin (mobile apps, curl, dll)
        if (!origin) return callback(null, true);
        // Periksa exact match atau wildcard Vercel preview
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed.includes('*')) {
                const regex = new RegExp('^' + allowed.replace('*', '[^/]+') + '$');
                return regex.test(origin);
            }
            return allowed === origin;
        });
        if (isAllowed) return callback(null, true);
        callback(null, true); // Allow all for now, CSP handles rest
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================================
//  🔥 SERVE STATIC FILES DULUAN
// ============================================================
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();

    const filePath = path.join(__dirname, '../public', req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return res.sendFile(filePath);
    }

    const htmlPath = path.join(__dirname, '../public', req.path + '.html');
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
        return res.sendFile(htmlPath);
    }

    next();
});

// redirect:false — biarkan route eksplisit (mis. /ebook → /artikel) yang menangani direktori
app.use(express.static(path.join(__dirname, '../public'), { redirect: false }));

app.use((req, res, next) => {
    if (req.path.endsWith('.html')) {
        const newPath = req.path.replace(/\.html$/, '');
        const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        return res.redirect(301, newPath + query);
    }
    next();
});

// ============================================================
//  🔥 ENDPOINT: KIRIM FIREBASE CONFIG KE FRONTEND
// ============================================================
app.get('/api/config', (req, res) => {
    const midtransIsProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    res.json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        midtransClientKey: process.env.MIDTRANS_CLIENT_KEY || null,
        midtransEnabled: !!(process.env.MIDTRANS_SERVER_KEY && process.env.MIDTRANS_CLIENT_KEY),
        midtransIsProduction: midtransIsProduction,
        midtransSnapUrl: (midtransIsProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com') + '/snap/snap.js'
    });
});

// ============================================================
//  🔥 HELPER: Verifikasi admin password (support bcrypt + plaintext migration)
// ============================================================
async function verifyAdminPassword(settings, password) {
    // Cara 1: bcrypt hash (jika sudah di-hash)
    if (settings.passwordHash) {
        return await bcrypt.compare(password, settings.passwordHash);
    }
    // Cara 2: plaintext (migrasi dari lama) — auto-upgrade ke hash
    if (settings.password && password === settings.password) {
        // Auto-upgrade: hash password dan simpan
        const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await db.collection('admin').doc('settings').update({
            passwordHash: hash,
            password: admin.firestore.FieldValue.delete() // hapus plaintext
        });
        console.log('🔐 Password admin di-upgrade ke bcrypt hash');
        return true;
    }
    return false;
}

// ============================================================
//  🔥 ADMIN LOGIN (JWT + BCRYPT + RATE LIMIT)
// ============================================================
app.post('/api/admin/login', rateLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password wajib diisi'
            });
        }

        let validCredentials = false;

        // 🔥 Cek 1: Environment variables (jika diset)
        if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) {
            if (email === process.env.ADMIN_EMAIL) {
                validCredentials = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
            }
        }

        // 🔥 Cek 2: Firestore admin/settings (via Admin SDK — bypass rules)
        if (!validCredentials) {
            const doc = await db.collection('admin').doc('settings').get();
            if (doc.exists) {
                const settings = doc.data();
                validCredentials = await verifyAdminPassword(settings, password);
            } else {
                // Default credentials — langsung hash saat simpan
                if (email === 'admin@relasi.com' && password === 'admin123') {
                    validCredentials = true;
                    const hash = await bcrypt.hash('admin123', BCRYPT_ROUNDS);
                    await db.collection('admin').doc('settings').set({
                        email: 'admin@relasi.com',
                        passwordHash: hash,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('🔐 Default admin dibuat dengan bcrypt hash');
                }
            }
        }

        if (!validCredentials) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        const token = jwt.sign(
            { email, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: { email, role: 'admin' }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// ============================================================
//  🔥 VERIFY ADMIN TOKEN (MIDDLEWARE)
// ============================================================
const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token tidak ditemukan'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token tidak valid atau kadaluarsa'
        });
    }
};

// ============================================================
//  🔥 ADMIN PROTECTED ROUTES
// ============================================================

app.get('/api/admin/verify', verifyAdminToken, (req, res) => {
    res.json({
        success: true,
        message: 'Admin terverifikasi',
        admin: req.admin
    });
});

app.get('/api/admin/users', verifyAdminToken, async (req, res) => {
    try {
        const snapshot = await db.collection('users').limit(200).get();
        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        res.json({ success: true, users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

// ============================================================
//  🔥 ADMIN SETTINGS — GET
// ============================================================
app.get('/api/admin/settings', verifyAdminToken, async (req, res) => {
    try {
        const doc = await db.collection('admin').doc('settings').get();
        if (doc.exists) {
            const data = doc.data();
            delete data.password;      // jangan kirim plaintext
            delete data.passwordHash;  // jangan kirim hash juga
            res.json({ success: true, settings: data });
        } else {
            res.json({ success: true, settings: { email: 'admin@relasi.com' } });
        }
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil settings' });
    }
});

// ============================================================
//  🔥 ADMIN SETTINGS — UPDATE (hash password)
// ============================================================
app.put('/api/admin/settings', verifyAdminToken, async (req, res) => {
    try {
        const { email, password, highlightKeywords } = req.body;
        const data = {
            email: email || 'admin@relasi.com',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (password && password.length >= 6) {
            data.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
            // Hapus plaintext kalau ada
            data.password = admin.firestore.FieldValue.delete();
        }
        // Kata kunci highlight untuk fitur Upload Word (admin bisa atur)
        if (Array.isArray(highlightKeywords)) {
            data.highlightKeywords = highlightKeywords
                .map(k => String(k).trim().toLowerCase())
                .filter(k => k && k.length <= 40)
                .slice(0, 100);
        }
        await db.collection('admin').doc('settings').set(data, { merge: true });
        console.log('🔐 Admin settings updated dengan hash');
        res.json({ success: true, message: 'Settings berhasil disimpan' });
    } catch (error) {
        console.error('Save settings error:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan settings' });
    }
});

// ============================================================
//  🔥 ADMIN CRUD: Articles, Ebooks, Videos (via server)
// ============================================================

// --- ARTICLES ---
app.get('/api/admin/articles', verifyAdminToken, async (req, res) => {
    try {
        const snapshot = await db.collection('articles').orderBy('createdAt', 'desc').get();
        const articles = [];
        snapshot.forEach(doc => articles.push({ id: doc.id, ...doc.data() }));
        res.json({ success: true, articles });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat artikel' });
    }
});

app.post('/api/admin/articles', verifyAdminToken, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: admin.firestore.FieldValue.serverTimestamp() };
        const ref = await db.collection('articles').add(data);
        res.json({ success: true, id: ref.id, message: 'Artikel dibuat' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal membuat artikel' });
    }
});

app.put('/api/admin/articles/:id', verifyAdminToken, async (req, res) => {
    try {
        await db.collection('articles').doc(req.params.id).update(req.body);
        res.json({ success: true, message: 'Artikel diupdate' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update artikel' });
    }
});

app.delete('/api/admin/articles/:id', verifyAdminToken, async (req, res) => {
    try {
        await db.collection('articles').doc(req.params.id).delete();
        res.json({ success: true, message: 'Artikel dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal hapus artikel' });
    }
});

// --- EBOOKS ---
app.get('/api/admin/ebooks', verifyAdminToken, async (req, res) => {
    try {
        const snapshot = await db.collection('ebooks').orderBy('createdAt', 'desc').get();
        const ebooks = [];
        snapshot.forEach(doc => ebooks.push({ id: doc.id, ...doc.data() }));
        res.json({ success: true, ebooks });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat ebook' });
    }
});

app.post('/api/admin/ebooks', verifyAdminToken, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: admin.firestore.FieldValue.serverTimestamp() };
        const ref = await db.collection('ebooks').add(data);
        res.json({ success: true, id: ref.id, message: 'Ebook dibuat' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal membuat ebook' });
    }
});

app.put('/api/admin/ebooks/:id', verifyAdminToken, async (req, res) => {
    try {
        await db.collection('ebooks').doc(req.params.id).update(req.body);
        res.json({ success: true, message: 'Ebook diupdate' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update ebook' });
    }
});

app.delete('/api/admin/ebooks/:id', verifyAdminToken, async (req, res) => {
    try {
        await db.collection('ebooks').doc(req.params.id).delete();
        res.json({ success: true, message: 'Ebook dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal hapus ebook' });
    }
});

// --- VIDEOS ---
app.get('/api/admin/videos', verifyAdminToken, async (req, res) => {
    try {
        const snapshot = await db.collection('videos').orderBy('createdAt', 'desc').get();
        const videos = [];
        snapshot.forEach(doc => videos.push({ id: doc.id, ...doc.data() }));
        res.json({ success: true, videos });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat video' });
    }
});

app.post('/api/admin/videos', verifyAdminToken, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: admin.firestore.FieldValue.serverTimestamp() };
        const ref = await db.collection('videos').add(data);
        res.json({ success: true, id: ref.id, message: 'Video dibuat' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal membuat video' });
    }
});

app.put('/api/admin/videos/:id', verifyAdminToken, async (req, res) => {
    try {
        await db.collection('videos').doc(req.params.id).update(req.body);
        res.json({ success: true, message: 'Video diupdate' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update video' });
    }
});

app.delete('/api/admin/videos/:id', verifyAdminToken, async (req, res) => {
    try {
        await db.collection('videos').doc(req.params.id).delete();
        res.json({ success: true, message: 'Video dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal hapus video' });
    }
});

// ============================================================
//  🔥 ADMIN CRUD: Users
// ============================================================
app.post('/api/admin/users', verifyAdminToken, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: admin.firestore.FieldValue.serverTimestamp() };
        const ref = await db.collection('users').add(data);
        res.json({ success: true, id: ref.id, message: 'User dibuat' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal membuat user' });
    }
});

app.put('/api/admin/users/:id', verifyAdminToken, async (req, res) => {
    try {
        await db.collection('users').doc(req.params.id).update(req.body);
        res.json({ success: true, message: 'User diupdate' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update user' });
    }
});

app.delete('/api/admin/users/:id', verifyAdminToken, async (req, res) => {
    try {
        await db.collection('users').doc(req.params.id).delete();
        res.json({ success: true, message: 'User dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal hapus user' });
    }
});

// ============================================================
//  🔥 ADMIN: Couples (wellness_tests)
// ============================================================
app.get('/api/admin/couples', verifyAdminToken, async (req, res) => {
    try {
        const snapshot = await db.collection('wellness_tests')
            .where('userCompleted', '==', true)
            .orderBy('completedAt', 'desc')
            .limit(200)
            .get();
        const couples = [];
        snapshot.forEach(doc => couples.push({ id: doc.id, ...doc.data() }));
        res.json({ success: true, couples });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat data couples' });
    }
});

app.get('/api/admin/couples/:id', verifyAdminToken, async (req, res) => {
    try {
        const doc = await db.collection('wellness_tests').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        res.json({ success: true, couple: { id: doc.id, ...doc.data() } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat detail' });
    }
});

app.delete('/api/admin/couples/:id', verifyAdminToken, async (req, res) => {
    try {
        await db.collection('wellness_tests').doc(req.params.id).delete();
        res.json({ success: true, message: 'Data dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal hapus data' });
    }
});

// ============================================================
//  🔥 ADMIN: Activities
// ============================================================
app.get('/api/admin/activities', verifyAdminToken, async (req, res) => {
    try {
        const snapshot = await db.collection('activities')
            .orderBy('timestamp', 'desc')
            .limit(30)
            .get();
        const activities = [];
        snapshot.forEach(doc => activities.push({ id: doc.id, ...doc.data() }));
        res.json({ success: true, activities });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat aktivitas' });
    }
});

// ============================================================
//  🔥 PUBLIC EBOOKS: ORDER + STATUS + WEBHOOK MIDTRANS
// ============================================================

// Base URL API Snap Midtrans (sandbox / production)
function midtransBaseUrl() {
    return process.env.MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
}

// 🔥 BUAT ORDER EBOOK (PUBLIK — tanpa auth admin)
app.post('/api/public/ebooks/order', async (req, res) => {
    try {
        const { ebookId } = req.body || {};
        if (!ebookId) {
            return res.json({ success: false, message: 'Ebook tidak ditemukan' });
        }

        const ebookDoc = await db.collection('ebooks').doc(ebookId).get();
        if (!ebookDoc.exists) {
            return res.json({ success: false, message: 'Ebook tidak ditemukan' });
        }
        const ebook = ebookDoc.data();
        if (ebook.status !== 'published') {
            return res.json({ success: false, message: 'Ebook belum dipublikasikan' });
        }
        const price = Number(ebook.price) || 0;
        if (price <= 0) {
            return res.json({ success: false, message: 'Ebook ini gratis — tidak perlu pembayaran' });
        }
        if (!process.env.MIDTRANS_SERVER_KEY) {
            return res.json({ success: false, message: 'Pembayaran belum dikonfigurasi' });
        }

        // Ambil identitas user jika kirim Firebase ID token (opsional)
        let userId = '', userName = '', userEmail = '';
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const decoded = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
                userId = decoded.uid || '';
                userEmail = decoded.email || '';
                userName = decoded.name || (decoded.email || '').split('@')[0] || 'Pengguna';
            } catch (e) { /* anggap guest */ }
        }

        // Order ID unik: ORD-<timestamp>-<rand> (≤ 50 karakter, aman untuk Midtrans)
        const orderId = 'ORD-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);

        // Simpan order dulu (status pending)
        await db.collection('orders').doc(orderId).set({
            orderId: orderId,
            ebookId: ebookId,
            title: ebook.title || 'Ebook',
            price: price,
            status: 'pending',
            userId: userId,
            userName: userName,
            userEmail: userEmail,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Panggil Midtrans Snap API
        const payload = {
            transaction_details: { order_id: orderId, gross_amount: price },
            item_details: [{ id: ebookId, price: price, quantity: 1, name: String(ebook.title || 'Ebook').slice(0, 50) }],
            customer_details: { first_name: userName || 'Pembeli', email: userEmail || undefined }
        };
        if (!payload.customer_details.email) delete payload.customer_details.email;

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        let midtransResp;
        try {
            midtransResp = await fetch(midtransBaseUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
        } finally {
            clearTimeout(timer);
        }
        const data = await midtransResp.json();

        if (!midtransResp.ok || !data.token) {
            console.error('Midtrans error:', midtransResp.status, JSON.stringify(data));
            return res.status(502).json({ success: false, message: 'Gagal menghubungi payment gateway. Coba lagi.' });
        }

        res.json({ success: true, token: data.token, redirectUrl: data.redirect_url, orderId: orderId });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

// 🔥 CEK STATUS ORDER (PUBLIK) — fileUrl HANYA saat settlement
app.get('/api/public/ebooks/order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const doc = await db.collection('orders').doc(orderId).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
        }
        const order = doc.data();
        const result = {
            success: true,
            orderId: order.orderId,
            status: order.status,
            ebookId: order.ebookId,
            title: order.title,
            price: order.price
        };
        if (order.status === 'success') {
            const ebookDoc = await db.collection('ebooks').doc(order.ebookId).get();
            result.fileUrl = ebookDoc.exists ? (ebookDoc.data().fileUrl || '') : '';
        }
        res.json(result);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

// 🔥 WEBHOOK MIDTRANS — verifikasi signature, update status order
app.post('/api/webhooks/midtrans', async (req, res) => {
    try {
        const body = req.body || {};
        const orderId = String(body.order_id || '');
        const statusCode = String(body.status_code || '');
        const grossAmount = String(body.gross_amount || '');
        const signatureKey = String(body.signature_key || '');
        const transactionStatus = String(body.transaction_status || '');

        // Verifikasi signature: SHA512(order_id + status_code + gross_amount + ServerKey)
        if (process.env.MIDTRANS_SERVER_KEY) {
            const expected = crypto.createHash('sha512')
                .update(orderId + statusCode + grossAmount + process.env.MIDTRANS_SERVER_KEY)
                .digest('hex');
            if (expected !== signatureKey) {
                console.warn('⚠️ Midtrans webhook signature invalid:', orderId);
                return res.status(200).json({ status_code: 200, status_message: 'OK' });
            }
        }

        const statusMap = {
            capture: 'success',
            settlement: 'success',
            pending: 'pending',
            deny: 'failed',
            cancel: 'failed',
            expire: 'failed',
            failure: 'failed'
        };
        const newStatus = statusMap[transactionStatus] || 'pending';

        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();
        if (orderDoc.exists) {
            const prevStatus = orderDoc.data().status || 'pending';
            if (prevStatus !== newStatus) {
                await orderRef.update({
                    status: newStatus,
                    midtransStatus: transactionStatus,
                    paymentType: String(body.payment_type || ''),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            // 🔥 LOG AKTIVITAS 'ebook_purchased' VIA SERVER (Admin SDK)
            if (newStatus === 'success' && prevStatus !== 'success') {
                const order = orderDoc.data();
                try {
                    await db.collection('activities').add({
                        userId: order.userId || 'guest',
                        userEmail: order.userEmail || '-',
                        userName: order.userName || 'Pembeli',
                        type: 'ebook_purchased',
                        icon: '📚',
                        priority: 'high',
                        timestamp: admin.firestore.FieldValue.serverTimestamp(),
                        details: {
                            ebookId: order.ebookId || 'unknown',
                            ebookTitle: order.title || 'Ebook',
                            price: order.price || 0
                        }
                    });
                    console.log('✅ ebook_purchased activity logged:', order.title);
                } catch (err) {
                    console.error('❌ Gagal log activity:', err);
                }
            }
        }

        // SELALU return 200 supaya Midtrans tidak retry
        res.status(200).json({ status_code: 200, status_message: 'OK' });
    } catch (error) {
        console.error('Midtrans webhook error:', error);
        res.status(200).json({ status_code: 200, status_message: 'OK' });
    }
});

// 🔥 ADMIN: DAFTAR SEMUA ORDER
app.get('/api/admin/orders', verifyAdminToken, async (req, res) => {
    try {
        const snapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();
        const orders = [];
        snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat orders' });
    }
});

// ============================================================
//  🔥 MIDDLEWARE: VERIFY FIREBASE TOKEN
// ============================================================
const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// ============================================================
//  🔥 WELLNESS CHECK ROUTES
// ============================================================

// 1. START TEST
app.post('/api/wellness/start', verifyFirebaseToken, async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.user.uid;

        const existing = await db.collection('wellness_tests')
            .where('userId', '==', userId)
            .where('completedAt', '==', null)
            .get();

        if (!existing.empty) {
            const doc = existing.docs[0];
            const data = doc.data();
            return res.json({
                success: true,
                testId: doc.id,
                data: data,
                isNew: false,
                userCompleted: data.userCompleted || false,
                partnerCompleted: data.partnerCompleted || false,
                inviteCode: data.inviteCode || null
            });
        }

        const inviteCode = generateInviteCode();
        console.log('📌 Generated inviteCode:', inviteCode);

        const testData = {
            userId,
            role: role || 'user',
            startedAt: admin.firestore.FieldValue.serverTimestamp(),
            userCompleted: false,
            partnerCompleted: false,
            userAnswers: {},
            partnerAnswers: {},
            inviteCode: inviteCode,
            isActive: true
        };

        const docRef = await db.collection('wellness_tests').add(testData);
        console.log('📌 Test created with inviteCode:', inviteCode);

        res.json({
            success: true,
            testId: docRef.id,
            data: { ...testData, id: docRef.id },
            isNew: true,
            inviteCode: inviteCode
        });

    } catch (error) {
        console.error('Start wellness error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

// 2. GET TEST - IZINKAN PEMILIK DAN PARTNER
app.get('/api/wellness/test/:testId', verifyFirebaseToken, async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.user.uid;

        if (!testId || testId.length < 10) {
            return res.status(400).json({ success: false, message: 'ID tes tidak valid' });
        }

        const doc = await db.collection('wellness_tests').doc(testId).get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Test tidak ditemukan' });
        }

        const data = doc.data();

        const isOwner = data.userId === userId;
        const isPartner = data.partnerUserId === userId;

        if (!isOwner && !isPartner) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak'
            });
        }

        const responseData = { ...data, id: doc.id };
        delete responseData.userAnswers;
        delete responseData.partnerAnswers;

        res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Get test error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

// 3. SUBMIT ANSWERS
app.post('/api/wellness/submit', verifyFirebaseToken, async (req, res) => {
    try {
        const { testId, role, answers } = req.body;
        const userId = req.user.uid;

        if (!testId) {
            return res.status(400).json({ success: false, message: 'testId tidak ditemukan' });
        }
        if (!role || (role !== 'user' && role !== 'partner')) {
            return res.status(400).json({ success: false, message: 'Role tidak valid' });
        }
        if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
            return res.status(400).json({ success: false, message: 'Jawaban tidak valid' });
        }

        const validAnswers = {};
        for (const [key, value] of Object.entries(answers)) {
            const num = parseInt(value);
            if (isNaN(num) || num < 1 || num > 5) {
                return res.status(400).json({ success: false, message: 'Nilai harus 1-5' });
            }
            validAnswers[key] = num;
        }

        if (Object.keys(validAnswers).length < 64) {
            return res.status(400).json({
                success: false,
                message: `Jawaban tidak lengkap (${Object.keys(validAnswers).length}/64)`
            });
        }

        const testRef = db.collection('wellness_tests').doc(testId);
        const testDoc = await testRef.get();

        if (!testDoc.exists) {
            return res.status(404).json({ success: false, message: 'Test tidak ditemukan' });
        }

        const testData = testDoc.data();

        const isOwner = testData.userId === userId;
        const isPartner = testData.partnerUserId === userId && role === 'partner';

        if (!isOwner && role === 'user') {
            return res.status(403).json({ success: false, message: 'Akses ditolak' });
        }

        if (role === 'partner') {
            if (testData.partnerCompleted) {
                return res.status(400).json({ success: false, message: 'Pasangan sudah mengisi' });
            }
            if (!testData.userCompleted) {
                return res.status(400).json({ success: false, message: 'Pasangan Anda harus mengisi terlebih dahulu' });
            }
        }

        if (role === 'user' && testData.userCompleted) {
            return res.status(400).json({ success: false, message: 'Anda sudah mengisi tes ini' });
        }

        const updateData = {
            [`${role}Answers`]: validAnswers,
            [`${role}Completed`]: true,
            [`${role}CompletedAt`]: admin.firestore.FieldValue.serverTimestamp()
        };

        if (role === 'partner') {
            updateData.partnerUserId = userId;
        }

        const isComplete = (role === 'user' && testData.partnerCompleted) ||
            (role === 'partner' && testData.userCompleted);

        if (isComplete) {
            const userAnswers = role === 'user' ? validAnswers : testData.userAnswers;
            const partnerAnswers = role === 'partner' ? validAnswers : testData.partnerAnswers;
            updateData.results = calculateWellnessResults(userAnswers, partnerAnswers);
            updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
        }

        await testRef.update(updateData);

        const updatedDoc = await testRef.get();
        const data = updatedDoc.data();

        res.json({
            success: true,
            testId,
            isComplete: !!data.results,
            results: data.results || null,
            inviteCode: data.inviteCode || null,
            message: isComplete ? 'Tes selesai!' : 'Jawaban tersimpan. Tunggu pasangan.'
        });

    } catch (error) {
        console.error('Submit answers error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

// 4. VERIFY INVITE CODE
app.post('/api/wellness/verify-invite', verifyFirebaseToken, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.user.uid;

        if (!inviteCode || typeof inviteCode !== 'string') {
            return res.status(400).json({ success: false, message: 'Kode tidak valid' });
        }

        const code = inviteCode.trim().toUpperCase();
        if (!/^WELL-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
            return res.status(400).json({ success: false, message: 'Format kode tidak valid' });
        }

        const snapshot = await db.collection('wellness_tests')
            .where('inviteCode', '==', code)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'Kode tidak valid' });
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        if (data.userId === userId) {
            if (data.userCompleted) {
                return res.status(400).json({ success: false, message: 'Anda sudah mengisi tes ini' });
            }
            return res.json({ success: true, testId: doc.id, role: 'user', data: { userId: data.userId, userCompleted: data.userCompleted, partnerCompleted: data.partnerCompleted } });
        } else {
            if (data.partnerCompleted) {
                return res.status(400).json({ success: false, message: 'Pasangan sudah mengisi tes ini' });
            }
            if (!data.userCompleted) {
                return res.status(400).json({ success: false, message: 'Pasangan Anda harus mengisi tes terlebih dahulu' });
            }
            await doc.ref.update({ partnerUserId: userId });
            return res.json({ success: true, testId: doc.id, role: 'partner', data: { userId: data.userId, partnerUserId: userId, userCompleted: data.userCompleted, partnerCompleted: data.partnerCompleted } });
        }

    } catch (error) {
        console.error('Verify invite error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

// 5. GET WELLNESS RESULT BY TEST ID
app.get('/api/wellness/result/:testId', verifyFirebaseToken, async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.user.uid;

        const doc = await db.collection('wellness_tests').doc(testId).get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Test tidak ditemukan' });
        }

        const data = doc.data();

        if (data.userId !== userId && data.partnerUserId !== userId) {
            return res.status(403).json({ success: false, message: 'Akses ditolak' });
        }

        if (!data.results) {
            return res.json({ success: true, data: null, message: 'Hasil belum tersedia' });
        }

        res.json({
            success: true,
            data: {
                results: data.results,
                userCompleted: data.userCompleted,
                partnerCompleted: data.partnerCompleted,
                inviteCode: data.inviteCode
            }
        });

    } catch (error) {
        console.error('Get result error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

// ============================================================
//  🔥 HELPER FUNCTIONS
// ============================================================

function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = [];
    for (let i = 0; i < 3; i++) {
        let seg = '';
        for (let j = 0; j < 4; j++) {
            seg += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        segments.push(seg);
    }
    return `WELL-${segments[0]}-${segments[1]}-${segments[2]}`;
}

function calculateWellnessResults(userAnswers, partnerAnswers) {
    const dimMap = {
        komunikasi: [1, 2, 3, 4, 5, 6, 7, 8],
        kepercayaan: [9, 10, 11, 12, 13, 14, 15, 16],
        resolusi_konflik: [17, 18, 19, 20, 21, 22, 23, 24],
        dukungan_emosional: [25, 26, 27, 28, 29, 30, 31, 32],
        waktu_berkualitas: [33, 34, 35, 36, 37, 38, 39, 40],
        komitmen: [41, 42, 43, 44, 45, 46, 47, 48],
        penghargaan: [49, 50, 51, 52, 53, 54, 55, 56],
        keuangan: [57, 58, 59, 60, 61, 62, 63, 64]
    };

    const dimensionScores = {};
    let totalUser = 0;
    let totalPartner = 0;
    const maxPerDimension = 40;

    Object.entries(dimMap).forEach(([dim, ids]) => {
        let userSum = 0;
        let partnerSum = 0;
        ids.forEach(id => {
            userSum += userAnswers[id] || 0;
            partnerSum += partnerAnswers[id] || 0;
        });
        const userPercent = (userSum / maxPerDimension) * 100;
        const partnerPercent = (partnerSum / maxPerDimension) * 100;
        const avgPercent = (userPercent + partnerPercent) / 2;
        dimensionScores[dim] = Math.round(avgPercent);
        totalUser += userSum;
        totalPartner += partnerSum;
    });

    const maxTotal = 320;
    const userTotalPercent = (totalUser / maxTotal) * 100;
    const partnerTotalPercent = (totalPartner / maxTotal) * 100;
    const wellnessScore = Math.round((userTotalPercent + partnerTotalPercent) / 2);

    let category = '';
    if (wellnessScore >= 85) category = 'Sangat Kuat';
    else if (wellnessScore >= 70) category = 'Cukup Sehat';
    else if (wellnessScore >= 55) category = 'Perlu Diperkuat';
    else category = 'Perlu Perhatian';

    const sorted = Object.entries(dimensionScores).sort((a, b) => b[1] - a[1]);
    const strengths = sorted.slice(0, 3).map(([dim, score]) => ({ dimension: dim, score }));
    const priorities = sorted.slice(-3).reverse().map(([dim, score]) => ({ dimension: dim, score }));

    const riskQuestions = [5, 13, 19, 54];
    const riskSignals = [];
    riskQuestions.forEach(qId => {
        const userAns = userAnswers[qId] || 0;
        const partnerAns = partnerAnswers[qId] || 0;
        if (userAns <= 2 || partnerAns <= 2) {
            riskSignals.push({ questionId: qId, userScore: userAns, partnerScore: partnerAns });
        }
    });

    const riskDetected = {
        detected: riskSignals.length > 0,
        signals: riskSignals,
        level: riskSignals.length > 3 ? 'high' : riskSignals.length > 1 ? 'medium' : 'low'
    };

    return {
        wellnessScore,
        category,
        dimensionScores,
        strengths,
        priorities,
        riskDetected,
        totalUser,
        totalPartner,
        maxTotal
    };
}

// ============================================================
//  🔥 ROUTING HALAMAN
// ============================================================

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../public/login.html')));
app.get('/love-language', (req, res) => res.sendFile(path.join(__dirname, '../public/love-language.html')));
app.get('/hasil', (req, res) => res.sendFile(path.join(__dirname, '../public/hasil.html')));
app.get('/relationship-check', (req, res) => res.sendFile(path.join(__dirname, '../public/relationship-check.html')));
app.get('/profil', (req, res) => res.sendFile(path.join(__dirname, '../public/profil.html')));
app.get('/artikel', (req, res) => res.sendFile(path.join(__dirname, '../public/artikel/index.html')));
app.get('/artikel/detail', (req, res) => res.sendFile(path.join(__dirname, '../public/artikel/detail.html')));
app.get('/ebook', (req, res) => res.redirect(301, '/artikel'));
app.get('/ebook/detail', (req, res) => res.sendFile(path.join(__dirname, '../public/ebook/detail.html')));
app.get('/video', (req, res) => res.sendFile(path.join(__dirname, '../public/video/index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../public/admin/index.html')));
app.get('/admin/login', (req, res) => res.sendFile(path.join(__dirname, '../public/admin/login.html')));

app.get('/*.html', (req, res) => res.redirect(301, req.originalUrl.replace(/\.html$/, '')));
app.get('/login/admin', (req, res) => res.redirect('/admin'));
app.get('/admin/login/', (req, res) => res.redirect('/admin/login'));

// 404 Handler
app.use((req, res) => {
    const filePath = path.join(__dirname, '../public', req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return res.sendFile(filePath);
    const htmlPath = path.join(__dirname, '../public', req.path + '.html');
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) return res.sendFile(htmlPath);

    res.status(404).send(`<!DOCTYPE html><html><head><title>404</title><style>body{font-family:Arial;text-align:center;padding:50px;background:#fdf6f2}h1{font-size:72px;color:#1d3b36}p{color:#5a6f6a}a{color:#f8b4c8;text-decoration:none;font-weight:600}</style></head><body><h1>404</h1><p>Halaman tidak ditemukan.</p><a href="/">← Kembali ke Beranda</a></body></html>`);
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server: http://localhost:${PORT}`);
        console.log(`📁 Admin: http://localhost:${PORT}/admin`);
        console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✅ dari env' : '⚠️  auto-generated (session-only)'}`);
    });
}
