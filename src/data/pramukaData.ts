// Data Komprehensif PramukaHub: Filosofi, Tali-Temali, Sandi, SKU, TKK, Kuis, P3K & Lagu

export interface DasaDarmaItem {
  nomor: number;
  teks: string;
  makna: string;
  contohKemah: string;
}

export const DASA_DARMA_LIST: DasaDarmaItem[] = [
  {
    nomor: 1,
    teks: 'Takwa kepada Tuhan Yang Maha Esa',
    makna: 'Menjalankan segala perintah agama dan menjauhi larangan-Nya, serta mensyukuri seluruh alam ciptaan-Nya.',
    contohKemah: 'Melaksanakan ibadah salat/kebaktian bersama tepat waktu di area perkemahan dan menjaga keheningan saat waktu ibadah.',
  },
  {
    nomor: 2,
    teks: 'Cinta alam dan kasih sayang sesama manusia',
    makna: 'Menjaga kelestarian lingkungan hidup dan memperlakukan sesama manusia dengan rasa persaudaraan dan belas kasih.',
    contohKemah: 'Menerapkan prinsip "Leave No Trace" (tidak meninggalkan sampah di bumi perkemahan), memilah sampah, dan menolong teman regu yang kelelahan saat penjelajahan.',
  },
  {
    nomor: 3,
    teks: 'Patriot yang sopan dan kesatria',
    makna: 'Mencintai tanah air Indonesia, menghormati adat istiadat dan tata krama, serta berani membela kebenaran.',
    contohKemah: 'Mengikuti upacara pembukaan perkemahan dengan khidmat, menghormati pembina dan warga desa sekitar lokasi kemah.',
  },
  {
    nomor: 4,
    teks: 'Patuh dan suka bermusyawarah',
    makna: 'Taat pada peraturan yang berlaku dan senantiasa mengutamakan mufakat dalam pengambilan keputusan bersama.',
    contohKemah: 'Musyawarah regu untuk pembagian tugas piket tenda, memasak, dan mencari kayu bakar tanpa memaksakan kehendak.',
  },
  {
    nomor: 5,
    teks: 'Rela menolong dan tabah',
    makna: 'Ikhlas memberikan pertolongan kepada siapa pun tanpa pamrih dan pantang menyerah menghadapi rintangan.',
    contohKemah: 'Membantu regu lain mendirikan tenda saat hujan turun mendadak dan tetap bersemangat meski jalur hiking berlumpur.',
  },
  {
    nomor: 6,
    teks: 'Rajin, terampil, dan gembira',
    makna: 'Aktif belajar, cakap mempraktikkan keterampilan hidup (life skills), serta selalu memelihara suasana riang gembira.',
    contohKemah: 'Cekatan membuat pionering tiang jemuran, terampil mengolah masakan rimba, dan bernyanyi riang di sela-sela kegiatan.',
  },
  {
    nomor: 7,
    teks: 'Hemat, cermat, dan bersahaja',
    makna: 'Tidak boros, teliti memperhitungkan kebutuhan, serta bergaya hidup sederhana sesuai nilai kepramukaan.',
    contohKemah: 'Menghemat persediaan air minum bersih di camp, merawat tali dan patok tenda agar tidak hilang, dan tidak jajan berlebihan.',
  },
  {
    nomor: 8,
    teks: 'Disiplin, berani, dan setia',
    makna: 'Menghargai waktu, berani menghadapi tantangan demi kebenaran, dan setia pada janji serta kawan seperjuangan.',
    contohKemah: 'Bangun pagi tepat waktu pukul 04.30 saat apel pagi dibunyikan, berani melintasi jembatan tali basah, dan menjaga rahasia regu.',
  },
  {
    nomor: 9,
    teks: 'Bertanggung jawab dan dapat dipercaya',
    makna: 'Siap menanggung konsekuensi amanah yang dipikul dan senantiasa jujur dalam perkataan maupun perbuatan.',
    contohKemah: 'Menjalankan giliran jaga malam (ronda posko) dengan penuh kewaspadaan tanpa meninggalkan pos jaga sebelum diganti.',
  },
  {
    nomor: 10,
    teks: 'Suci dalam pikiran, perkataan, dan perbuatan',
    makna: 'Menjaga kemurnian hati dan budi pekerti, tidak berbicara kotor/dusta, dan senantiasa berbuat kebajikan.',
    contohKemah: 'Tidak mengeluarkan kata-kata kasar/umpatan saat lelah di perjalanan dan menjunjung tinggi sportivitas dalam lomba antar-regu.',
  },
];

export const TRI_SATYA_DATA = {
  penggalang: [
    'Menjalankan kewajibanku terhadap Tuhan, Negara Kesatuan Republik Indonesia, dan mengamalkan Pancasila.',
    'Menolong sesama hidup dan mempersiapkan diri membangun masyarakat.',
    'Menepati Dasa Darma.',
  ],
  penegak: [
    'Menjalankan kewajibanku terhadap Tuhan, Negara Kesatuan Republik Indonesia, dan mengamalkan Pancasila.',
    'Menolong sesama hidup dan ikut serta membangun masyarakat.',
    'Menepati Dasa Darma.',
  ],
};

export interface SimpulItem {
  id: string;
  nama: string;
  kategori: 'Simpul' | 'Ikatan';
  kesulitan: 'Mudah' | 'Sedang' | 'Mahir';
  fungsi: string;
  langkah: string[];
  kegunaanKemah: string;
}

export const DAFTAR_SIMPUL: SimpulItem[] = [
  {
    id: 'simpul-hidup',
    nama: 'Simpul Hidup (Slip Knot)',
    kategori: 'Simpul',
    kesulitan: 'Mudah',
    fungsi: 'Mengikat tiang atau pasak tenda yang mudah dilepas kembali dengan satu tarikan.',
    langkah: [
      'Buat satu sosok/lingkaran (loop) pada tali.',
      'Masukkan ujung tali melipat melalui lingkaran dari belakang ke depan.',
      'Tarik bagian lipatan sehingga membentuk simpul yang dapat melonggar jika ujung bebas ditarik.',
    ],
    kegunaanKemah: 'Mengikat tali hewan ternak darurat atau tali sementara pada tiang tenda.',
  },
  {
    id: 'simpul-mati',
    nama: 'Simpul Mati (Reef Knot)',
    kategori: 'Simpul',
    kesulitan: 'Mudah',
    fungsi: 'Menyambung 2 utas tali yang sama besar dan dalam keadaan kering.',
    langkah: [
      'Pegang kedua ujung tali, silangkan tali kiri di atas tali kanan lalu belitkan sekali.',
      'Silangkan kembali tali kanan di atas tali kiri (arah berlawanan dari langkah pertama).',
      'Tarik kedua ujung bersamaan hingga simpul rapat dan rata (berbentuk gelang ganda).',
    ],
    kegunaanKemah: 'Menyambung tali tenda yang putus dan mengikat perban segitiga (mitela) pada korban P3K.',
  },
  {
    id: 'simpul-pangkal',
    nama: 'Simpul Pangkal (Clove Hitch)',
    kategori: 'Simpul',
    kesulitan: 'Mudah',
    fungsi: 'Permulaan atau akhiran dalam membuat ikatan pionering pada tongkat pramuka.',
    langkah: [
      'Lilitkan tali melingkari tongkat ke arah kanan.',
      'Silangkan tali di atas lilitan pertama, lalu lingkarkan sekali lagi ke arah belakang.',
      'Selipkan ujung tali di bawah lilitan kedua, lalu tarik kencang kedua arah.',
    ],
    kegunaanKemah: 'Wajib digunakan untuk mengawali dan mengakhiri pembuatan tiang bendera, menara, dan tandu.',
  },
  {
    id: 'simpul-jangkar',
    nama: 'Simpul Jangkar (Cow Hitch)',
    kategori: 'Simpul',
    kesulitan: 'Mudah',
    fungsi: 'Membuat tandu darurat, menalikan ember air di sumur, atau mengikat tali pada pasak.',
    langkah: [
      'Bagi dua tali secara simetris dan lingkarkan pada tongkat.',
      'Tarik kedua ujung tali masuk ke dalam rongga lingkaran simpul.',
      'Tarik kencang hingga mencengkeram erat pada kayu/batang.',
    ],
    kegunaanKemah: 'Pondasi anyaman jaring tandu darurat (dragbar) dan mengikat tali pasak utama.',
  },
  {
    id: 'simpul-anyam',
    nama: 'Simpul Anyam (Sheet Bend)',
    kategori: 'Simpul',
    kesulitan: 'Sedang',
    fungsi: 'Menyambung 2 utas tali yang tidak sama besar ukurannya dalam kondisi kering.',
    langkah: [
      'Tekuk tali yang lebih besar sehingga membentuk huruf U (bight).',
      'Masukkan ujung tali yang lebih kecil dari bawah ke dalam tekukan.',
      'Lingkarkan tali kecil mengitari kedua kaki tali besar.',
      'Selipkan ujung tali kecil di bawah badannya sendiri (jangan masuk kembali ke tekukan) lalu tarik kencang.',
    ],
    kegunaanKemah: 'Menyambung tali nilon kecil dengan tali tambang dadung tenda.',
  },
  {
    id: 'simpul-anyam-berganda',
    nama: 'Simpul Anyam Berganda (Double Sheet Bend)',
    kategori: 'Simpul',
    kesulitan: 'Sedang',
    fungsi: 'Menyambung 2 tali tidak sama besar dalam keadaan basah atau licin.',
    langkah: [
      'Lakukan langkah simpul anyam tunggal.',
      'Lilitkan tali kecil satu putaran tambahan lagi mengitari tekukan tali besar.',
      'Selipkan ujungnya dan kencangkan.',
    ],
    kegunaanKemah: 'Menyambung tali saat hujan lebat di area penjelajahan.',
  },
  {
    id: 'simpul-kembar',
    nama: 'Simpul Kembar / Nelayan (Fisherman Knot)',
    kategori: 'Simpul',
    kesulitan: 'Sedang',
    fungsi: 'Menyambung 2 utas tali yang sama besar dalam keadaan basah atau licin.',
    langkah: [
      'Jajarkan kedua tali saling berhadapan ujungnya.',
      'Gunakan tali A untuk mengikat simpul hidup melingkari tali B.',
      'Gunakan tali B untuk mengikat simpul hidup melingkari tali A.',
      'Tarik kedua ujung tali utama hingga kedua simpul bergeser saling merapat dan mengunci.',
    ],
    kegunaanKemah: 'Menyambung tali penghela perahu, tali flying fox darurat, atau tali nilon basah.',
  },
  {
    id: 'simpul-tiang',
    nama: 'Simpul Tiang (Bowline)',
    kategori: 'Simpul',
    kesulitan: 'Mahir',
    fungsi: 'Membuat jerat tali tetap yang tidak dapat menjepit, berguna untuk evakuasi penyelamatan.',
    langkah: [
      'Buat lubang kecil (lubang kelinci) pada tali utama.',
      'Ujung tali (kelinci) keluar dari lubang dari arah bawah.',
      'Ujung tali mengitari batang pohon (pohon di belakang lubang).',
      'Ujung tali melompat kembali masuk ke dalam lubang kelinci, lalu tarik kencang.',
    ],
    kegunaanKemah: 'Mengikat tubuh korban saat evakuasi jurang/sungai tanpa mencekik dada korban.',
  },
  {
    id: 'ikatan-palang',
    nama: 'Ikatan Palang (Square Lashing)',
    kategori: 'Ikatan',
    kesulitan: 'Sedang',
    fungsi: 'Mengikat 2 tongkat pramuka yang bersilangan tegak lurus (90 derajat).',
    langkah: [
      'Awali dengan Simpul Pangkal pada tongkat vertikal di bawah persilangan.',
      'Lilitkan tali mengitari kedua tongkat secara bergantian (depan-belakang) sebanyak 3-4 putaran kencang.',
      'Lakukan "frapping" (lilitan pengunci di antara kedua tongkat) sebanyak 2-3 putaran.',
      'Akhiri dengan Simpul Pangkal pada tongkat horizontal.',
    ],
    kegunaanKemah: 'Membuat meja makan darurat, tiang jemuran, rak piring, dan gerbang kemah.',
  },
  {
    id: 'ikatan-silang',
    nama: 'Ikatan Silang (Diagonal Lashing)',
    kategori: 'Ikatan',
    kesulitan: 'Mahir',
    fungsi: 'Mengikat 2 tongkat yang bersilangan miring dan menahan tarikan beban diagonal.',
    langkah: [
      'Awali dengan Simpul Tambat (timber hitch) atau Pangkal pada titik persilangan diagonal.',
      'Lilitkan tali menyilang 3 kali pada sudut satu, lalu silangkan 3 kali pada sudut sebaliknya membentuk huruf X.',
      'Kunci dengan lilitan penguat (frapping) di celah persilangan.',
      'Kunci mati dengan simpul pangkal pada salah satu tongkat.',
    ],
    kegunaanKemah: 'Konstruksi kaki menara pandang, tiang bendera tiga kaki (tripod), dan jembatan rimba.',
  },
];

export interface RundownItem {
  id: string;
  waktu: string;
  hari: 'Sabtu' | 'Minggu';
  kegiatan: string;
  pj: string;
  lokasi: string;
  isSelesai: boolean;
}

export const INITIAL_RUNDOWN_PERSAMI: RundownItem[] = [
  { id: 'r1', hari: 'Sabtu', waktu: '13.00 - 14.00', kegiatan: 'Kedatangan Peserta, Registrasi & Pendirian Tenda Regu', pj: 'Kak Dimas & Pradana', lokasi: 'Bumi Perkemahan', isSelesai: true },
  { id: 'r2', hari: 'Sabtu', waktu: '14.00 - 15.00', kegiatan: 'Upacara Pembukaan Persami & Penyematan Tanda Peserta', pj: 'Ka Gudep & Pembina', lokasi: 'Lapangan Utama', isSelesai: true },
  { id: 'r3', hari: 'Sabtu', waktu: '15.00 - 16.30', kegiatan: 'Lomba Keterampilan Pionering Tandu & Menara Kaki Tiga', pj: 'Seksi Giat Prestasi', lokasi: 'Sektor Lomba', isSelesai: false },
  { id: 'r4', hari: 'Sabtu', waktu: '16.30 - 17.30', kegiatan: 'Ishoma (Mandi, Salat Ashar, & Kebersihan Tenda)', pj: 'Sie Kerohanian & Pinru', lokasi: 'Tenda & Mushola', isSelesai: false },
  { id: 'r5', hari: 'Sabtu', waktu: '17.30 - 19.30', kegiatan: 'Makan Malam Bersama Masakan Rimba & Salat Maghrib-Isya', pj: 'Sie Konsumsi Regu', lokasi: 'Dapur Regu', isSelesai: false },
  { id: 'r6', hari: 'Sabtu', waktu: '19.30 - 22.00', kegiatan: 'Upacara Api Unggun Gembira, Pentas Seni & Pengucapan Dasa Darma', pj: 'Kak Sarah & Panitia', lokasi: 'Lingkaran Api', isSelesai: false },
  { id: 'r7', hari: 'Sabtu', waktu: '22.00 - 04.30', kegiatan: 'Malam Renungan Suci & Berlayar ke Pulau Kapuk (Istirahat)', pj: 'Seksi Keamanan Camp', lokasi: 'Tenda Masing-masing', isSelesai: false },
  { id: 'r8', hari: 'Minggu', waktu: '04.30 - 05.30', kegiatan: 'Bangun Pagi, Salat Subuh Berjamaah & Senam Pramuka', pj: 'Kak Rizki', lokasi: 'Lapangan Utama', isSelesai: false },
  { id: 'r9', hari: 'Minggu', waktu: '05.30 - 07.00', kegiatan: 'Sarapan Pagi, Kurve Tenda & Pemeriksaan Kebersihan Kerapian', pj: 'Juri Kebersihan Tenda', lokasi: 'Area Perkemahan', isSelesai: false },
  { id: 'r10', hari: 'Minggu', waktu: '07.00 - 10.30', kegiatan: 'Wide Game / Penjelajahan 5 Pos (Sandi, Menaksir, P3K, Halang Rintang)', pj: 'Seluruh Pembina Pos', lokasi: 'Rute Rimba', isSelesai: false },
  { id: 'r11', hari: 'Minggu', waktu: '10.30 - 11.30', kegiatan: 'Bongkar Tenda, Operasi Semut (Kebersihan Lingkungan Camp)', pj: 'Koordinator Lingkungan', lokasi: 'Tapak Perkemahan', isSelesai: false },
  { id: 'r12', hari: 'Minggu', waktu: '11.30 - 12.30', kegiatan: 'Upacara Penutupan, Pengumuman Regu Terbaik & Sayonara', pj: 'Ka Mabigus', lokasi: 'Lapangan Utama', isSelesai: false },
];

export interface ChecklistKemahItem {
  id: string;
  kategori: 'Pribadi' | 'Regu' | 'Logistik & Masak' | 'P3K Darurat' | 'Seragam & Dokumen';
  nama: string;
  isChecked: boolean;
}

export const INITIAL_CHECKLIST_KEMAH: ChecklistKemahItem[] = [
  // Pribadi
  { id: 'c1', kategori: 'Pribadi', nama: 'Ransel / Carrier 40-60L', isChecked: true },
  { id: 'c2', kategori: 'Pribadi', nama: 'Sleeping Bag (Kantung Tidur) & Matras Angin/Spon', isChecked: true },
  { id: 'c3', kategori: 'Pribadi', nama: 'Senter Kepala (Headlamp) & Baterai Cadangan', isChecked: true },
  { id: 'c4', kategori: 'Pribadi', nama: 'Ponco / Jas Hujan Kelelawar', isChecked: false },
  { id: 'c5', kategori: 'Pribadi', nama: 'Baju Ganti 2 Stel & Jaket Hangat Lapangan', isChecked: false },
  { id: 'c6', kategori: 'Pribadi', nama: 'Peralatan Mandi & Ibadah', isChecked: false },
  { id: 'c7', kategori: 'Pribadi', nama: 'Botol Minum / Tumbler 1 Liter', isChecked: true },
  // Regu
  { id: 'c8', kategori: 'Regu', nama: 'Tenda Dome Kapasitas 6 Orang + Pasak Besi', isChecked: true },
  { id: 'c9', kategori: 'Regu', nama: 'Flysheet Terpal Pelindung Hujan 3x4 Meter', isChecked: true },
  { id: 'c10', kategori: 'Regu', nama: 'Tongkat Pramuka 160 cm (minimal 8 batang per regu)', isChecked: true },
  { id: 'c11', kategori: 'Regu', nama: 'Tali Pramuka Tambang Nilon (10 gulung)', isChecked: true },
  { id: 'c12', kategori: 'Regu', nama: 'Cangkul Kecil & Golok Tebas Pramuka', isChecked: false },
  { id: 'c13', kategori: 'Regu', nama: 'Bendera Regu & Tiang Pembawa Regu', isChecked: true },
  // Logistik
  { id: 'c14', kategori: 'Logistik & Masak', nama: 'Kompor Lapangan (Nesting / Portable Gas)', isChecked: true },
  { id: 'c15', kategori: 'Logistik & Masak', nama: 'Nesting Masak TNI / Wajan Camping', isChecked: false },
  { id: 'c16', kategori: 'Logistik & Masak', nama: 'Beras 2 kg, Telur, Mie Instan & Bumbu Dapur', isChecked: false },
  { id: 'c17', kategori: 'Logistik & Masak', nama: 'Korek Api Gas & Lilin Batang Tahan Angin', isChecked: true },
  { id: 'c18', kategori: 'Logistik & Masak', nama: 'Plastik Sampah Besar (Trash Bag hitam)', isChecked: true },
  // P3K
  { id: 'c19', kategori: 'P3K Darurat', nama: 'Kotak P3K Regu Lengkap', isChecked: true },
  { id: 'c20', kategori: 'P3K Darurat', nama: 'Kain Mitela Segitiga (minimal 4 helai)', isChecked: true },
  { id: 'c21', kategori: 'P3K Darurat', nama: 'Kasa Steril, Plester Cepat & Betadine', isChecked: true },
  { id: 'c22', kategori: 'P3K Darurat', nama: 'Minyak Kayu Putih, Paracetamol & Oralit', isChecked: false },
  // Seragam
  { id: 'c23', kategori: 'Seragam & Dokumen', nama: 'Seragam Pramuka Lengkap dengan Hasduk/Setangan Leher', isChecked: true },
  { id: 'c24', kategori: 'Seragam & Dokumen', nama: 'Buku Saku Pramuka & Alat Tulis Buku SKU', isChecked: true },
  { id: 'c25', kategori: 'Seragam & Dokumen', nama: 'Peluit Pramuka & Kompas Bidik', isChecked: true },
];

export interface SkuRamuItem {
  nomor: number;
  kategori: string;
  butir: string;
  indikator: string;
  isLulus: boolean;
  tglUji?: string;
  penguji?: string;
}

export const INITIAL_SKU_RAMU: SkuRamuItem[] = [
  { nomor: 1, kategori: 'Spiritual', butir: 'Dapat melaksanakan ibadah sesuai dengan agama yang dianutnya.', indikator: 'Hafal doa harian atau bacaan salat/ibadah wajib.', isLulus: true, tglUji: '2026-08-14', penguji: 'Kak Dimas Pratama' },
  { nomor: 2, kategori: 'Spiritual', butir: 'Dapat menjelaskan tentang toleransi beragama dalam perkemahan.', indikator: 'Menghormati teman yang sedang beribadah.', isLulus: true, tglUji: '2026-08-20', penguji: 'Kak Dimas Pratama' },
  { nomor: 3, kategori: 'Nasionalisme', butir: 'Hafal Tri Satya dan Dasa Darma Pramuka serta dapat melafalkannya.', indikator: 'Lafal lantang dan memahami arti kesatria.', isLulus: true, tglUji: '2026-08-27', penguji: 'Kak Sarah Wijaya' },
  { nomor: 4, kategori: 'Keterampilan', butir: 'Dapat membuat dan menggunakan simpul hidup, mati, pangkal, dan jangkar.', indikator: 'Praktik menali tongkat dengan kecepatan < 30 detik.', isLulus: true, tglUji: '2026-09-03', penguji: 'Kak Dimas Pratama' },
  { nomor: 5, kategori: 'Keterampilan', butir: 'Dapat mengirim dan menerima sandi morse dengan peluit atau senter.', indikator: 'Minimal mampu mengirim 1 kata lengkap tanpa kesalahan.', isLulus: false },
  { nomor: 6, kategori: 'Keterampilan', butir: 'Dapat mempraktikkan pengiriman isyarat semaphore huruf A sampai Z.', indikator: 'Posisi lengan tegak dan sudut bendera presisi.', isLulus: false },
  { nomor: 7, kategori: 'Kesehatan & P3K', butir: 'Dapat merawat luka lecet dan membalut luka dengan perban mitela segitiga.', indikator: 'Balutan rapi dan simpul mati terkunci benar.', isLulus: false },
  { nomor: 8, kategori: 'Ketangkasan', butir: 'Dapat menggunakan kompas bidik untuk menentukan 16 arah mata angin.', indikator: 'Mampu membidik sasaran azimut dan mencari back-azimut.', isLulus: false },
  { nomor: 9, kategori: 'Kepanduan', butir: 'Dapat menceritakan riwayat Lord Baden-Powell dan sejarah Pramuka Indonesia.', indikator: 'Mengetahui peran Sri Sultan Hamengkubuwono IX.', isLulus: false },
  { nomor: 10, kategori: 'Sosial', butir: 'Rajin menabung dan memiliki buku tabungan aktif sendiri.', indikator: 'Menunjukkan bukti buku tabungan bank/sekolah.', isLulus: false },
];

export interface TkkItem {
  id: string;
  nama: string;
  bidang: 'Merah' | 'Putih' | 'Hijau' | 'Biru' | 'Kuning';
  namaBidang: string;
  tingkat: 'Purwa' | 'Madya' | 'Utama';
  bentuk: 'Lingkaran' | 'Persegi' | 'Segilima';
  deskripsi: string;
  syaratUtama: string;
}

export const KATALOG_TKK: TkkItem[] = [
  { id: 'tkk-1', nama: 'TKK Berkemah', bidang: 'Putih', namaBidang: 'Ketangkasan & Kesehatan', tingkat: 'Purwa', bentuk: 'Lingkaran', deskripsi: 'Kecakapan mendirikan tenda, tidur di alam terbuka, dan menjaga sanitasi perkemahan.', syaratUtama: 'Pernah berkemah sekurang-kurangnya 3 hari berturut-turut.' },
  { id: 'tkk-2', nama: 'TKK Pertolongan Pertama (P3K)', bidang: 'Putih', namaBidang: 'Ketangkasan & Kesehatan', tingkat: 'Purwa', bentuk: 'Lingkaran', deskripsi: 'Kecakapan menangani cedera ringan, luka lecet, patah tulang darurat, dan membalut luka.', syaratUtama: 'Tahu cara menolong orang pingsan dan menghentikan pendarahan.' },
  { id: 'tkk-3', nama: 'TKK Pengamat (Scoutcraft)', bidang: 'Putih', namaBidang: 'Ketangkasan & Kesehatan', tingkat: 'Madya', bentuk: 'Persegi', deskripsi: 'Kecakapan mengingat jejak, rute tanda jejak alam, dan daya ingat benda (Kim game).', syaratUtama: 'Mampu mengingat 15 benda dalam waktu 1 menit setelah ditutup.' },
  { id: 'tkk-4', nama: 'TKK Juru Masak', bidang: 'Hijau', namaBidang: 'Keterampilan & Pembangunan', tingkat: 'Purwa', bentuk: 'Lingkaran', deskripsi: 'Kecakapan mengolah makanan rimba dan menggunakan kompor perkemahan secara aman.', syaratUtama: 'Dapat memasak nasi liwet untuk 1 regu dan sayur sederhana.' },
  { id: 'tkk-5', nama: 'TKK Menabung', bidang: 'Kuning', namaBidang: 'Agama, Moral, & Kejiwaan', tingkat: 'Purwa', bentuk: 'Lingkaran', deskripsi: 'Kecakapan mengelola uang saku dan menabung rutin di bank atau koperasi sekolah.', syaratUtama: 'Memiliki tabungan teratur minimal selama 3 bulan berturut-turut.' },
  { id: 'tkk-6', nama: 'TKK Pengatur Ruangan / Tenda', bidang: 'Hijau', namaBidang: 'Keterampilan & Pembangunan', tingkat: 'Purwa', bentuk: 'Lingkaran', deskripsi: 'Kecakapan menata kerapian isi tenda regu dan perlengkapan agar higienis dan rapi.', syaratUtama: 'Mampu menata perlengkapan regu di dalam tenda secara ergonomis.' },
  { id: 'tkk-7', nama: 'TKK Pengaman Kampung (Jaga)', bidang: 'Biru', namaBidang: 'Sosial, Perikemanusiaan, & Damai', tingkat: 'Madya', bentuk: 'Persegi', deskripsi: 'Kecakapan melaksanakan ronda malam di tapak perkemahan dan membunyikan tanda bahaya.', syaratUtama: 'Pernah bertugas jaga malam di perkemahan dan mengetahui sandi peluit bahaya.' },
  { id: 'tkk-8', nama: 'TKK Penunjuk Jalan', bidang: 'Putih', namaBidang: 'Ketangkasan & Kesehatan', tingkat: 'Utama', bentuk: 'Segilima', deskripsi: 'Kecakapan membaca peta topografi, kompas, dan memandu regu menembus rute asing.', syaratUtama: 'Dapat membuat sketsa peta pita sepanjang rute penjelajahan 3 km.' },
];

export interface KuisSoal {
  id: number;
  pertanyaan: string;
  pilihan: string[];
  kunci: number;
  penjelasan: string;
}

export const KUIS_PRAMUKA_12: KuisSoal[] = [
  {
    id: 1,
    pertanyaan: 'Siapakah nama lengkap Bapak Pandu Sedunia yang mendirikan gerakan kepanduan pertama kali?',
    pilihan: ['Lord Robert Baden-Powell', 'Lord Mountbatten', 'Ernest Thompson Seton', 'William Boyce'],
    kunci: 0,
    penjelasan: 'Lord Robert Stephenson Smyth Baden-Powell mendirikan perkemahan Brownsea Island tahun 1907 yang melahirkan kepanduan dunia.',
  },
  {
    id: 2,
    pertanyaan: 'Siapakah tokoh pahlawan nasional yang diakui sebagai Bapak Pramuka Indonesia?',
    pilihan: ['Ir. Soekarno', 'Sri Sultan Hamengkubuwono IX', 'Ki Hajar Dewantara', 'KH Agus Salim'],
    kunci: 1,
    penjelasan: 'Sri Sultan Hamengkubuwono IX menjabat Ketua Kwartir Nasional pertama (1961-1974) dan menerima penghargaan Bronze Wolf dari WOSM.',
  },
  {
    id: 3,
    pertanyaan: 'Pada tanggal berapakah Hari Pramuka Indonesia diperingati setiap tahunnya?',
    pilihan: ['20 Mei', '14 Agustus', '28 Oktober', '10 November'],
    kunci: 1,
    penjelasan: '14 Agustus 1961 adalah pelantikan Majelis Pimpinan Nasional Gerakan Pramuka dan defile perdana di Istana Negara.',
  },
  {
    id: 4,
    pertanyaan: 'Pencipta lambang Tunas Kelapa (Siluet Bayangan Tunas Kelapa) Gerakan Pramuka adalah...',
    pilihan: ['Soenardjo Atmodipuro', 'H. Mutahar', 'Raden Soeharto', 'Wage Rudolf Soepratman'],
    kunci: 0,
    penjelasan: 'Soenardjo Atmodipuro adalah pegawai Departemen Pertanian yang mendesain siluet tunas kelapa pada 9 Maret 1961.',
  },
  {
    id: 5,
    pertanyaan: 'Berapakah panjang standar tongkat Pramuka penggalang yang sering digunakan dalam pionering?',
    pilihan: ['120 cm', '150 cm', '160 cm', '200 cm'],
    kunci: 2,
    penjelasan: 'Tongkat standar Pramuka Indonesia berukuran 160 cm dengan diameter 3 cm, cocok untuk menaksir tinggi pohon dan membuat dragbar tandu.',
  },
  {
    id: 6,
    pertanyaan: 'Simpul apakah yang digunakan untuk mengawali dan mengakhiri ikatan pionering pada kayu?',
    pilihan: ['Simpul Pangkal', 'Simpul Mati', 'Simpul Hidup', 'Simpul Jangkar'],
    kunci: 0,
    penjelasan: 'Simpul pangkal (Clove Hitch) mencengkeram erat tongkat dan tidak mudah bergeser sehingga menjadi simpul wajib pionering.',
  },
  {
    id: 7,
    pertanyaan: 'Jika sudut bidik kompas (Azimut) mengarah ke 60 derajat, berapakah sudut sasaran baliknya (Back-Azimut)?',
    pilihan: ['120 derajat', '240 derajat', '300 derajat', '180 derajat'],
    kunci: 1,
    penjelasan: 'Rumus Back-Azimut: Jika Azimut < 180°, maka ditambah 180° (60° + 180° = 240°).',
  },
  {
    id: 8,
    pertanyaan: 'Dalam isyarat sandi Morse, huruf "S" dilambangkan dengan bunyi...',
    pilihan: ['. - .', '. . .', '- - -', '. - -'],
    kunci: 1,
    penjelasan: 'Huruf S dalam Morse adalah 3 titik (...). Contoh terkenal SOS adalah: ... --- ...',
  },
  {
    id: 9,
    pertanyaan: 'Warna bendera semaphore kepramukaan yang berukuran 45x45 cm adalah kombinasi dari...',
    pilihan: ['Merah dan Putih', 'Merah dan Kuning', 'Kuning dan Hijau', 'Hitam dan Kuning'],
    kunci: 1,
    penjelasan: 'Bendera Semaphore internasional menggunakan warna Merah dan Kuning terang berpotongan diagonal agar terlihat jelas dari kejauhan.',
  },
  {
    id: 10,
    pertanyaan: 'Tanda Kecakapan Khusus (TKK) bidang Ketangkasan dan Kesehatan memiliki warna dasar...',
    pilihan: ['Putih', 'Kuning', 'Hijau', 'Merah'],
    kunci: 0,
    penjelasan: 'Warna dasar TKK: Putih (Kesehatan/Ketangkasan), Kuning (Agama), Merah (Patriotisme/Seni), Hijau (Keterampilan), Biru (Sosial).',
  },
  {
    id: 11,
    pertanyaan: 'Dasa Darma ke-5 berbunyi...',
    pilihan: ['Patuh dan suka bermusyawarah', 'Rela menolong dan tabah', 'Patriot yang sopan dan kesatria', 'Disiplin berani dan setia'],
    kunci: 1,
    penjelasan: 'Dasa Darma ke-5 adalah "Rela menolong dan tabah".',
  },
  {
    id: 12,
    pertanyaan: 'Siapakah pencipta lagu resmi "Hymne Pramuka" yang agung?',
    pilihan: ['Husein Mutahar (H. Mutahar)', 'Kusbini', 'Ismail Marzuki', 'Cornel Simanjuntak'],
    kunci: 0,
    penjelasan: 'H. Mutahar (Mayor Jenderal Husein Mutahar) adalah tokoh Pramuka yang menciptakan Hymne Pramuka, Hari Merdeka, dan Syukur.',
  },
];

export interface LaguPramuka {
  id: string;
  judul: string;
  pencipta: string;
  deskripsi: string;
  lirik: string[];
  tempoBpm: number;
  melody: { note: string; dur: number }[];
}

export const DAFTAR_LAGU_PRAMUKA: LaguPramuka[] = [
  {
    id: 'hymne-pramuka',
    judul: 'Hymne Satya Darma Pramuka',
    pencipta: 'H. Mutahar',
    deskripsi: 'Lagu wajib upacara penghormatan janji suci Pramuka Indonesia.',
    lirik: [
      'Kami Pramuka Indonesia',
      'Manusia Pancasila',
      'Satyaku kudharmakan, dharmaku kubaktikan',
      'Agar jaya Indonesia',
      'Indonesia tanah airku',
      'Kami jadi pandumu',
    ],
    tempoBpm: 84,
    melody: [
      { note: 'C4', dur: 1 }, { note: 'E4', dur: 1 }, { note: 'G4', dur: 1.5 }, { note: 'G4', dur: 0.5 },
      { note: 'A4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'E4', dur: 2 },
      { note: 'F4', dur: 1 }, { note: 'A4', dur: 1 }, { note: 'G4', dur: 1.5 }, { note: 'F4', dur: 0.5 },
      { note: 'E4', dur: 1 }, { note: 'D4', dur: 1 }, { note: 'C4', dur: 2 },
      { note: 'G4', dur: 1 }, { note: 'C5', dur: 1.5 }, { note: 'B4', dur: 0.5 }, { note: 'A4', dur: 1 },
      { note: 'G4', dur: 1 }, { note: 'E4', dur: 2 },
      { note: 'D4', dur: 1 }, { note: 'E4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'D4', dur: 1 },
      { note: 'C4', dur: 3 },
    ],
  },
  {
    id: 'api-unggun',
    judul: 'Api Unggun (Sudah Menyala)',
    pencipta: 'Tradisi Kepramukaan',
    deskripsi: 'Dinyanyikan saat api unggun mulai dinyalakan menyinari lingkaran persaudaraan.',
    lirik: [
      'Api kita sudah menyala',
      'Api kita sudah menyala',
      'Api, api, api kita',
      'Sudah menyala!',
    ],
    tempoBpm: 110,
    melody: [
      { note: 'C4', dur: 0.75 }, { note: 'E4', dur: 0.75 }, { note: 'G4', dur: 1.5 },
      { note: 'G4', dur: 0.75 }, { note: 'A4', dur: 0.75 }, { note: 'G4', dur: 1.5 },
      { note: 'E4', dur: 0.75 }, { note: 'E4', dur: 0.75 }, { note: 'D4', dur: 0.75 }, { note: 'D4', dur: 0.75 },
      { note: 'C4', dur: 2 },
    ],
  },
  {
    id: 'apa-guna-keluh-kesah',
    judul: 'Apa Guna Keluh Kesah',
    pencipta: 'Lagu Riang Pramuka',
    deskripsi: 'Pembangkit semangat riang gembira penjelajahan dan rintangan alam.',
    lirik: [
      'Apa guna keluh kesah',
      'Apa guna keluh kesah',
      'Pramuka tak kenal bersusah',
      'Apa guna keluh kesah!',
    ],
    tempoBpm: 120,
    melody: [
      { note: 'G4', dur: 1 }, { note: 'E4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'E4', dur: 1 },
      { note: 'C4', dur: 1 }, { note: 'D4', dur: 1 }, { note: 'E4', dur: 2 },
      { note: 'F4', dur: 1 }, { note: 'D4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'D4', dur: 1 },
      { note: 'E4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'G4', dur: 2 },
      { note: 'G4', dur: 1 }, { note: 'A4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'F4', dur: 1 },
      { note: 'E4', dur: 1 }, { note: 'D4', dur: 1 }, { note: 'C4', dur: 2 },
    ],
  },
];
