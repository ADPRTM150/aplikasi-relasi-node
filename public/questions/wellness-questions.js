// public/questions/wellness-questions.js

const wellnessDimensions = [
    { id: 'komunikasi', label: 'Komunikasi', icon: '💬' },
    { id: 'kepercayaan', label: 'Kepercayaan', icon: '🔒' },
    { id: 'resolusi_konflik', label: 'Resolusi Konflik', icon: '🤝' },
    { id: 'dukungan_emosional', label: 'Dukungan Emosional', icon: '❤️' },
    { id: 'waktu_berkualitas', label: 'Waktu Berkualitas', icon: '⏰' },
    { id: 'komitmen', label: 'Komitmen & Tujuan', icon: '🎯' },
    { id: 'penghargaan', label: 'Penghargaan & Respek', icon: '🌟' },
    { id: 'keuangan', label: 'Keuangan & Kerja Sama', icon: '💰' }
];

const wellnessQuestions = [
    // A. Komunikasi (1-8)
    { id: 1, dimension: 'komunikasi', text: 'Kami dapat membicarakan perasaan dengan cukup terbuka.' },
    { id: 2, dimension: 'komunikasi', text: 'Pasangan saya mendengarkan ketika saya berbicara.' },
    { id: 3, dimension: 'komunikasi', text: 'Saya merasa aman menyampaikan kebutuhan saya.' },
    { id: 4, dimension: 'komunikasi', text: 'Kami berusaha memahami sudut pandang satu sama lain.' },
    { id: 5, dimension: 'komunikasi', text: 'Kami dapat membicarakan masalah tanpa langsung menyerang.' },
    { id: 6, dimension: 'komunikasi', text: 'Pasangan saya memberi respons yang jelas ketika ada hal penting.' },
    { id: 7, dimension: 'komunikasi', text: 'Kami dapat mengklarifikasi salah paham.' },
    { id: 8, dimension: 'komunikasi', text: 'Saya merasa pendapat saya dihargai dalam percakapan.' },

    // B. Kepercayaan (9-16)
    { id: 9, dimension: 'kepercayaan', text: 'Saya merasa pasangan saya jujur kepada saya.' },
    { id: 10, dimension: 'kepercayaan', text: 'Saya merasa aman mempercayai pasangan saya.' },
    { id: 11, dimension: 'kepercayaan', text: 'Pasangan saya berusaha menepati janji.' },
    { id: 12, dimension: 'kepercayaan', text: 'Kami menghormati privasi satu sama lain.' },
    { id: 13, dimension: 'kepercayaan', text: 'Saya tidak merasa perlu terus-menerus mencurigai pasangan.' },
    { id: 14, dimension: 'kepercayaan', text: 'Pasangan saya konsisten antara ucapan dan tindakan.' },
    { id: 15, dimension: 'kepercayaan', text: 'Kami dapat terbuka tentang hal yang penting bagi hubungan.' },
    { id: 16, dimension: 'kepercayaan', text: 'Saya yakin pasangan saya mempertimbangkan kebaikan hubungan kami.' },

    // C. Resolusi Konflik (17-24)
    { id: 17, dimension: 'resolusi_konflik', text: 'Saat berbeda pendapat, kami berusaha mencari solusi.' },
    { id: 18, dimension: 'resolusi_konflik', text: 'Kami dapat berhenti sejenak ketika emosi terlalu tinggi.' },
    { id: 19, dimension: 'resolusi_konflik', text: 'Pasangan saya tidak merendahkan saya saat bertengkar.' },
    { id: 20, dimension: 'resolusi_konflik', text: 'Kami dapat meminta maaf ketika melakukan kesalahan.' },
    { id: 21, dimension: 'resolusi_konflik', text: 'Masalah yang muncul biasanya dibicarakan kembali dengan tenang.' },
    { id: 22, dimension: 'resolusi_konflik', text: 'Kami berusaha fokus pada masalah, bukan menyerang pribadi.' },
    { id: 23, dimension: 'resolusi_konflik', text: 'Kami dapat membuat kompromi yang adil.' },
    { id: 24, dimension: 'resolusi_konflik', text: 'Setelah konflik, kami berusaha memperbaiki hubungan.' },

    // D. Dukungan Emosional (25-32)
    { id: 25, dimension: 'dukungan_emosional', text: 'Saya merasa didengar ketika sedang sedih atau tertekan.' },
    { id: 26, dimension: 'dukungan_emosional', text: 'Pasangan saya berusaha memahami perasaan saya.' },
    { id: 27, dimension: 'dukungan_emosional', text: 'Saya merasa didukung saat menghadapi kesulitan.' },
    { id: 28, dimension: 'dukungan_emosional', text: 'Pasangan saya menunjukkan kepedulian pada kondisi saya.' },
    { id: 29, dimension: 'dukungan_emosional', text: 'Saya dapat mencari kenyamanan dari pasangan.' },
    { id: 30, dimension: 'dukungan_emosional', text: 'Pasangan saya menghargai emosi saya meskipun tidak selalu setuju.' },
    { id: 31, dimension: 'dukungan_emosional', text: 'Kami saling menyemangati untuk berkembang.' },
    { id: 32, dimension: 'dukungan_emosional', text: 'Saya merasa tidak sendirian dalam hubungan ini.' },

    // E. Waktu Berkualitas (33-40)
    { id: 33, dimension: 'waktu_berkualitas', text: 'Kami meluangkan waktu khusus untuk bersama.' },
    { id: 34, dimension: 'waktu_berkualitas', text: 'Saat bersama, kami cukup hadir dan tidak terus terdistraksi.' },
    { id: 35, dimension: 'waktu_berkualitas', text: 'Kami menikmati aktivitas sederhana bersama.' },
    { id: 36, dimension: 'waktu_berkualitas', text: 'Kami rutin mengobrol tentang hari kami.' },
    { id: 37, dimension: 'waktu_berkualitas', text: 'Saya merasa pasangan memberi perhatian saat bersama saya.' },
    { id: 38, dimension: 'waktu_berkualitas', text: 'Kami memiliki waktu yang terasa menyenangkan bagi kami berdua.' },
    { id: 39, dimension: 'waktu_berkualitas', text: 'Kami berusaha menjaga kedekatan meski sibuk.' },
    { id: 40, dimension: 'waktu_berkualitas', text: 'Saya merasa kebersamaan kami cukup bermakna.' },

    // F. Komitmen & Tujuan (41-48)
    { id: 41, dimension: 'komitmen', text: 'Kami memiliki gambaran masa depan yang cukup selaras.' },
    { id: 42, dimension: 'komitmen', text: 'Kami membicarakan tujuan hubungan kami.' },
    { id: 43, dimension: 'komitmen', text: 'Saya merasa pasangan berkomitmen pada hubungan ini.' },
    { id: 44, dimension: 'komitmen', text: 'Kami berusaha mengambil keputusan penting bersama.' },
    { id: 45, dimension: 'komitmen', text: 'Kami saling mendukung tujuan pribadi masing-masing.' },
    { id: 46, dimension: 'komitmen', text: 'Kami dapat membicarakan pembagian peran dengan terbuka.' },
    { id: 47, dimension: 'komitmen', text: 'Kami berusaha bertanggung jawab terhadap hubungan.' },
    { id: 48, dimension: 'komitmen', text: 'Saya melihat kami sebagai tim.' },

    // G. Penghargaan & Respek (49-56)
    { id: 49, dimension: 'penghargaan', text: 'Pasangan saya memperlakukan saya dengan hormat.' },
    { id: 50, dimension: 'penghargaan', text: 'Saya merasa usaha saya dihargai.' },
    { id: 51, dimension: 'penghargaan', text: 'Kami dapat berbeda pendapat tanpa meremehkan.' },
    { id: 52, dimension: 'penghargaan', text: 'Pasangan saya menghormati batasan saya.' },
    { id: 53, dimension: 'penghargaan', text: 'Saya dapat menjadi diri sendiri dalam hubungan ini.' },
    { id: 54, dimension: 'penghargaan', text: 'Kami menghindari ejekan atau penghinaan.' },
    { id: 55, dimension: 'penghargaan', text: 'Pasangan saya menghargai pilihan dan kemampuan saya.' },
    { id: 56, dimension: 'penghargaan', text: 'Kami saling menunjukkan apresiasi.' },

    // H. Keuangan & Kerja Sama (57-64)
    { id: 57, dimension: 'keuangan', text: 'Kami dapat membicarakan uang dengan cukup terbuka.' },
    { id: 58, dimension: 'keuangan', text: 'Kami memahami prioritas keuangan satu sama lain.' },
    { id: 59, dimension: 'keuangan', text: 'Kami berusaha membuat keputusan keuangan secara adil.' },
    { id: 60, dimension: 'keuangan', text: 'Kami dapat membicarakan pengeluaran besar bersama.' },
    { id: 61, dimension: 'keuangan', text: 'Saya merasa tanggung jawab praktis dibagi dengan cukup jelas.' },
    { id: 62, dimension: 'keuangan', text: 'Kami berusaha jujur tentang kewajiban atau utang.' },
    { id: 63, dimension: 'keuangan', text: 'Kami memiliki arah atau target keuangan yang dibicarakan.' },
    { id: 64, dimension: 'keuangan', text: 'Perbedaan kebiasaan keuangan dapat kami diskusikan dengan baik.' }
];

const wellnessScale = [
    { value: 1, label: 'Sangat Tidak Setuju' },
    { value: 2, label: 'Tidak Setuju' },
    { value: 3, label: 'Netral' },
    { value: 4, label: 'Setuju' },
    { value: 5, label: 'Sangat Setuju' }
];

const wellnessRecommendations = {
    komunikasi: 'Latihan 10 menit bergantian bicara dan mendengar; gunakan kalimat "Saya merasa..."',
    kepercayaan: 'Buat kesepakatan kecil yang jelas dan tepati; bicarakan batas privasi.',
    resolusi_konflik: 'Ambil jeda 20-30 menit saat emosi tinggi, lalu kembali membahas satu masalah dengan tujuan solusi.',
    dukungan_emosional: 'Tanyakan: "Kamu ingin didengar, dipeluk, atau dibantu mencari solusi?"',
    waktu_berkualitas: 'Jadwalkan 30 menit tanpa gawai, minimal 1-2 kali per minggu.',
    komitmen: 'Buat percakapan target 6-12 bulan dan satu langkah kecil bersama.',
    penghargaan: 'Latih apresiasi harian; hentikan ejekan dan sindiran saat konflik.',
    keuangan: 'Buat daftar pemasukan, kebutuhan, tabungan, dan batas pengeluaran yang disepakati.'
};

// ============================================================
//  🔥 EXPOSE KE GLOBAL (untuk diakses tanpa module)
// ============================================================
window.wellnessDimensions = wellnessDimensions;
window.wellnessQuestions = wellnessQuestions;
window.wellnessScale = wellnessScale;
window.wellnessRecommendations = wellnessRecommendations;

console.log('✅ Wellness Questions loaded:', wellnessQuestions.length);