// public/firebase-config.js
// 🔥 SEMENTARA: Hardcode dulu untuk testing (nanti kita pindah ke .env)

const firebaseConfig = {
    apiKey: "AIzaSyAO7fOMHvFoxHgVTCW4t2wcDzI6eUvhdgE",
    authDomain: "aplikasi-relasi.firebaseapp.com",
    projectId: "aplikasi-relasi",
    storageBucket: "aplikasi-relasi.firebasestorage.app",
    messagingSenderId: "1022531016069",
    appId: "1:1022531016069:web:bb628156a7a4e3721e60ec"
};

firebase.initializeApp(firebaseConfig);

console.log('✅ Firebase initialized!');

const auth = firebase.auth();
const db = firebase.firestore();

function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            simpanUser(user);
            window.location.href = '/';
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