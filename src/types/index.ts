export type TingkatSekolah = 'SD' | 'SMP' | 'SMA' | 'SMK';

export interface Sekolah {
  id: string;
  nama: string;
  tingkat: TingkatSekolah;
  alamat: string;
  gudep: string;
  hariLatihan: string;
  jamLatihan: string;
  pembina: string;
  daftarPembina?: string[];
  logoUrl?: string;
  logoPramukaUrl?: string;
  logoPangkalanUrl?: string;
  honorPerPertemuan: number;
  kepalaSekolah: string;
  nipKepsek: string;
  createdAt: string;
}

export type JenisKelamin = 'L' | 'P';

export interface Siswa {
  id: string;
  sekolahId: string;
  nama: string;
  kelas: string;
  nis: string;
  jenisKelamin: JenisKelamin;
  regu: string;
  jabatan: string;
}

export type StatusAbsensi = 'H' | 'I' | 'S' | 'A';

// Key: `${sekolahId}_${date}_${siswaId}` => StatusAbsensi
export type AbsensiMap = Record<string, StatusAbsensi>;

export type KategoriMateri = 'SKU' | 'SKK' | 'Tekpram' | 'PBB' | 'Outbound' | 'Upacara' | 'Lainnya';

export interface Kegiatan {
  id: string;
  sekolahId: string;
  tanggal: string;
  materi: string;
  kategoriMateri: KategoriMateri;
  peserta: number;
  pelatih: string;
  kendala: string;
  catatan: string;
  fotoDokumentasi?: string;
  statusPelaksanaan: 'Selesai' | 'Tertunda' | 'Dibatalkan';
}

export interface PembayaranHonor {
  id: string;
  sekolahId: string;
  bulan: string; // YYYY-MM
  pelatih: string;
  jumlahPertemuan: number;
  tarifPerPertemuan: number;
  totalHonor: number;
  statusBayar: 'Lunas' | 'Belum Lunas';
  tanggalBayar?: string;
  catatan?: string;
}

export interface AppState {
  daftarSekolah: Sekolah[];
  sekolahAktifId: string;
  siswa: Siswa[];
  kegiatan: Kegiatan[];
  absensi: AbsensiMap;
  honor: PembayaranHonor[];
}
