// public/js/questions.js
// ============================================================
//  DATA PERTANYAAN LOVE LANGUAGE
// ============================================================

const KATEGORI = [
    'Words of Affirmation',
    'Acts of Service',
    'Quality Time',
    'Physical Touch',
    'Receiving Gifts'
];

const EMOJI = {
    'Words of Affirmation': '💬',
    'Acts of Service': '🤝',
    'Quality Time': '⏰',
    'Physical Touch': '🫂',
    'Receiving Gifts': '🎁'
};

const WARNA = {
    'Words of Affirmation': '#6c5ce7',
    'Acts of Service': '#00b894',
    'Quality Time': '#d4a373',
    'Physical Touch': '#e17055',
    'Receiving Gifts': '#fd79a8'
};

// ============================================================
//  DATA PERTANYAAN PER STATUS
// ============================================================
const PERTANYAAN = {
    single: {
        'Words of Affirmation': [
            'Saya merasa dihargai ketika teman atau keluarga mengatakan bahwa mereka bangga kepada saya.',
            'Saya merasa diperhatikan ketika orang terdekat mengucapkan terima kasih atas hal-hal kecil yang saya lakukan.',
            'Kata-kata penyemangat dari orang-orang terdekat membuat saya merasa lebih percaya diri.',
            'Saya senang ketika seseorang memuji usaha atau pencapaian saya.',
            'Saya merasa lebih tenang ketika orang lain mengungkapkan dukungannya secara langsung.'
        ],
        'Acts of Service': [
            'Saya merasa diperhatikan ketika seseorang membantu saya tanpa diminta.',
            'Bantuan kecil dari orang lain membuat saya merasa sangat dihargai.',
            'Saya merasa lebih dihargai ketika seseorang membantu saya saat sedang lelah.',
            'Saya senang ketika orang lain melakukan sesuatu untuk memudahkan hari saya.',
            'Saya lebih tersentuh oleh bantuan nyata daripada sekadar kata-kata.'
        ],
        'Quality Time': [
            'Saya merasa dihargai ketika seseorang memberikan perhatian penuh saat bersama saya.',
            'Menghabiskan waktu berkualitas dengan orang terdekat membuat saya merasa lebih dekat.',
            'Saya menikmati percakapan yang mendalam dengan orang-orang terpercaya.',
            'Saya merasa kecewa ketika seseorang lebih sibuk dengan ponselnya saat bersama saya.',
            'Saya merasa diperhatikan ketika seseorang meluangkan waktu khusus untuk saya.'
        ],
        'Physical Touch': [
            'Saya merasa nyaman ketika orang terdekat memberi pelukan hangat.',
            'Sentuhan lembut dari orang yang saya percaya membuat saya merasa tenang.',
            'Saya merasa lebih dekat dengan seseorang ketika kami berbagi sentuhan yang nyaman.',
            'Saya merindukan kedekatan fisik ketika lama tidak bertemu orang terdekat.',
            'Sentuhan sederhana, seperti tepukan di bahu, memiliki makna besar bagi saya.'
        ],
        'Receiving Gifts': [
            'Saya merasa dihargai ketika seseorang memberikan hadiah yang dipilih dengan penuh perhatian.',
            'Hadiah sederhana tetap terasa istimewa jika diberikan dengan tulus.',
            'Saya merasa bahagia ketika seseorang mengingat hal-hal kecil yang saya sukai.',
            'Saya menghargai kejutan kecil yang diberikan orang terdekat.',
            'Bagi saya, hadiah menjadi simbol perhatian dan kasih sayang.'
        ]
    },
    pdkt: {
        'Words of Affirmation': [
            'Saya merasa dihargai ketika calon pasangan mengatakan bahwa ia bangga kepada saya.',
            'Saya merasa dicintai ketika calon pasangan mengucapkan terima kasih atas hal-hal kecil yang saya lakukan.',
            'Kata-kata penyemangat dari calon pasangan membuat saya merasa lebih dekat dengannya.',
            'Saya senang ketika calon pasangan memuji usaha atau pencapaian saya.',
            'Saya merasa lebih tenang ketika calon pasangan mengungkapkan rasa sayangnya secara langsung.',
            'Saya merasa sedih jika calon pasangan jarang memberikan apresiasi secara verbal.'
        ],
        'Acts of Service': [
            'Saya merasa dicintai ketika calon pasangan membantu saya tanpa diminta.',
            'Bantuan kecil dari calon pasangan membuat saya merasa sangat diperhatikan.',
            'Saya merasa lebih dihargai ketika calon pasangan membantu saya saat sedang lelah.',
            'Saya senang ketika calon pasangan melakukan sesuatu untuk memudahkan hari saya.',
            'Saya merasa calon pasangan menunjukkan perhatiannya melalui tindakan nyata.',
            'Saya lebih tersentuh oleh bantuan daripada hadiah.'
        ],
        'Quality Time': [
            'Saya merasa paling dicintai ketika calon pasangan memberikan perhatian penuh saat bersama saya.',
            'Menghabiskan waktu berdua tanpa gangguan membuat saya merasa lebih dekat dengan calon pasangan.',
            'Saya menikmati percakapan yang mendalam bersama calon pasangan.',
            'Saya merasa kecewa ketika calon pasangan lebih sibuk dengan ponselnya saat bersama saya.',
            'Saya merasa hubungan kami semakin kuat setelah melakukan kegiatan bersama.',
            'Saya lebih memilih menghabiskan waktu bersama daripada menerima hadiah.'
        ],
        'Physical Touch': [
            'Saya merasa lebih dekat dengan calon pasangan ketika kami berpegangan tangan.',
            'Pelukan dari calon pasangan membuat saya merasa lebih tenang.',
            'Sentuhan lembut dari calon pasangan membuat saya merasa dicintai.',
            'Saya merasa nyaman ketika calon pasangan menunjukkan kasih sayang melalui sentuhan yang saya setujui.',
            'Saya merasa hubungan kami lebih hangat setelah berpelukan.',
            'Saya merindukan sentuhan fisik ketika lama tidak bertemu calon pasangan.'
        ],
        'Receiving Gifts': [
            'Saya merasa dicintai ketika calon pasangan memberikan hadiah yang dipilih dengan penuh perhatian.',
            'Hadiah sederhana tetap terasa istimewa jika diberikan dengan tulus.',
            'Saya merasa bahagia ketika calon pasangan membawa oleh-oleh untuk saya.',
            'Saya menghargai kejutan kecil yang diberikan calon pasangan.',
            'Saya merasa calon pasangan mengingat saya ketika memberikan sesuatu yang saya sukai.',
            'Bagi saya, hadiah menjadi simbol perhatian dan kasih sayang.'
        ]
    },
    pacaran: {
        'Words of Affirmation': [
            'Saya merasa paling dihargai ketika pasangan mengatakan bahwa ia bangga kepada saya.',
            'Saya merasa dicintai ketika pasangan mengucapkan terima kasih atas hal-hal kecil yang saya lakukan.',
            'Kata-kata penyemangat dari pasangan membuat saya merasa lebih dekat dengannya.',
            'Saya senang ketika pasangan memuji usaha atau pencapaian saya.',
            'Saya merasa lebih tenang ketika pasangan mengungkapkan rasa sayangnya secara langsung.',
            'Saya merasa sedih jika pasangan jarang memberikan apresiasi secara verbal.',
            'Saya merasa hubungan kami semakin erat setelah saling berbicara dari hati ke hati.',
            'Mendengar pasangan mengatakan "Aku mencintaimu" memiliki arti yang besar bagi saya.'
        ],
        'Acts of Service': [
            'Saya merasa dicintai ketika pasangan membantu pekerjaan saya tanpa diminta.',
            'Bantuan kecil dari pasangan membuat saya merasa sangat diperhatikan.',
            'Saya merasa lebih dihargai ketika pasangan membantu saya saat sedang lelah.',
            'Saya senang ketika pasangan melakukan sesuatu untuk memudahkan hari saya.',
            'Saya merasa pasangan menunjukkan kasih sayangnya melalui tindakan nyata.',
            'Saya lebih tersentuh oleh bantuan daripada hadiah.',
            'Ketika pasangan mengingat kebutuhan saya lalu membantu memenuhinya, saya merasa sangat dicintai.',
            'Saya merasa bahagia ketika pasangan rela meluangkan tenaga untuk membantu saya.'
        ],
        'Quality Time': [
            'Saya merasa paling dicintai ketika pasangan memberikan perhatian penuh saat bersama saya.',
            'Menghabiskan waktu berdua tanpa gangguan membuat saya merasa lebih dekat dengan pasangan.',
            'Saya menikmati percakapan yang mendalam bersama pasangan.',
            'Saya merasa kecewa ketika pasangan lebih sibuk dengan ponselnya saat bersama saya.',
            'Saya merasa hubungan kami semakin kuat setelah melakukan kegiatan bersama.',
            'Saya lebih memilih menghabiskan waktu bersama daripada menerima hadiah.',
            'Saya merasa diperhatikan ketika pasangan sengaja meluangkan waktu khusus untuk saya.',
            'Bagi saya, kehadiran pasangan sepenuhnya lebih penting daripada aktivitas yang dilakukan.'
        ],
        'Physical Touch': [
            'Saya merasa lebih dekat dengan pasangan ketika kami berpegangan tangan.',
            'Pelukan dari pasangan membuat saya merasa lebih tenang.',
            'Sentuhan lembut dari pasangan membuat saya merasa dicintai.',
            'Saya merasa nyaman ketika pasangan menunjukkan kasih sayang melalui sentuhan yang saya setujui.',
            'Saya merasa hubungan kami lebih hangat setelah berpelukan.',
            'Saya merindukan sentuhan fisik ketika lama tidak bertemu pasangan.',
            'Saya merasa lebih didukung ketika pasangan memeluk saya saat sedang sedih.',
            'Sentuhan sederhana, seperti menggenggam tangan atau merangkul, memiliki makna besar bagi saya.'
        ],
        'Receiving Gifts': [
            'Saya merasa dicintai ketika pasangan memberikan hadiah yang dipilih dengan penuh perhatian.',
            'Hadiah sederhana tetap terasa istimewa jika diberikan dengan tulus.',
            'Saya merasa bahagia ketika pasangan membawa oleh-oleh untuk saya.',
            'Saya menghargai kejutan kecil yang diberikan pasangan.',
            'Saya merasa pasangan mengingat saya ketika memberikan sesuatu yang saya sukai.',
            'Bagi saya, hadiah menjadi simbol perhatian dan kasih sayang.',
            'Saya senang menerima benda kecil yang memiliki makna khusus dari pasangan.',
            'Saya merasa dihargai ketika pasangan meluangkan waktu untuk memilih hadiah yang sesuai dengan saya.'
        ]
    },
    tunangan: {
        'Words of Affirmation': [
            'Saya merasa dicintai ketika calon suami/istri mengatakan bahwa ia bangga kepada saya.',
            'Saya merasa dicintai ketika calon suami/istri mengucapkan terima kasih atas hal-hal kecil yang saya lakukan.',
            'Kata-kata penyemangat dari calon suami/istri membuat saya merasa lebih dekat dengannya.',
            'Saya senang ketika calon suami/istri memuji usaha atau pencapaian saya.',
            'Saya merasa lebih tenang ketika calon suami/istri mengungkapkan rasa sayangnya secara langsung.',
            'Saya merasa sedih jika calon suami/istri jarang memberikan apresiasi secara verbal.',
            'Mendengar calon suami/istri mengatakan "Aku mencintaimu" memiliki arti yang besar bagi saya.'
        ],
        'Acts of Service': [
            'Saya merasa dicintai ketika calon suami/istri membantu pekerjaan saya tanpa diminta.',
            'Bantuan kecil dari calon suami/istri membuat saya merasa sangat diperhatikan.',
            'Saya merasa lebih dihargai ketika calon suami/istri membantu saya saat sedang lelah.',
            'Saya senang ketika calon suami/istri melakukan sesuatu untuk memudahkan hari saya.',
            'Saya merasa calon suami/istri menunjukkan kasih sayangnya melalui tindakan nyata.',
            'Saya lebih tersentuh oleh bantuan daripada hadiah.',
            'Ketika calon suami/istri mengingat kebutuhan saya lalu membantu memenuhinya, saya merasa sangat dicintai.'
        ],
        'Quality Time': [
            'Saya merasa paling dicintai ketika calon suami/istri memberikan perhatian penuh saat bersama saya.',
            'Menghabiskan waktu berdua tanpa gangguan membuat saya merasa lebih dekat dengan calon suami/istri.',
            'Saya menikmati percakapan yang mendalam bersama calon suami/istri.',
            'Saya merasa kecewa ketika calon suami/istri lebih sibuk dengan ponselnya saat bersama saya.',
            'Saya merasa hubungan kami semakin kuat setelah melakukan kegiatan bersama.',
            'Saya lebih memilih menghabiskan waktu bersama daripada menerima hadiah.',
            'Saya merasa diperhatikan ketika calon suami/istri sengaja meluangkan waktu khusus untuk saya.'
        ],
        'Physical Touch': [
            'Saya merasa lebih dekat dengan calon suami/istri ketika kami berpegangan tangan.',
            'Pelukan dari calon suami/istri membuat saya merasa lebih tenang.',
            'Sentuhan lembut dari calon suami/istri membuat saya merasa dicintai.',
            'Saya merasa nyaman ketika calon suami/istri menunjukkan kasih sayang melalui sentuhan yang saya setujui.',
            'Saya merasa hubungan kami lebih hangat setelah berpelukan.',
            'Saya merindukan sentuhan fisik ketika lama tidak bertemu calon suami/istri.',
            'Saya merasa lebih didukung ketika calon suami/istri memeluk saya saat sedang sedih.'
        ],
        'Receiving Gifts': [
            'Saya merasa dicintai ketika calon suami/istri memberikan hadiah yang dipilih dengan penuh perhatian.',
            'Hadiah sederhana tetap terasa istimewa jika diberikan dengan tulus.',
            'Saya merasa bahagia ketika calon suami/istri membawa oleh-oleh untuk saya.',
            'Saya menghargai kejutan kecil yang diberikan calon suami/istri.',
            'Saya merasa calon suami/istri mengingat saya ketika memberikan sesuatu yang saya sukai.',
            'Bagi saya, hadiah menjadi simbol perhatian dan kasih sayang.',
            'Saya senang menerima benda kecil yang memiliki makna khusus dari calon suami/istri.'
        ]
    },
    menikah: {
        'Words of Affirmation': [
            'Saya merasa dicintai ketika suami/istri mengatakan bahwa ia bangga kepada saya.',
            'Saya merasa dicintai ketika suami/istri mengucapkan terima kasih atas hal-hal kecil yang saya lakukan.',
            'Kata-kata penyemangat dari suami/istri membuat saya merasa lebih dekat dengannya.',
            'Saya senang ketika suami/istri memuji usaha atau pencapaian saya.',
            'Saya merasa lebih tenang ketika suami/istri mengungkapkan rasa sayangnya secara langsung.',
            'Saya merasa sedih jika suami/istri jarang memberikan apresiasi secara verbal.',
            'Saya merasa hubungan kami semakin erat setelah saling berbicara dari hati ke hati.',
            'Mendengar suami/istri mengatakan "Aku mencintaimu" memiliki arti yang besar bagi saya.'
        ],
        'Acts of Service': [
            'Saya merasa dicintai ketika suami/istri membantu pekerjaan saya tanpa diminta.',
            'Bantuan kecil dari suami/istri membuat saya merasa sangat diperhatikan.',
            'Saya merasa lebih dihargai ketika suami/istri membantu saya saat sedang lelah.',
            'Saya senang ketika suami/istri melakukan sesuatu untuk memudahkan hari saya.',
            'Saya merasa suami/istri menunjukkan kasih sayangnya melalui tindakan nyata.',
            'Saya lebih tersentuh oleh bantuan daripada hadiah.',
            'Ketika suami/istri mengingat kebutuhan saya lalu membantu memenuhinya, saya merasa sangat dicintai.',
            'Saya merasa bahagia ketika suami/istri rela meluangkan tenaga untuk membantu saya.'
        ],
        'Quality Time': [
            'Saya merasa paling dicintai ketika suami/istri memberikan perhatian penuh saat bersama saya.',
            'Menghabiskan waktu berdua tanpa gangguan membuat saya merasa lebih dekat dengan suami/istri.',
            'Saya menikmati percakapan yang mendalam bersama suami/istri.',
            'Saya merasa kecewa ketika suami/istri lebih sibuk dengan ponselnya saat bersama saya.',
            'Saya merasa hubungan kami semakin kuat setelah melakukan kegiatan bersama.',
            'Saya lebih memilih menghabiskan waktu bersama daripada menerima hadiah.',
            'Saya merasa diperhatikan ketika suami/istri sengaja meluangkan waktu khusus untuk saya.',
            'Bagi saya, kehadiran suami/istri sepenuhnya lebih penting daripada aktivitas yang dilakukan.'
        ],
        'Physical Touch': [
            'Saya merasa lebih dekat dengan suami/istri ketika kami berpegangan tangan.',
            'Pelukan dari suami/istri membuat saya merasa lebih tenang.',
            'Sentuhan lembut dari suami/istri membuat saya merasa dicintai.',
            'Saya merasa nyaman ketika suami/istri menunjukkan kasih sayang melalui sentuhan yang saya setujui.',
            'Saya merasa hubungan kami lebih hangat setelah berpelukan.',
            'Saya merindukan sentuhan fisik ketika lama tidak bertemu suami/istri.',
            'Saya merasa lebih didukung ketika suami/istri memeluk saya saat sedang sedih.',
            'Sentuhan sederhana, seperti menggenggam tangan atau merangkul, memiliki makna besar bagi saya.'
        ],
        'Receiving Gifts': [
            'Saya merasa dicintai ketika suami/istri memberikan hadiah yang dipilih dengan penuh perhatian.',
            'Hadiah sederhana tetap terasa istimewa jika diberikan dengan tulus.',
            'Saya merasa bahagia ketika suami/istri membawa oleh-oleh untuk saya.',
            'Saya menghargai kejutan kecil yang diberikan suami/istri.',
            'Saya merasa suami/istri mengingat saya ketika memberikan sesuatu yang saya sukai.',
            'Bagi saya, hadiah menjadi simbol perhatian dan kasih sayang.',
            'Saya senang menerima benda kecil yang memiliki makna khusus dari suami/istri.',
            'Saya merasa dihargai ketika suami/istri meluangkan waktu untuk memilih hadiah yang sesuai dengan saya.'
        ]
    }
};

// ============================================================
//  REKOMENDASI BERDASARKAN STATUS
// ============================================================
function getRekomendasi(userGender, userStatus) {
     // 🔥 Ambil nama user dari localStorage
    const userName = localStorage.getItem('userName') || 'Pengguna';
    const isWanita = userGender === 'wanita';
    const sebutan = isWanita ? 'kamu (cewe)' : 'kamu (cowo)';

    const rekomendasi = {
        single: {
            'Words of Affirmation': `Untuk ${userName} yang sedang single, ini saat yang tepat untuk mengenali dirimu sendiri. Perhatikan bagaimana kamu merespons kata-kata dari orang-orang di sekitarmu.`,
            'Acts of Service': `Untuk ${userName} yang sedang single, kenali bagaimana kamu merespons bantuan dari orang lain. Apakah kamu merasa dihargai ketika seseorang membantu tanpa diminta?`,
            'Quality Time': `Untuk ${userName} yang sedang single, saat ini kamu bisa melatih kehadiran penuh untuk dirimu sendiri.`,
            'Physical Touch': `Untuk ${userName} yang sedang single, kenali batasan dan kenyamananmu terhadap sentuhan fisik.`,
            'Receiving Gifts': `Untuk ${userName} yang sedang single, perhatikan bagaimana perasaanmu ketika menerima hadiah dari orang terdekat.`
        },
        pdkt: {
            'Words of Affirmation': `Untuk ${userName} yang sedang PDKT, mulai perhatikan apakah calon pasanganmu terbuka menerima pujian dan kata-kata penghargaan darimu.`,
            'Acts of Service': `Untuk ${userName} yang sedang PDKT, perhatikan apakah calon pasanganmu menunjukkan perhatian melalui tindakan kecil.`,
            'Quality Time': `Untuk ${userName} yang sedang PDKT, kualitas waktu bersama lebih penting daripada kuantitas.`,
            'Physical Touch': `Untuk ${userName} yang sedang PDKT, penting untuk menghormati batasan masing-masing.`,
            'Receiving Gifts': `Untuk ${userName} yang sedang PDKT, hadiah kecil yang tulus bisa menjadi cara untuk menunjukkan perhatian.`
        },
        pacaran: {
            'Words of Affirmation': `Untuk ${userName} yang sedang pacaran, jadikan kebiasaan untuk saling memberi apresiasi setiap hari.`,
            'Acts of Service': `Untuk ${userName} yang sedang pacaran, tunjukkan cinta melalui tindakan nyata.`,
            'Quality Time': `Untuk ${userName} yang sedang pacaran, jadwalkan waktu berkualitas tanpa gangguan.`,
            'Physical Touch': `Untuk ${userName} yang sedang pacaran, sentuhan fisik seperti berpegangan tangan atau pelukan hangat bisa menjadi perekat emosional.`,
            'Receiving Gifts': `Untuk ${userName} yang sedang pacaran, kejutan kecil bisa membuat pasangan merasa diingat dan dihargai.`
        },
        tunangan: {
            'Words of Affirmation': `Untuk ${userName} yang sudah tunangan, bangun kebiasaan komunikasi yang sehat sebelum pernikahan.`,
            'Acts of Service': `Untuk ${userName} yang sudah tunangan, persiapan pernikahan bisa menjadi momen untuk saling membantu.`,
            'Quality Time': `Untuk ${userName} yang sudah tunangan, jangan biarkan persiapan pernikahan mengorbankan waktu berkualitas berdua.`,
            'Physical Touch': `Untuk ${userName} yang sudah tunangan, kedekatan fisik yang nyaman akan membantu mempererat ikatan menjelang pernikahan.`,
            'Receiving Gifts': `Untuk ${userName} yang sudah tunangan, hadiah tidak harus mahal, bisa berupa surat cinta atau kenang-kenangan kecil.`
        },
        menikah: {
            'Words of Affirmation': `Untuk ${userName} yang sudah menikah, kata-kata penghargaan dan dukungan menjadi kebutuhan harian.`,
            'Acts of Service': `Untuk ${userName} yang sudah menikah, pernikahan adalah kemitraan. Bantu pasangan dalam pekerjaan rumah tangga.`,
            'Quality Time': `Untuk ${userName} yang sudah menikah, di tengah kesibukan rumah tangga, tetap jadwalkan waktu berdua.`,
            'Physical Touch': `Untuk ${userName} yang sudah menikah, sentuhan fisik seperti pelukan atau genggaman tangan adalah bahasa cinta yang sederhana namun kuat.`,
            'Receiving Gifts': `Untuk ${userName} yang sudah menikah, kejutan kecil di hari biasa bisa lebih berarti daripada hadiah di hari besar.`
        }
    };

    return rekomendasi[userStatus] || {};
}