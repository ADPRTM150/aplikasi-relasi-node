// ============================================================
//  🔥 FIREBASE CONFIG - OPTIMAL DENGAN SESSION STORAGE
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyAO7fOMHvFoxHgVTCW4t2wcDzI6eUvhdgE",
  authDomain: "aplikasi-relasi.firebaseapp.com",
  projectId: "aplikasi-relasi",
  storageBucket: "aplikasi-relasi.firebasestorage.app",
  messagingSenderId: "1022531016069",
  appId: "1:1022531016069:web:bb628156a7a4e3721e60ec",
};

// Inisialisasi Firebase
if (typeof firebase !== "undefined" && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized!");
}

const auth = firebase.auth();
const db = firebase.firestore();

// ============================================================
//  🔥 SESSION STORAGE HELPER
// ============================================================
const SessionLog = {
  // Cek apakah sudah di-log di session ini
  has: function(key) {
    return sessionStorage.getItem(key) === 'true';
  },
  
  // Tandai sudah di-log
  set: function(key) {
    sessionStorage.setItem(key, 'true');
  },
  
  // Hapus semua log untuk user
  clearAll: function(userId) {
    const keys = Object.keys(sessionStorage);
    keys.forEach(function(key) {
      if (key.includes(userId)) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

// ============================================================
//  🔥 LOGIN WITH GOOGLE
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
      console.log("✅ Login berhasil:", user.displayName);
      simpanUser(user);
      window.location.replace("/");
    }
  })
  .catch((error) => {
    console.error("❌ Redirect error:", error);
    if (error.code !== "auth/popup-closed-by-user") {
      alert("Login gagal: " + error.message);
    }
  });

// ============================================================
//  🔥 LOGOUT
// ============================================================
function logout() {
  const user = auth.currentUser;
  if (user) {
    // Log logout sebelum signOut
    logUserLogout().finally(() => {
      auth.signOut().then(() => {
        // Bersihkan session storage
        SessionLog.clearAll(user.uid);
        window.location.replace("/login");
      });
    });
  } else {
    auth.signOut().then(() => {
      window.location.replace("/login");
    });
  }
}

// ============================================================
//  🔥 SIMPAN USER
// ============================================================
function simpanUser(user) {
  localStorage.setItem("userName", user.displayName || "Pengguna");
  const userRef = db.collection("users").doc(user.uid);
  userRef.set(
    {
      uid: user.uid,
      nama: user.displayName || "Pengguna",
      email: user.email,
      foto: user.photoURL || "",
      gender: localStorage.getItem("userGender") || "",
      status: localStorage.getItem("userStatus") || "",
      loveLanguage: JSON.parse(
        localStorage.getItem("loveLanguageResult") || "{}",
      ),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

// ============================================================
//  🔥 CORE LOG FUNCTION
// ============================================================
async function logActivity(type, icon, priority, details = {}) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("⚠️ User tidak login, activity tidak disimpan");
      return false;
    }

    // 🔥 CEK SESSION STORAGE UNTUK DUPLIKAT
    const sessionKey = `${type}_${user.uid}_${details.id || details.articleId || 'default'}`;
    if (SessionLog.has(sessionKey)) {
      console.log(`⏭️ ${type} already logged this session, skipping`);
      return false;
    }

    const emailName = user.email ? user.email.split("@")[0] : "";
    const data = {
      type: type,
      icon: icon,
      priority: priority || "normal",
      userId: user.uid,
      userEmail: user.email || "-",
      userName: user.displayName || emailName || "Pengguna",
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      details: details
    };

    await db.collection("activities").add(data);
    console.log(`✅ Activity logged: ${type}`);
    
    // Tandai sudah di-log
    SessionLog.set(sessionKey);
    return true;
    
  } catch (error) {
    console.error("❌ Error logging activity:", error);
    return false;
  }
}

// ============================================================
//  🔥 SPECIFIC LOG FUNCTIONS
// ============================================================

// User Login
async function logUserLogin() {
  const user = auth.currentUser;
  if (!user) return false;
  
  const key = `user_login_${user.uid}`;
  if (SessionLog.has(key)) {
    console.log('⏭️ Login already logged this session, skipping');
    return false;
  }
  
  return await logActivity(
    "user_login",
    "👤",
    "normal",
    {
      loginMethod: "email",
      device: navigator.userAgent || "unknown"
    }
  );
}

// User Logout
async function logUserLogout() {
  const user = auth.currentUser;
  if (!user) return false;
  
  return await logActivity(
    "user_logout",
    "🚪",
    "normal",
    {
      logoutTime: new Date().toISOString()
    }
  );
}

// Test Completed (Wellness)
async function logTestCompleted(testData) {
  return await logActivity(
    "test_completed",
    "📝",
    "high",
    {
      score: testData.wellnessScore || 0,
      category: testData.category || "N/A",
      testId: testData.id || "unknown"
    }
  );
}

// Couple Connected
async function logCoupleConnected(coupleData) {
  let partnerName = "Pasangan";
  if (coupleData.partnerUserId) {
    try {
      const partnerDoc = await db.collection("users").doc(coupleData.partnerUserId).get();
      if (partnerDoc.exists) {
        partnerName = partnerDoc.data().nama || partnerDoc.data().name || "Pasangan";
      }
    } catch (e) {
      console.warn('⚠️ Gagal ambil data partner:', e);
    }
  }
  
  return await logActivity(
    "couple_connected",
    "💑",
    "high",
    {
      partnerName: partnerName,
      coupleCode: coupleData.inviteCode || "N/A",
      partnerUserId: coupleData.partnerUserId || ""
    }
  );
}

// Article Read
async function logArticleRead(article) {
  const articleId = article.id || 'unknown';
  return await logActivity(
    "article_read",
    "📖",
    "normal",
    {
      articleId: articleId,
      articleTitle: article.title || "Artikel",
      category: article.category || "Lainnya"
    }
  );
}

// Ebook Purchased
async function logEbookPurchased(ebook, price) {
  return await logActivity(
    "ebook_purchased",
    "📚",
    "high",
    {
      ebookId: ebook.id || "unknown",
      ebookTitle: ebook.title || "Ebook",
      price: price || 0
    }
  );
}

// Love Language Test
async function logLoveLanguageTest(testData) {
  return await logActivity(
    "love_language_test",
    "💕",
    "high",
    {
      primary: testData.primary || 'N/A',
      secondary: testData.secondary || 'N/A',
      testId: testData.id || 'unknown'
    }
  );
}

// View Results
async function logViewResults() {
  return await logActivity(
    "view_results",
    "📊",
    "normal",
    {
      page: "hasil",
      viewedAt: new Date().toISOString()
    }
  );
}

// Profile Update
async function logProfileUpdate() {
  return await logActivity(
    "profile_update",
    "✏️",
    "normal",
    {}
  );
}

// ============================================================
//  🔥 AUTH LISTENER - DENGAN SESSION STORAGE
// ============================================================

let previousUser = null;

auth.onAuthStateChanged(async (user) => {
  if (user) {
    // 🔥 CEK SESSION STORAGE
    const key = `user_login_${user.uid}`;
    const alreadyLogged = SessionLog.has(key);
    
    if (!alreadyLogged) {
      await logUserLogin();
      console.log("👤 User logged in:", user.email);
    } else {
      console.log("👤 User already logged in this session");
    }
    
    // Update lastLogin di Firestore
    try {
      await db.collection("users").doc(user.uid).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: new Date().toISOString()
      });
    } catch (e) {
      // Ignore - user mungkin belum ada di Firestore
    }
    
  } else {
    if (previousUser) {
      console.log("👤 User logged out:", previousUser.email);
      // Bersihkan session storage
      SessionLog.clearAll(previousUser.uid);
    }
  }
  previousUser = user;
});

// ============================================================
//  🔥 EKSPOR FUNGSI KE GLOBAL
// ============================================================
window.logActivity = logActivity;
window.logUserLogin = logUserLogin;
window.logUserLogout = logUserLogout;
window.logTestCompleted = logTestCompleted;
window.logCoupleConnected = logCoupleConnected;
window.logArticleRead = logArticleRead;
window.logEbookPurchased = logEbookPurchased;
window.logLoveLanguageTest = logLoveLanguageTest;
window.logViewResults = logViewResults;
window.logProfileUpdate = logProfileUpdate;

// ============================================================
//  🔥 API BASE URL
// ============================================================
const API_BASE = window.location.origin + "/api";
console.log("✅ API_BASE:", API_BASE);

// ============================================================
//  🔥 EXPOSE KE GLOBAL
// ============================================================
window.API_BASE = API_BASE;
window.auth = auth;
window.db = db;
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.simpanUser = simpanUser;
window.firebaseApp = firebase;

console.log("✅ Firebase Config loaded with Session Storage!");