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