// ============================================================
//  🌱 SEED CHALLENGES — Bank Tantangan Harian (idempotent)
//  Jalankan: node scripts/seed-challenges.js
//  Aman dijalankan ulang (set merge per dokumen)
// ============================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('❌ Firebase credentials tidak lengkap! Cek .env');
    process.exit(1);
}

const admin = require('firebase-admin');

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ============================================================
//  30 TANTANGAN — tersebar di 8 dimensi wellness
//  (komunikasi 4, kepercayaan 4, resolusi_konflik 4,
//   dukungan_emosional 4, waktu_berkualitas 4,
//   komitmen 3, penghargaan 4, keuangan 3)
// ============================================================
const CHALLENGES = [
    // ── KOMUNIKASI ──
    { id: 'ch001', category: 'komunikasi', order: 1, text: 'Kirim pesan suara menceritakan satu hal terbaik yang terjadi padamu hari ini.' },
    { id: 'ch002', category: 'komunikasi', order: 2, text: 'Tanyakan satu hal yang belum kamu ketahui tentang mimpi pasanganmu.' },
    { id: 'ch003', category: 'komunikasi', order: 3, text: 'Ucapkan terima kasih untuk satu hal kecil yang pasanganmu lakukan hari ini, dan sebutkan alasannya.' },
    { id: 'ch004', category: 'komunikasi', order: 4, text: 'Mulai percakapan dengan kalimat "Aku ingin dengar cerita harimu" dan dengarkan tanpa memotong.' },

    // ── KEPERCAYAAN ──
    { id: 'ch005', category: 'kepercayaan', order: 5, text: 'Tepati satu janji kecil yang selama ini kamu tunda.' },
    { id: 'ch006', category: 'kepercayaan', order: 6, text: 'Ceritakan satu rasa takutmu kepada pasanganmu, sekecil apa pun itu.' },
    { id: 'ch007', category: 'kepercayaan', order: 7, text: 'Berikan akses kepada pasanganmu untuk satu hal yang biasanya kamu jaga sendiri (HP, akun, atau jadwalmu).' },
    { id: 'ch008', category: 'kepercayaan', order: 8, text: 'Jawab dengan jujur saat pasangan bertanya "bagaimana harimu?" — tanpa filter.' },

    // ── RESOLUSI KONFLIK ──
    { id: 'ch009', category: 'resolusi_konflik', order: 9, text: 'Selesaikan satu ketidaksepakatan kecil dengan kalimat "Saya merasa..." tanpa menyalahkan.' },
    { id: 'ch010', category: 'resolusi_konflik', order: 10, text: 'Kalau ada yang mengganjal, ungkapkan hari ini dengan nada lembut — jangan dipendam.' },
    { id: 'ch011', category: 'resolusi_konflik', order: 11, text: 'Tulis satu hal yang ingin kalian perbaiki dari cara bertengkar, lalu diskusikan 10 menit.' },
    { id: 'ch012', category: 'resolusi_konflik', order: 12, text: 'Minta maaf untuk satu hal yang selama ini belum kamu akui.' },

    // ── DUKUNGAN EMOSIONAL ──
    { id: 'ch013', category: 'dukungan_emosional', order: 13, text: 'Berikan pelukan 20 detik tanpa bicara saat pasanganmu pulang atau bangun tidur.' },
    { id: 'ch014', category: 'dukungan_emosional', order: 14, text: 'Tanyakan "Apa yang bisa aku bantu supaya harimu lebih ringan?" dan benar-benar lakukan.' },
    { id: 'ch015', category: 'dukungan_emosional', order: 15, text: 'Kirim satu pesan penyemangat di jam-jam sibuk pasanganmu.' },
    { id: 'ch016', category: 'dukungan_emosional', order: 16, text: 'Dengarkan keluh kesah pasanganmu hari ini tanpa memberi solusi — cukup hadir.' },

    // ── WAKTU BERKUALITAS ──
    { id: 'ch017', category: 'waktu_berkualitas', order: 17, text: 'Matikan HP selama 30 menit dan habiskan waktu penuh bersama tanpa distraksi.' },
    { id: 'ch018', category: 'waktu_berkualitas', order: 18, text: 'Masak atau pesan makanan favorit pasanganmu, lalu makan bersama tanpa TV/HP.' },
    { id: 'ch019', category: 'waktu_berkualitas', order: 19, text: 'Jalan santai 15 menit bersama sambil bercerita tentang rencana liburan impian kalian.' },
    { id: 'ch020', category: 'waktu_berkualitas', order: 20, text: 'Lakukan satu hobi pasanganmu bersamanya hari ini, meski itu bukan kesukaanmu.' },

    // ── KOMITMEN ──
    { id: 'ch021', category: 'komitmen', order: 21, text: 'Tulis 3 hal yang kalian berdua syukuri dari hubungan ini dan bacakan satu sama lain.' },
    { id: 'ch022', category: 'komitmen', order: 22, text: 'Diskusikan satu tujuan kecil yang bisa kalian capai bersama bulan ini.' },
    { id: 'ch023', category: 'komitmen', order: 23, text: 'Buat ritual kecil harian berdua (misal: pesan pagi atau cium selamat pagi) dan mulai hari ini.' },

    // ── PENGHARGAAN ──
    { id: 'ch024', category: 'penghargaan', order: 24, text: 'Ucapkan satu apresiasi tulus kepada pasanganmu di depan orang lain hari ini.' },
    { id: 'ch025', category: 'penghargaan', order: 25, text: 'Tuliskan 5 hal yang kamu kagumi dari pasanganmu dan berikan sebagai catatan.' },
    { id: 'ch026', category: 'penghargaan', order: 26, text: 'Puji satu hal spesifik yang pasanganmu lakukan hari ini — bukan yang umum.' },
    { id: 'ch027', category: 'penghargaan', order: 27, text: 'Buatkan kejutan kecil (makanan/minuman favoritnya) sebagai tanda terima kasih.' },

    // ── KEUANGAN ──
    { id: 'ch028', category: 'keuangan', order: 28, text: 'Duduk 10 menit berdua dan buat daftar pengeluaran mingguan tanpa saling menyalahkan.' },
    { id: 'ch029', category: 'keuangan', order: 29, text: 'Sepakati satu target tabungan kecil bersama dan tentukan langkah pertamanya.' },
    { id: 'ch030', category: 'keuangan', order: 30, text: 'Rencanakan satu "date hemat" untuk akhir pekan ini dan hitung anggarannya.' }
];

// ============================================================
//  🔥 SEED — batch set dengan merge (idempotent)
// ============================================================
async function seedChallenges() {
    try {
        const batch = db.batch();
        CHALLENGES.forEach(function (c) {
            batch.set(db.collection('challenges').doc(c.id), {
                text: c.text,
                category: c.category,
                order: c.order,
                active: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        });
        await batch.commit();
        console.log('✅ ' + CHALLENGES.length + ' tantangan tersinkron ke Firestore');
        process.exit(0);
    } catch (error) {
        console.error('❌ Gagal seed:', error.message);
        process.exit(1);
    }
}

seedChallenges();
