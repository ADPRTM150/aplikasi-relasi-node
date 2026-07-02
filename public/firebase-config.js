// firebase-config.js
// 🔥 Firebase Config dari project "aplikasi-relasi"

const firebaseConfig = {
    apiKey: "AIzaSyAO7fOMHvFoxHgVTCW4t2wcDzI6eUvhdgE",
    authDomain: "aplikasi-relasi.firebaseapp.com",
    projectId: "aplikasi-relasi",
    storageBucket: "aplikasi-relasi.firebasestorage.app",
    messagingSenderId: "1022531016069",
    appId: "1:1022531016069:web:bb628156a7a4e3721e60ec"
};

// ============================================================
//  INISIALISASI FIREBASE
// ============================================================
firebase.initializeApp(firebaseConfig);

// ============================================================
//  AUTH & DATABASE
// ============================================================
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================================
//  FUNGSI LOGIN & LOGOUT
// ============================================================
function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            simpanUser(user);
            window.location.href = 'index.html';
        })
        .catch((error) => {
            alert('Login gagal: ' + error.message);
        });
}

function logout() {
    auth.signOut().then(() => {
        window.location.reload();
    });
}

// ============================================================
//  FUNGSI SIMPAN USER KE FIRESTORE
// ============================================================
function simpanUser(user) {
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
//  CEK STATUS LOGIN
// ============================================================
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('✅ Login sebagai:', user.displayName);
    } else {
        console.log('❌ Belum login');
    }
});