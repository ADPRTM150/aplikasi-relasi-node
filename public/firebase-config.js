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
//  🔥 IDLE TIMEOUT - AUTO LOGOUT (15 MENIT)
//  Pakai polling lastActivity biar reliable
// ============================================================
const IdleTimeout = {
  IDLE_MS: 15 * 60 * 1000,         // 15 menit
  WARNING_MS: 60 * 1000,            // Peringatan 60 detik
  CHECK_INTERVAL: 10 * 1000,        // Cek tiap 10 detik

  pollInterval: null,
  countdownInterval: null,
  isWarningShown: false,
  lastActivity: Date.now(),

  // Update timestamp aktivitas
  touch: function() {
    IdleTimeout.lastActivity = Date.now();
    if (IdleTimeout.isWarningShown) {
      IdleTimeout.hideWarning();
    }
  },

  // Cek idle secara berkala
  check: function() {
    var user = firebase.auth().currentUser;
    if (!user) return;

    var idleDuration = Date.now() - IdleTimeout.lastActivity;
    var warnThreshold = IdleTimeout.IDLE_MS - IdleTimeout.WARNING_MS;

    if (idleDuration >= IdleTimeout.IDLE_MS && !IdleTimeout.isWarningShown) {
      // Udah 15 menit idle, langsung logout
      IdleTimeout.forceLogout();
    } else if (idleDuration >= warnThreshold && !IdleTimeout.isWarningShown) {
      // 14 menit idle, tampilkan warning
      IdleTimeout.showWarning();
    }
  },

  // Tampilkan modal peringatan (dengan animasi)
  showWarning: function() {
    this.isWarningShown = true;
    var remainingSeconds = Math.round((this.IDLE_MS - (Date.now() - this.lastActivity)) / 1000);
    if (remainingSeconds < 1) remainingSeconds = 1;
    if (remainingSeconds > 60) remainingSeconds = 60;
    var totalSeconds = remainingSeconds;
    var self = this;

    // Inject CSS
    var style = document.createElement('style');
    style.id = 'idleWarningStyles';
    style.textContent =
      '@keyframes idleFadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }' +
      '@keyframes idleScaleIn { 0% { opacity: 0; transform: scale(0.85) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }' +
      '@keyframes idlePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }' +
      '@keyframes idleShake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }' +
      '@keyframes idleProgressPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }' +
      '#idleExtendBtn:hover { transform: scale(1.03) !important; box-shadow: 0 8px 25px rgba(108,99,255,0.4) !important; }' +
      '#idleExtendBtn:active { transform: scale(0.97) !important; }';
    document.head.appendChild(style);

    var modal = document.createElement('div');
    modal.id = 'idleWarningModal';
    modal.innerHTML =
      '<div style="position:fixed;top:0;left:0;right:0;bottom:0;' +
        'background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:center;' +
        'justify-content:center;animation:idleFadeIn 0.35s ease;' +
        'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);">' +
        '<div style="background:#fff;border-radius:20px;padding:36px 28px 28px;' +
          'max-width:380px;width:90%;text-align:center;' +
          'box-shadow:0 24px 80px rgba(0,0,0,0.25);' +
          'animation:idleScaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1);' +
          'position:relative;overflow:visible;">' +
          '<div style="position:relative;display:inline-block;margin-bottom:16px;">' +
            '<svg width="90" height="90" viewBox="0 0 90 90" style="display:block;">' +
              '<circle cx="45" cy="45" r="38" fill="none" stroke="#f0eefc" stroke-width="5"/>' +
              '<circle id="idleCountdownRing" cx="45" cy="45" r="38" fill="none" ' +
                'stroke="#6C63FF" stroke-width="5" stroke-linecap="round" ' +
                'transform="rotate(-90 45 45)" ' +
                'style="stroke-dasharray:238.76;stroke-dashoffset:0;transition:stroke-dashoffset 0.9s linear,stroke 0.4s ease;"/>' +
            '</svg>' +
            '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">' +
              '<span style="font-size:26px;display:block;line-height:1;' +
                'animation:idlePulse 2s ease-in-out infinite;">⏳</span>' +
              '<strong id="idleCountdown" style="font-size:20px;color:#1d3b36;display:block;' +
                'margin-top:2px;font-variant-numeric:tabular-nums;">' + totalSeconds + '</strong>' +
            '</div>' +
          '</div>' +
          '<h3 style="margin:0 0 6px;color:#1d3b36;font-size:18px;font-weight:700;">Sesi Hampir Berakhir</h3>' +
          '<p style="color:#5a6f6a;font-size:13px;margin:0 0 18px;line-height:1.6;">Kamu tidak aktif selama 15 menit.<br>Klik tombol di bawah untuk melanjutkan sesi.</p>' +
          '<div style="width:100%;height:4px;background:#f0eefc;border-radius:4px;margin-bottom:20px;overflow:hidden;">' +
            '<div id="idleProgressBar" style="height:100%;background:linear-gradient(90deg,#6C63FF,#a78bfa);border-radius:4px;width:100%;transition:width 0.9s linear;"></div>' +
          '</div>' +
          '<button id="idleExtendBtn" style="background:linear-gradient(135deg,#6C63FF,#7c73ff);color:#fff;border:none;' +
            'padding:13px 32px;border-radius:50px;font-size:15px;font-weight:600;' +
            'cursor:pointer;transition:all 0.25s ease;width:100%;letter-spacing:0.3px;' +
            'box-shadow:0 4px 15px rgba(108,99,255,0.3);">✨  Lanjutkan Sesi</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    document.getElementById('idleExtendBtn').addEventListener('click', function() {
      self.extend();
    });

    // Countdown
    var countdown = totalSeconds;
    var countdownEl = document.getElementById('idleCountdown');
    var ring = document.getElementById('idleCountdownRing');
    var progressBar = document.getElementById('idleProgressBar');
    var card = modal.querySelector('[style*="animation:idleScaleIn"]');
    var circumference = 2 * Math.PI * 38;

    this.countdownInterval = setInterval(function() {
      countdown--;
      if (countdownEl) countdownEl.textContent = countdown;
      if (ring) {
        ring.style.strokeDashoffset = circumference * (1 - countdown / totalSeconds);
        if (countdown <= 10) ring.style.stroke = '#ef4444';
        else if (countdown <= 20) ring.style.stroke = '#f59e0b';
      }
      if (progressBar) {
        progressBar.style.width = (countdown / totalSeconds * 100) + '%';
        if (countdown <= 10) {
          progressBar.style.background = 'linear-gradient(90deg,#ef4444,#f87171)';
          progressBar.style.animation = 'idleProgressPulse 0.6s ease-in-out infinite';
        }
      }
      if (countdown <= 5 && card) {
        card.style.animation = 'idleShake 0.5s ease-in-out';
        setTimeout(function() { card.style.animation = ''; }, 500);
      }
      if (countdown <= 0) {
        clearInterval(self.countdownInterval);
        self.countdownInterval = null;
        self.forceLogout();
      }
    }, 1000);
  },

  hideWarning: function() {
    this.isWarningShown = false;
    var modal = document.getElementById('idleWarningModal');
    if (modal) modal.remove();
    var style = document.getElementById('idleWarningStyles');
    if (style) style.remove();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  },

  extend: function() {
    this.hideWarning();
    this.lastActivity = Date.now();
    console.log('⏰ Sesi diperpanjang oleh user');
  },

  forceLogout: function() {
    this.hideWarning();
    this.stop();
    console.log('⏰ Auto-logout: user tidak aktif 15 menit');
    var user = firebase.auth().currentUser;
    if (user) {
      logUserLogout().finally(function() {
        SessionLog.clearAll(user.uid);
        firebase.auth().signOut().then(function() {
          window.location.replace('/login');
        });
      });
    } else {
      firebase.auth().signOut().then(function() {
        window.location.replace('/login');
      });
    }
  },

  start: function() {
    if (this.pollInterval) return; // sudah jalan
    var self = this;
    // Event listeners untuk deteksi aktivitas
    var events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(function(evt) {
      document.addEventListener(evt, function() { self.touch(); }, { passive: true });
    });
    this.lastActivity = Date.now();
    // Polling tiap 10 detik
    this.pollInterval = setInterval(function() { self.check(); }, this.CHECK_INTERVAL);
    console.log('⏰ Idle timeout aktif — 15 menit (polling tiap ' + (this.CHECK_INTERVAL/1000) + 's)');
  },

  stop: function() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.hideWarning();
    console.log('⏰ Idle timeout dihentikan');
  }
};

// Expose ke global
window.IdleTimeout = IdleTimeout;

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

// ============================================================
//  🔥 FUNGSI LOG LOVE LANGUAGE TEST
// ============================================================
async function logLoveLanguageTest(testData) {
    const user = auth.currentUser;
    if (user) {
        await logUserActivity({
            type: 'love_language_test',
            icon: '💕',
            priority: 'high',
            details: {
                primary: testData.primary || 'N/A',
                secondary: testData.secondary || 'N/A',
                testId: testData.id || 'unknown'
            }
        });
    }
}

// Ekspor ke global
window.logLoveLanguageTest = logLoveLanguageTest;

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
    // 🔥 Mulai idle timeout (setiap kali halaman load dengan user login)
    IdleTimeout.start();

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
      // 🔥 Hentikan idle timeout
      IdleTimeout.stop();
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