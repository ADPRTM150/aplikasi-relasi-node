// public/firebase-config.js
// 🔥 Config diambil dari server via API, jadi API Key TIDAK ADA di sini!

let firebaseConfig = {};
let auth, db;

// ============================================================
//  AMBIL CONFIG DARI SERVER
// ============================================================
async function loadFirebaseConfig() {
    try {
        const response = await fetch('/api/firebase-config');
        if (!response.ok) throw new Error('Gagal mengambil config');
        
        const config = await response.json();
        firebaseConfig = config;
        
        // Inisialisasi Firebase
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        
        console.log('✅ Firebase initialized from server!');
        
        // Setelah inisialisasi, cek status login
        cekStatusLogin();
        
    } catch (error) {
        console.error('❌ Gagal load Firebase config:', error);
        alert('Gagal terhubung ke server. Pastikan server berjalan!');
    }
}

// ============================================================
//  FUNGSI LOGIN & LOGOUT
// ============================================================
function loginWithGoogle() {
    if (!auth) {
        alert('Firebase belum siap, coba lagi nanti.');
        return;
    }
    
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
    if (!auth) {
        alert('Firebase belum siap, coba lagi nanti.');
        return;
    }
    
    auth.signOut().then(() => {
        window.location.reload();
    });
}

// ============================================================
//  FUNGSI SIMPAN USER KE FIRESTORE
// ============================================================
function simpanUser(user) {
    if (!db) {
        console.error('Firestore belum siap');
        return;
    }
    
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
function cekStatusLogin() {
    if (!auth) return;
    
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('✅ Login sebagai:', user.displayName);
            // Update UI user area jika ada
            updateUserUI(user);
        } else {
            console.log('❌ Belum login');
        }
    });
}

// ============================================================
//  UPDATE UI USER AREA
// ============================================================
function updateUserUI(user) {
    const userArea = document.getElementById('userArea');
    if (!userArea) return;
    
    if (user) {
        const foto = user.photoURL || '';
        const nama = user.displayName || 'Pengguna';
        userArea.innerHTML = `
            <button class="profile-trigger" onclick="toggleDropdown()">
                ${foto ? `<img src="${foto}" class="avatar" />` : '<div class="avatar-placeholder">👤</div>'}
                <span>${nama}</span>
                <span class="arrow">▼</span>
            </button>
            <div class="user-dropdown" id="userDropdown">
                <a href="/profil.html" class="dropdown-item">👤 Profil</a>
                <a href="/hasil" class="dropdown-item">📊 Hasil</a>
                <a href="/love-language" class="dropdown-item">❤️ Love Language</a>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item logout" onclick="logout()">🚪 Logout</button>
            </div>
        `;
    } else {
        userArea.innerHTML = `
            <button class="profile-trigger" onclick="window.location.href='/login'">
                <div class="avatar-placeholder">👤</div>
                <span>Login</span>
            </button>
        `;
    }
}

// ============================================================
//  TOGGLE DROPDOWN
// ============================================================
function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    const arrow = document.querySelector('.arrow');
    if (dropdown) {
        dropdown.classList.toggle('show');
        if (arrow) arrow.classList.toggle('open');
    }
}

// Tutup dropdown saat klik di luar
document.addEventListener('click', function(event) {
    const userArea = document.getElementById('userArea');
    if (userArea && !userArea.contains(event.target)) {
        const dropdown = document.getElementById('userDropdown');
        const arrow = document.querySelector('.arrow');
        if (dropdown) {
            dropdown.classList.remove('show');
            if (arrow) arrow.classList.remove('open');
        }
    }
});

// ============================================================
//  START: Load Firebase Config
// ============================================================
loadFirebaseConfig();