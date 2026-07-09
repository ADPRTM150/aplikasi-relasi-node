require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
//  🔥 EXPRESS APP
// ============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
//  🔥 MIDDLEWARE
// ============================================================

// Security Headers
app.use((req, res, next) => {
    res.removeHeader('Cross-Origin-Opener-Policy');
    res.removeHeader('Cross-Origin-Embedder-Policy');
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000', 'https://aplikasi-relasi-node.vercel.app'],
    credentials: true
}));

// ============================================================
//  🔥 SERVE STATIC FILES DULUAN
// ============================================================
app.use((req, res, next) => {
    // Lewati request API
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    const filePath = path.join(__dirname, '../public', req.path);
    
    // Jika file ada di public, langsung kirim
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return res.sendFile(filePath);
    }
    
    // Jika file dengan .html ada
    const htmlPath = path.join(__dirname, '../public', req.path + '.html');
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
        return res.sendFile(htmlPath);
    }
    
    next();
});

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Redirect .html → tanpa .html
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
//  🔥 ADMIN LOGIN (PAKAI JWT + BCRYPT)
// ============================================================
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email dan password wajib diisi' 
            });
        }

        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email atau password salah' 
            });
        }

        const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (!isValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email atau password salah' 
            });
        }

        const token = jwt.sign(
            { email, role: 'admin' },
            process.env.JWT_SECRET || 'relasi_super_secret_key_change_this_12345',
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'relasi_super_secret_key_change_this_12345');
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token tidak valid' 
        });
    }
};

// ============================================================
//  🔥 ADMIN PROTECTED ROUTE
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
        const snapshot = await db.collection('users').get();
        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan server' 
        });
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

// 2. GET TEST
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
        
        if (data.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Akses ditolak' });
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

        console.log('🔍 Received submit request:');
        console.log('  testId:', testId);
        console.log('  role:', role);
        console.log('  answers count:', Object.keys(answers || {}).length);

        if (!testId) {
            return res.status(400).json({ 
                success: false, 
                message: 'testId tidak ditemukan' 
            });
        }

        if (!role) {
            return res.status(400).json({ 
                success: false, 
                message: 'role tidak ditemukan' 
            });
        }

        if (!answers || typeof answers !== 'object' || Array.isArray(answers) || Object.keys(answers).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Jawaban tidak valid atau kosong' 
            });
        }

        if (role !== 'user' && role !== 'partner') {
            return res.status(400).json({ 
                success: false, 
                message: 'Role tidak valid. Harus "user" atau "partner"' 
            });
        }

        const validAnswers = {};
        let isValid = true;
        let questionCount = 0;
        
        for (const [key, value] of Object.entries(answers)) {
            const num = parseInt(value);
            if (isNaN(num) || num < 1 || num > 5) {
                isValid = false;
                console.warn('⚠️ Invalid answer:', key, value);
                break;
            }
            validAnswers[key] = num;
            questionCount++;
        }

        if (!isValid) {
            return res.status(400).json({ 
                success: false, 
                message: 'Jawaban tidak valid. Nilai harus 1-5.' 
            });
        }

        if (questionCount < 64) {
            return res.status(400).json({ 
                success: false, 
                message: `Jawaban tidak lengkap. Harus 64 pertanyaan, saat ini ${questionCount}.` 
            });
        }

        const testRef = db.collection('wellness_tests').doc(testId);
        const testDoc = await testRef.get();
        
        if (!testDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: 'Test tidak ditemukan' 
            });
        }
        
        const testData = testDoc.data();
        
        if (testData.userId !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Akses ditolak' 
            });
        }

        if (role === 'user' && testData.userCompleted) {
            return res.status(400).json({ 
                success: false, 
                message: 'Anda sudah mengisi tes ini' 
            });
        }
        
        if (role === 'partner' && testData.partnerCompleted) {
            return res.status(400).json({ 
                success: false, 
                message: 'Pasangan sudah mengisi tes ini' 
            });
        }

        const updateData = {
            [`${role}Answers`]: validAnswers,
            [`${role}Completed`]: true,
            [`${role}CompletedAt`]: admin.firestore.FieldValue.serverTimestamp()
        };

        const isComplete = (role === 'user' && testData.partnerCompleted) ||
                           (role === 'partner' && testData.userCompleted);

        if (isComplete) {
            const userAnswers = role === 'user' ? validAnswers : testData.userAnswers;
            const partnerAnswers = role === 'partner' ? validAnswers : testData.partnerAnswers;
            const results = calculateWellnessResults(userAnswers, partnerAnswers);
            updateData.results = results;
            updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
        }

        await testRef.update(updateData);
        
        const updatedDoc = await testRef.get();
        const data = updatedDoc.data();

        res.json({
            success: true,
            testId: testId,
            isComplete: !!data.results,
            results: data.results || null,
            inviteCode: data.inviteCode || null,
            message: isComplete ? 'Tes selesai! Hasil sudah tersedia.' : 'Jawaban tersimpan. Tunggu pasangan.'
        });

    } catch (error) {
        console.error('❌ Submit answers error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan server: ' + error.message 
        });
    }
});

// 4. VERIFY INVITE CODE
app.post('/api/wellness/verify-invite', verifyFirebaseToken, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.user.uid;
        
        if (!inviteCode || typeof inviteCode !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode tidak valid' 
            });
        }

        const code = inviteCode.trim().toUpperCase();
        const codePattern = /^WELL-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        if (!codePattern.test(code)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Format kode tidak valid. Contoh: WELL-ABCD-1234-EFGH' 
            });
        }

        const snapshot = await db.collection('wellness_tests')
            .where('inviteCode', '==', code)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kode tidak valid' 
            });
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        console.log('🔍 Verify invite:');
        console.log('  userId (current):', userId);
        console.log('  test owner:', data.userId);
        console.log('  userCompleted:', data.userCompleted);
        console.log('  partnerCompleted:', data.partnerCompleted);

        // 🔥 CEK: User ini pemilik test?
        const isOwner = data.userId === userId;

        if (isOwner) {
            // PEMILIK TEST
            if (data.userCompleted) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Anda sudah mengisi tes ini' 
                });
            }
            // Pemilik bisa mengisi sebagai 'user'
            return res.json({
                success: true,
                testId: doc.id,
                role: 'user',
                data: {
                    userId: data.userId,
                    userCompleted: data.userCompleted,
                    partnerCompleted: data.partnerCompleted,
                    startedAt: data.startedAt
                }
            });
        } else {
            // BUKAN PEMILIK → BERARTI PARTNER!
            if (data.partnerCompleted) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Pasangan sudah mengisi tes ini' 
                });
            }
            if (!data.userCompleted) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Pasangan Anda harus mengisi tes terlebih dahulu' 
                });
            }
            // Partner bisa mengisi sebagai 'partner'
            return res.json({
                success: true,
                testId: doc.id,
                role: 'partner',  // ← KIRIM ROLE PARTNER!
                data: {
                    userId: data.userId,
                    userCompleted: data.userCompleted,
                    partnerCompleted: data.partnerCompleted,
                    startedAt: data.startedAt
                }
            });
        }

    } catch (error) {
        console.error('Verify invite error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan server' 
        });
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
//  🔥 ROUTING HALAMAN - TANPA .html
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

app.get('/relationship-check', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/relationship-check.html'));
});

app.get('/profil', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/profil.html'));
});

app.get('/artikel', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/artikel/index.html'));
});

app.get('/artikel/detail', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/artikel/detail.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/login.html'));
});

// ============================================================
//  🔥 REDIRECT & ERROR HANDLER
// ============================================================

// Redirect .html ke tanpa .html
app.get('/*.html', (req, res) => {
    const url = req.originalUrl.replace(/\.html$/, '');
    res.redirect(301, url);
});

app.get('/login/admin', (req, res) => {
    res.redirect('/admin');
});

app.get('/admin/login/', (req, res) => {
    res.redirect('/admin/login');
});

// 404 Handler
app.use((req, res) => {
    // Cek apakah file statis ada
    const filePath = path.join(__dirname, '../public', req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return res.sendFile(filePath);
    }
    
    // Cek apakah file dengan .html ada
    const htmlPath = path.join(__dirname, '../public', req.path + '.html');
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
        return res.sendFile(htmlPath);
    }
    
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Halaman Tidak Ditemukan</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #fdf6f2; }
                h1 { font-size: 72px; color: #1d3b36; }
                p { color: #5a6f6a; }
                a { color: #f8b4c8; text-decoration: none; font-weight: 600; }
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

// Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================================
//  🔥 EXPORT UNTUK VERCEL
// ============================================================
module.exports = app;

// ============================================================
//  🔥 START SERVER (hanya jika dijalankan langsung)
// ============================================================
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
        console.log(`📁 Admin: http://localhost:${PORT}/admin`);
        console.log(`🔑 Login Admin: http://localhost:${PORT}/admin/login`);
        console.log(`🧠 Wellness API: http://localhost:${PORT}/api/wellness/start`);
    });
}