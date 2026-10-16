import React, { useState, useMemo, useEffect } from 'react';
import { Sekolah, Kegiatan, KategoriMateri } from '../types';
import { formatTanggalIndo, generateUid } from '../utils/storage';
import { MateriSiapPakai } from '../data/materiBank';
import { PilihMateriModal } from './PilihMateriModal';
import { MainModuleHeader } from './MainModuleHeader';
import {
  BookOpen,
  Plus,
  Calendar,
  Users,
  UserCheck,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  AlertCircle,
  Upload,
  UserPlus,
  Sparkles,
} from 'lucide-react';

interface KegiatanTabProps {
  sekolah: Sekolah | undefined;
  daftarSekolah: Sekolah[];
  sekolahAktifId: string;
  onSelectSekolahAktif: (id: string) => void;
  kegiatanList: Kegiatan[];
  onAddKegiatan: (kegiatan: Kegiatan) => void;
  onUpdateKegiatan: (kegiatan: Kegiatan) => void;
  onDeleteKegiatan: (id: string) => void;
  onAddPembinaToSekolah: (sekolahId: string, namaPembina: string) => void;
  onGetAttendanceCountForDate?: (sekolahId: string, tanggal: string) => number;
  initialMateriPrefill?: MateriSiapPakai | null;
  onClearMateriPrefill?: () => void;
  onOpenBankMateriTab?: () => void;
}

export const KegiatanTab: React.FC<KegiatanTabProps> = ({
  sekolah,
  daftarSekolah,
  sekolahAktifId,
  onSelectSekolahAktif,
  kegiatanList,
  onAddKegiatan,
  onUpdateKegiatan,
  onDeleteKegiatan,
  onAddPembinaToSekolah,
  onGetAttendanceCountForDate,
  initialMateriPrefill,
  onClearMateriPrefill,
  onOpenBankMateriTab,
}) => {
  const [filterKategori, setFilterKategori] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showPilihMateriModal, setShowPilihMateriModal] = useState(false);
  const [detailKegiatan, setDetailKegiatan] = useState<Kegiatan | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [tanggal, setTanggal] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [materi, setMateri] = useState('');
  const [kategoriMateri, setKategoriMateri] = useState<KategoriMateri>('Tekpram');
  const [peserta, setPeserta] = useState<number>(0);
  const [pelatih, setPelatih] = useState('');
  const [kendala, setKendala] = useState('');
  const [catatan, setCatatan] = useState('');
  const [fotoDokumentasi, setFotoDokumentasi] = useState<string>('');
  const [statusPelaksanaan, setStatusPelaksanaan] = useState<'Selesai' | 'Tertunda' | 'Dibatalkan'>('Selesai');

  // Inline Add New Pembina Form inside Kegiatan Modal
  const [showInlineAddPembina, setShowInlineAddPembina] = useState(false);
  const [newPembinaName, setNewPembinaName] = useState('');

  // Available Pembina list from currently active school
  const listPembinaSekolah = useMemo(() => {
    if (!sekolah) return [];
    const list = sekolah.daftarPembina && sekolah.daftarPembina.length > 0 
      ? [...sekolah.daftarPembina] 
      : (sekolah.pembina ? [sekolah.pembina] : []);
    return list;
  }, [sekolah]);

  // Auto-fill when navigated from Bank Materi
  useEffect(() => {
    if (initialMateriPrefill) {
      setEditingId(null);
      const today = new Date().toISOString().split('T')[0];
      setTanggal(today);
      setMateri(initialMateriPrefill.judul);
      setKategoriMateri(initialMateriPrefill.kategori);
      const attCount = onGetAttendanceCountForDate ? onGetAttendanceCountForDate(sekolahAktifId, today) : 0;
      setPeserta(attCount || 0);
      setPelatih(listPembinaSekolah[0] || sekolah?.pembina || '');
      setKendala('');
      setCatatan(
        `Alat & Bahan: ${initialMateriPrefill.alatBahan.join(', ')}. Target: ${initialMateriPrefill.indikator}`
      );
      setFotoDokumentasi('');
      setStatusPelaksanaan('Selesai');
      setShowModal(true);
      if (onClearMateriPrefill) {
        onClearMateriPrefill();
      }
    }
  }, [initialMateriPrefill, sekolahAktifId, onGetAttendanceCountForDate, listPembinaSekolah, sekolah?.pembina, onClearMateriPrefill]);

  const handleSelectMateriFromBank = (m: MateriSiapPakai) => {
    setMateri(m.judul);
    setKategoriMateri(m.kategori);
    setCatatan(
      `Alat & Bahan: ${m.alatBahan.join(', ')}. Target: ${m.indikator}`
    );
  };

  // Filtered Kegiatan
  const filteredKegiatan = useMemo(() => {
    return kegiatanList
      .filter((k) => {
        const matchSekolah = !sekolahAktifId || k.sekolahId === sekolahAktifId;
        const matchKategori = !filterKategori || k.kategoriMateri === filterKategori;
        return matchSekolah && matchKategori;
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [kegiatanList, sekolahAktifId, filterKategori]);

  const openAddModal = () => {
    setEditingId(null);
    const today = new Date().toISOString().split('T')[0];
    setTanggal(today);
    setMateri('');
    setKategoriMateri('Tekpram');
    // If attendance exists today, grab it
    const attCount = onGetAttendanceCountForDate ? onGetAttendanceCountForDate(sekolahAktifId, today) : 0;
    setPeserta(attCount || 0);
    setPelatih(listPembinaSekolah[0] || sekolah?.pembina || '');
    setKendala('');
    setCatatan('');
    setFotoDokumentasi('');
    setStatusPelaksanaan('Selesai');
    setShowInlineAddPembina(false);
    setNewPembinaName('');
    setShowModal(true);
  };

  const openEditModal = (k: Kegiatan) => {
    setEditingId(k.id);
    setTanggal(k.tanggal);
    setMateri(k.materi);
    setKategoriMateri(k.kategoriMateri);
    setPeserta(k.peserta);
    setPelatih(k.pelatih);
    setKendala(k.kendala || '');
    setCatatan(k.catatan || '');
    setFotoDokumentasi(k.fotoDokumentasi || '');
    setStatusPelaksanaan(k.statusPelaksanaan || 'Selesai');
    setShowInlineAddPembina(false);
    setNewPembinaName('');
    setShowModal(true);
  };

  const handleDateChange = (val: string) => {
    setTanggal(val);
    if (onGetAttendanceCountForDate && !editingId) {
      const count = onGetAttendanceCountForDate(sekolahAktifId, val);
      if (count > 0) {
        setPeserta(count);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFotoDokumentasi(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveInlinePembina = () => {
    if (!newPembinaName.trim() || !sekolahAktifId) return;
    const trimmed = newPembinaName.trim();
    onAddPembinaToSekolah(sekolahAktifId, trimmed);
    setPelatih(trimmed);
    setNewPembinaName('');
    setShowInlineAddPembina(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materi.trim() || !sekolahAktifId) return;

    const chosenPelatih = pelatih.trim() || (listPembinaSekolah[0] || sekolah?.pembina || '-');

    if (editingId) {
      const existing = kegiatanList.find((k) => k.id === editingId);
      if (existing) {
        onUpdateKegiatan({
          ...existing,
          tanggal,
          materi: materi.trim(),
          kategoriMateri,
          peserta: Number(peserta) || 0,
          pelatih: chosenPelatih,
          kendala: kendala.trim(),
          catatan: catatan.trim(),
          fotoDokumentasi: fotoDokumentasi || undefined,
          statusPelaksanaan,
        });
      }
    } else {
      const newKeg: Kegiatan = {
        id: generateUid('keg'),
        sekolahId: sekolahAktifId,
        tanggal,
        materi: materi.trim(),
        kategoriMateri,
        peserta: Number(peserta) || 0,
        pelatih: chosenPelatih,
        kendala: kendala.trim(),
        catatan: catatan.trim(),
        fotoDokumentasi: fotoDokumentasi || undefined,
        statusPelaksanaan,
      };
      onAddKegiatan(newKeg);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Utama Modul Jurnal Latihan (Blue) */}
      <MainModuleHeader
        tabId="kegiatan"
        customBadges={[
          { label: `${filteredKegiatan.length} Pertemuan Tercatat`, icon: BookOpen },
          { label: `Pangkalan: ${sekolah?.nama || '-'}`, icon: Calendar },
          { label: `Pembina: ${sekolah?.pembina || '-'}`, icon: Users },
        ]}
        rightAction={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPilihMateriModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-md border border-white/20 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Pilih Bank Materi</span>
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-950 bg-blue-200 hover:bg-blue-100 rounded-xl shadow-md transition-all cursor-pointer border border-blue-300"
            >
              <Plus className="w-4 h-4 text-blue-900" />
              <span>+ Catat Latihan Baru</span>
            </button>
          </div>
        }
      />

      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Jurnal Kegiatan & Materi Latihan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Catatan kronologis silabus latihan, evaluasi pertemuan, materi SKU/SKK, dan dokumentasi lapangan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* School Selector */}
          <select
            value={sekolahAktifId}
            onChange={(e) => onSelectSekolahAktif(e.target.value)}
            className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-800"
          >
            {daftarSekolah.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama} ({s.tingkat})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowPilihMateriModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Buka Bank Materi untuk memilih silabus siap pakai"
          >
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Pilih Bank Materi</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Latihan Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Kategori Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-medium shrink-0">Filter Materi:</span>
        {(['', 'SKU', 'SKK', 'Tekpram', 'PBB', 'Outbound', 'Upacara'] as const).map((kat) => (
          <button
            key={kat}
            onClick={() => setFilterKategori(kat)}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              filterKategori === kat
                ? 'bg-slate-900 text-white font-medium'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {kat === '' ? 'Semua Kategori' : kat}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredKegiatan.map((keg) => {
          return (
            <div
              key={keg.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-xs"
            >
              <div>
                {/* Photo Header (if any) */}
                {keg.fotoDokumentasi ? (
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden group">
                    <img
                      src={keg.fotoDokumentasi}
                      alt={keg.materi}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    <button
                      onClick={() => setDetailKegiatan(keg)}
                      className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-slate-900/80 hover:bg-slate-900 backdrop-blur-xs rounded-md cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat Foto
                    </button>
                  </div>
                ) : (
                  <div className="h-24 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 p-4 flex flex-col justify-end text-white">
                    <span className="text-[11px] font-semibold text-emerald-300 tracking-wider uppercase">
                      {keg.kategoriMateri}
                    </span>
                    <span className="text-xs text-slate-300">{formatTanggalIndo(keg.tanggal)}</span>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  {keg.fotoDokumentasi && (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-emerald-800">{keg.kategoriMateri}</span>
                      <span>{formatTanggalIndo(keg.tanggal)}</span>
                    </div>
                  )}

                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                    {keg.materi}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="tabular-nums font-medium text-slate-800">{keg.peserta} Orang Hadir</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate" title={keg.pelatih}>
                        {keg.pelatih}
                      </span>
                    </div>
                  </div>

                  {keg.catatan && (
                    <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100">
                      {keg.catatan}
                    </p>
                  )}

                  {keg.kendala && (
                    <div className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50/70 p-2 rounded border border-amber-100">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{keg.kendala}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                  {keg.statusPelaksanaan === 'Selesai' && (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Selesai
                    </span>
                  )}
                  {keg.statusPelaksanaan === 'Tertunda' && (
                    <span className="text-amber-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Tertunda
                    </span>
                  )}
                  {keg.statusPelaksanaan === 'Dibatalkan' && (
                    <span className="text-rose-700 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Batal
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDetailKegiatan(keg)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                    title="Detail"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(keg)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus catatan jurnal tanggal ${keg.tanggal}?`)) {
                        onDeleteKegiatan(keg.id);
                      }
                    }}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredKegiatan.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-800">Belum ada jurnal kegiatan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Catat agenda materi latihan pramuka, jumlah kehadiran peserta, dan dokumentasi lapangan pertama Anda.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Catat Latihan Sekarang
          </button>
        </div>
      )}

      {/* Modal Add / Edit Jurnal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {editingId ? 'Edit Catatan Latihan' : 'Tambah Catatan Latihan'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pangkalan: <span className="font-semibold text-slate-700">{sekolah?.nama}</span>
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Tanggal Pelaksanaan *</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Kategori Materi</label>
                  <select
                    value={kategoriMateri}
                    onChange={(e) => setKategoriMateri(e.target.value as KategoriMateri)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                  >
                    <option value="Tekpram">Tekpram (Teknik Kepramukaan)</option>
                    <option value="SKU">Syarat Kecakapan Umum (SKU)</option>
                    <option value="SKK">Syarat Kecakapan Khusus (SKK)</option>
                    <option value="PBB">Peraturan Baris Berbaris (PBB)</option>
                    <option value="Outbound">Outbound & Games</option>
                    <option value="Upacara">Upacara Pembukaan / Penutupan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">Judul / Materi Pokok Latihan *</label>
                  <button
                    type="button"
                    onClick={() => setShowPilihMateriModal(true)}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pilih dari Bank Materi Siap Pakai</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={materi}
                  onChange={(e) => setMateri(e.target.value)}
                  placeholder="Contoh: Pionering Tiang Bendera & Sandi Kotak"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700">Jumlah Peserta Hadir</label>
                    {onGetAttendanceCountForDate && (
                      <button
                        type="button"
                        onClick={() => {
                          const count = onGetAttendanceCountForDate(sekolahAktifId, tanggal);
                          setPeserta(count);
                        }}
                        className="text-[11px] text-emerald-700 hover:underline cursor-pointer"
                      >
                        Tarik Presensi
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={peserta}
                    onChange={(e) => setPeserta(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 tabular-nums"
                  />
                </div>

                {/* FITUR PILIH / TAMBAH PEMBINA PADA KEGIATAN */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700">Pembina / Pelatih Bertugas</label>
                    <button
                      type="button"
                      onClick={() => setShowInlineAddPembina(!showInlineAddPembina)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-0.5 font-medium cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>{showInlineAddPembina ? 'Batal' : '+ Tambah Baru'}</span>
                    </button>
                  </div>

                  {!showInlineAddPembina ? (
                    <div className="space-y-1">
                      <select
                        value={pelatih}
                        onChange={(e) => setPelatih(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                      >
                        <option value="">-- Pilih Pembina Terdaftar --</option>
                        {listPembinaSekolah.map((pName) => (
                          <option key={pName} value={pName}>
                            {pName}
                          </option>
                        ))}
                      </select>
                      {/* Optional manual override */}
                      <input
                        type="text"
                        value={pelatih}
                        onChange={(e) => setPelatih(e.target.value)}
                        placeholder="Atau ketik nama pembina..."
                        className="w-full px-3 py-1.5 text-[11px] border border-slate-200 rounded-lg focus:outline-emerald-600 bg-slate-50"
                      />
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1.5">
                      <span className="text-[11px] font-semibold text-emerald-900 block">
                        Daftarkan Pembina Baru ke Sekolah Ini:
                      </span>
                      <input
                        type="text"
                        autoFocus
                        value={newPembinaName}
                        onChange={(e) => setNewPembinaName(e.target.value)}
                        placeholder="Nama Pembina / Pelatih Baru"
                        className="w-full px-2.5 py-1.5 text-xs border border-emerald-300 rounded-md bg-white focus:outline-emerald-600"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowInlineAddPembina(false)}
                          className="px-2 py-1 text-[11px] text-slate-600 hover:bg-emerald-100 rounded cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveInlinePembina}
                          className="px-2.5 py-1 text-[11px] font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-xs cursor-pointer"
                        >
                          Simpan & Gunakan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Catatan & Uraian Kegiatan</label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Ringkasan jalannya latihan, capaian siswa..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Kendala & Evaluasi (Opsional)</label>
                <textarea
                  rows={2}
                  value={kendala}
                  onChange={(e) => setKendala(e.target.value)}
                  placeholder="Kendala cuaca, peralatan kurang, dsb..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              {/* Upload Foto Dokumentasi */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 block">Foto Dokumentasi Kegiatan</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors border border-slate-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {fotoDokumentasi && (
                    <button
                      type="button"
                      onClick={() => setFotoDokumentasi('')}
                      className="text-xs text-rose-600 hover:underline cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                {fotoDokumentasi && (
                  <div className="mt-2 relative w-full h-32 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                    <img
                      src={fotoDokumentasi}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Status Pelaksanaan</label>
                <select
                  value={statusPelaksanaan}
                  onChange={(e) => setStatusPelaksanaan(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                >
                  <option value="Selesai">Selesai (Terlaksana Penuh)</option>
                  <option value="Tertunda">Tertunda (Direschedule)</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan' : 'Simpan Jurnal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal Lightbox */}
      {detailKegiatan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            {detailKegiatan.fotoDokumentasi && (
              <div className="w-full max-h-72 bg-slate-950 overflow-hidden">
                <img
                  src={detailKegiatan.fotoDokumentasi}
                  alt={detailKegiatan.materi}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-emerald-800">{detailKegiatan.kategoriMateri}</span>
                <span>{formatTanggalIndo(detailKegiatan.tanggal)}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">{detailKegiatan.materi}</h3>

              <div className="space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span>Pelatih Pembina:</span>
                  <span className="font-medium text-slate-900">{detailKegiatan.pelatih}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Peserta Hadir:</span>
                  <span className="font-medium text-slate-900">{detailKegiatan.peserta} Orang</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-emerald-700">{detailKegiatan.statusPelaksanaan}</span>
                </div>
                {detailKegiatan.catatan && (
                  <div className="mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[11px] mb-0.5">Catatan:</span>
                    <p>{detailKegiatan.catatan}</p>
                  </div>
                )}
                {detailKegiatan.kendala && (
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 text-amber-900">
                    <span className="text-amber-700 block text-[11px] mb-0.5">Kendala:</span>
                    <p>{detailKegiatan.kendala}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setDetailKegiatan(null)}
                  className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quick Selector dari Bank Materi */}
      <PilihMateriModal
        isOpen={showPilihMateriModal}
        onClose={() => setShowPilihMateriModal(false)}
        onSelectMateri={handleSelectMateriFromBank}
      />
    </div>
  );
};
