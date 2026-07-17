// public/firebase-config.js

// ============================================================
//  🔥 FIREBASE CONFIG
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyAO7fOMHvFoxHgVTCW4t2wcDzI6eUvhdgE",
    authDomain: "aplikasi-relasi.firebaseapp.com",
    projectId: "aplikasi-relasi",
    storageBucket: "aplikasi-relasi.firebasestorage.app",
    messagingSenderId: "1022531016069",
    appId: "1:1022531016069:web:bb628156a7a4e3721e60ec"
};

// Inisialisasi Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized!');
}

const auth = firebase.auth();
const db = firebase.firestore();

// ============================================================
//  🔥 LOGIN WITH GOOGLE (REDIRECT - TANPA POPUP)
// ============================================================
function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider);
}

// ============================================================
//  🔥 HANDLE REDIRECT RESULT
// ============================================================
auth.getRedirectResult()
    .then((result) => {
        if (result.user) {
            const user = result.user;
            console.log('✅ Login berhasil:', user.displayName);
            simpanUser(user);
            window.location.replace('/');
        }
    })
    .catch((error) => {
        console.error('❌ Redirect error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            alert('Login gagal: ' + error.message);
        }
    });

// ============================================================
//  🔥 LOGOUT
// ============================================================
function logout() {
    auth.signOut().then(() => {
        window.location.replace('/login');
    });
}

// ============================================================
//  🔥 SIMPAN USER
// ============================================================
function simpanUser(user) {
    localStorage.setItem('userName', user.displayName || 'Pengguna');
    const userRef = db.collection('users').doc(user.uid);
    userRef.set({
        uid: user.uid,
        nama: user.displayName || 'Pengguna',
        email: user.email,
        foto: user.photoURL || '',
        gender: localStorage.getItem('userGender') || '',
        status: localStorage.getItem('userStatus') || '',
        loveLanguage: JSON.parse(localStorage.getItem('loveLanguageResult') || '{}'),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

// ============================================================
//  FUNGSI LOG ACTIVITY - UNTUK WEBSITE UTAMA
// ============================================================

// Simpan aktivitas user ke Firestore
async function logUserActivity(activityData) {
    try {
        // Pastikan user sudah login
        const user = auth.currentUser;
        if (!user) {
            console.warn('⚠️ User tidak login, activity tidak disimpan');
            return;
        }
        
        // Tambahkan data user
        const data = {
            ...activityData,
            userId: user.uid,
            userEmail: user.email || '-',
            userName: user.displayName || user.email?.split('@')[0] || 'Pengguna',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Simpan ke Firestore
        await db.collection('activities').add(data);
        console.log('✅ Activity logged:', data.type);
    } catch (error) {
        console.error('❌ Error logging activity:', error);
    }
}

// Fungsi untuk log user login
async function logUserLogin() {
    const user = auth.currentUser;
    if (user) {
        await logUserActivity({
            type: 'user_login',
            icon: '👤',
            priority: 'normal',
            details: {
                loginMethod: 'email',
                device: navigator.userAgent || 'unknown'
            }
        });
    }
}

// Fungsi untuk log user logout
async function logUserLogout() {
    const user = auth.currentUser;
    if (user) {
        await logUserActivity({
            type: 'user_logout',
            icon: '🚪',
            priority: 'normal',
            details: {}
        });
    }
}

// Fungsi untuk log test completed
async function logTestCompleted(testData) {
    const user = auth.currentUser;
    if (user) {
        await logUserActivity({
            type: 'test_completed',
            icon: '📝',
            priority: 'high',
            details: {
                score: testData.wellnessScore || 0,
                category: testData.category || 'N/A',
                testId: testData.id || 'unknown'
            }
        });
    }
}

// Fungsi untuk log couple connected
async function logCoupleConnected(coupleData) {
    const user = auth.currentUser;
    if (user) {
        // Ambil data partner
        let partnerName = 'Pasangan';
        if (coupleData.partnerUserId) {
            try {
                const partnerDoc = await db.collection('users').doc(coupleData.partnerUserId).get();
                if (partnerDoc.exists) {
                    partnerName = partnerDoc.data().nama || partnerDoc.data().name || 'Pasangan';
                }
            } catch (e) {}
        }
        
        await logUserActivity({
            type: 'couple_connected',
            icon: '💑',
            priority: 'high',
            details: {
                partnerName: partnerName,
                coupleCode: coupleData.inviteCode || 'N/A',
                partnerUserId: coupleData.partnerUserId || ''
            }
        });
    }
}

// Fungsi untuk log article read
async function logArticleRead(article) {
    const user = auth.currentUser;
    if (user) {
        await logUserActivity({
            type: 'article_read',
            icon: '📖',
            priority: 'normal',
            details: {
                articleId: article.id || 'unknown',
                articleTitle: article.title || 'Artikel',
                category: article.category || 'Lainnya'
            }
        });
    }
}

// Fungsi untuk log ebook purchased
async function logEbookPurchased(ebook, price) {
    const user = auth.currentUser;
    if (user) {
        await logUserActivity({
            type: 'ebook_purchased',
            icon: '📚',
            priority: 'high',
            details: {
                ebookId: ebook.id || 'unknown',
                ebookTitle: ebook.title || 'Ebook',
                price: price || 0
            }
        });
    }
}

// ============================================================
//  LISTENER AUTH - LOG LOGIN/LOGOUT OTOMATIS
// ============================================================

// Listen untuk perubahan auth state
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User login - log aktivitas
        await logUserLogin();
        console.log('👤 User logged in:', user.email);
    } else {
        // User logout
        console.log('👤 User logged out');
    }
});

// Ekspor fungsi ke global
window.logUserActivity = logUserActivity;
window.logUserLogin = logUserLogin;
window.logUserLogout = logUserLogout;
window.logTestCompleted = logTestCompleted;
window.logCoupleConnected = logCoupleConnected;
window.logArticleRead = logArticleRead;
window.logEbookPurchased = logEbookPurchased;

// ============================================================
//  🔥 API BASE URL
// ============================================================
const API_BASE = window.location.origin + '/api';
console.log('✅ API_BASE:', API_BASE);

// ============================================================
//  🔥 EXPOSE KE GLOBAL (untuk diakses tanpa module)
// ============================================================
window.API_BASE = API_BASE;
window.auth = auth;
window.db = db;
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.simpanUser = simpanUser;
window.firebaseApp = firebase;

console.log('✅ Firebase Config loaded with Google Login!');