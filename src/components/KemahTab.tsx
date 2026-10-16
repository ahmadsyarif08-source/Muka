import React, { useState, useMemo } from 'react';
import {
  INITIAL_RUNDOWN_PERSAMI,
  INITIAL_CHECKLIST_KEMAH,
  RundownItem,
  ChecklistKemahItem,
} from '../data/pramukaData';
import {
  Calendar,
  Sparkles,
  CheckSquare,
  Users,
  ShieldAlert,
  Clock,
  Plus,
  Trash2,
  Filter,
  Flame,
  Tent,
  CheckCircle2,
} from 'lucide-react';

export interface StrukturRegu {
  namaRegu: string;
  motto: string;
  pinru: string;
  wapinru: string;
  seksiTenda: string;
  seksiKonsumsi: string;
  seksiP3k: string;
  seksiKeamanan: string;
}

export const KemahTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'rundown' | 'regu' | 'checklist'>('rundown');

  // Rundown State
  const [rundownList, setRundownList] = useState<RundownItem[]>(INITIAL_RUNDOWN_PERSAMI);
  const [filterHari, setFilterHari] = useState<'Semua' | 'Sabtu' | 'Minggu'>('Semua');
  const [isAddRundownOpen, setIsAddRundownOpen] = useState(false);
  const [newRundownHari, setNewRundownHari] = useState<'Sabtu' | 'Minggu'>('Sabtu');
  const [newRundownWaktu, setNewRundownWaktu] = useState('');
  const [newRundownGiat, setNewRundownGiat] = useState('');
  const [newRundownPj, setNewRundownPj] = useState('');
  const [newRundownLokasi, setNewRundownLokasi] = useState('');

  // Regu State
  const [reguInfo, setReguInfo] = useState<StrukturRegu>({
    namaRegu: 'Regu Rajawali',
    motto: 'Terbang Tinggi Menggapai Prestasi, Setia Pada Janji',
    pinru: 'Dimas Aditya (Pinru)',
    wapinru: 'Bagas Pratama (Wapinru)',
    seksiTenda: 'Ahmad Faiz & Rian',
    seksiKonsumsi: 'Farel & Zaki',
    seksiP3k: 'Danang Tri',
    seksiKeamanan: 'Bayu Samudra',
  });

  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistKemahItem[]>(INITIAL_CHECKLIST_KEMAH);
  const [checklistFilter, setChecklistFilter] = useState<string>('Semua');

  // Filtered Rundown
  const filteredRundown = useMemo(() => {
    if (filterHari === 'Semua') return rundownList;
    return rundownList.filter((r) => r.hari === filterHari);
  }, [rundownList, filterHari]);

  const handleToggleRundown = (id: string) => {
    setRundownList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isSelesai: !r.isSelesai } : r))
    );
  };

  const handleDeleteRundown = (id: string) => {
    setRundownList((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddRundown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRundownGiat.trim() || !newRundownWaktu.trim()) return;
    const newItem: RundownItem = {
      id: `r_${Date.now()}`,
      hari: newRundownHari,
      waktu: newRundownWaktu,
      kegiatan: newRundownGiat,
      pj: newRundownPj || 'Panitia',
      lokasi: newRundownLokasi || 'Area Camp',
      isSelesai: false,
    };
    setRundownList((prev) => [...prev, newItem]);
    setNewRundownWaktu('');
    setNewRundownGiat('');
    setNewRundownPj('');
    setNewRundownLokasi('');
    setIsAddRundownOpen(false);
  };

  // Checklist Calculations
  const filteredChecklist = useMemo(() => {
    if (checklistFilter === 'Semua') return checklist;
    return checklist.filter((c) => c.kategori === checklistFilter);
  }, [checklist, checklistFilter]);

  const checklistProgress = useMemo(() => {
    const total = checklist.length;
    if (total === 0) return 0;
    const checked = checklist.filter((c) => c.isChecked).length;
    return Math.round((checked / total) * 100);
  }, [checklist]);

  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isChecked: !c.isChecked } : c))
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-700 via-emerald-800 to-emerald-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/60 backdrop-blur-md text-emerald-200 text-xs font-semibold border border-emerald-500/40">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Manajemen Kegiatan Luar Ruangan & Tapak Perkemahan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Manajemen Perkemahan & Regu
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Kelola agenda waktu Rundown Persami (Sabtu-Minggu), pembagian tugas struktur anggota regu, adat perkemahan, serta kesiapan checklist perlengkapan ransel & camp.
          </p>
        </div>
        <div className="absolute -right-6 -bottom-10 opacity-10 pointer-events-none select-none text-[200px] font-bold">
          🏕
        </div>
      </div>

      {/* Subtab Selector */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('rundown')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'rundown'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Timeline Rundown Persami</span>
        </button>
        <button
          onClick={() => setActiveSubTab('regu')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'regu'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Struktur Regu & Adat Camp</span>
        </button>
        <button
          onClick={() => setActiveSubTab('checklist')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'checklist'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Checklist Ransel & Camp ({checklistProgress}%)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. TIMELINE RUNDOWN PERSAMI */}
      {/* ============================================================== */}
      {activeSubTab === 'rundown' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Rundown Kegiatan Perkemahan Sabtu-Minggu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Klik kotak centang pada jadwal kegiatan yang telah selesai dilaksanakan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                {(['Semua', 'Sabtu', 'Minggu'] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => setFilterHari(h)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      filterHari === h
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsAddRundownOpen(!isAddRundownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Agenda</span>
              </button>
            </div>
          </div>

          {/* Add Agenda Form */}
          {isAddRundownOpen && (
            <form
              onSubmit={handleAddRundown}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Tambah Agenda Kegiatan Baru
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Hari Pelaksanaan:
                  </label>
                  <select
                    value={newRundownHari}
                    onChange={(e) => setNewRundownHari(e.target.value as 'Sabtu' | 'Minggu')}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Sabtu">Sabtu</option>
                    <option value="Minggu">Minggu</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Waktu / Jam:
                  </label>
                  <input
                    type="text"
                    value={newRundownWaktu}
                    onChange={(e) => setNewRundownWaktu(e.target.value)}
                    placeholder="Contoh: 14.00 - 15.30"
                    required
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Nama Kegiatan:
                  </label>
                  <input
                    type="text"
                    value={newRundownGiat}
                    onChange={(e) => setNewRundownGiat(e.target.value)}
                    placeholder="Contoh: Lomba Memasak Rimba & P3K"
                    required
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Penanggung Jawab (PJ):
                  </label>
                  <input
                    type="text"
                    value={newRundownPj}
                    onChange={(e) => setNewRundownPj(e.target.value)}
                    placeholder="Kak Rizki & Sie Giat"
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Lokasi Tapak:
                  </label>
                  <input
                    type="text"
                    value={newRundownLokasi}
                    onChange={(e) => setNewRundownLokasi(e.target.value)}
                    placeholder="Lapangan Utama / Tenda"
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRundownOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          )}

          {/* Timeline Agenda Items */}
          <div className="space-y-3">
            {filteredRundown.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.isSelesai
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.isSelesai}
                    onChange={() => handleToggleRundown(item.id)}
                    className="mt-1 w-4 h-4 rounded-md accent-emerald-600 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                        {item.hari}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                        {item.waktu}
                      </span>
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        item.isSelesai
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.kegiatan}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                      <span>PJ: {item.pj}</span>
                      <span>•</span>
                      <span>Lokasi: {item.lokasi}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteRundown(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                    title="Hapus Agenda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. STRUKTUR REGU & ADAT PERKEMAHAN */}
      {/* ============================================================== */}
      {activeSubTab === 'regu' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Struktur Regu */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Tent className="w-5 h-5 text-emerald-600" />
                  Struktur Organisasi Regu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pembagian peran anggota regu di perkemahan
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Regu (Hewan/Tumbuhan):
                </label>
                <input
                  type="text"
                  value={reguInfo.namaRegu}
                  onChange={(e) => setReguInfo({ ...reguInfo, namaRegu: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Motto / Semboyan Regu:
                </label>
                <input
                  type="text"
                  value={reguInfo.motto}
                  onChange={(e) => setReguInfo({ ...reguInfo, motto: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white italic"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Pemimpin Regu (Pinru):
                  </label>
                  <input
                    type="text"
                    value={reguInfo.pinru}
                    onChange={(e) => setReguInfo({ ...reguInfo, pinru: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Wakil Pinru (Wapinru):
                  </label>
                  <input
                    type="text"
                    value={reguInfo.wapinru}
                    onChange={(e) => setReguInfo({ ...reguInfo, wapinru: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Seksi Perlengkapan & Tenda:
                  </label>
                  <input
                    type="text"
                    value={reguInfo.seksiTenda}
                    onChange={(e) => setReguInfo({ ...reguInfo, seksiTenda: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Seksi Konsumsi & Masak:
                  </label>
                  <input
                    type="text"
                    value={reguInfo.seksiKonsumsi}
                    onChange={(e) => setReguInfo({ ...reguInfo, seksiKonsumsi: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Seksi P3K & Kesehatan:
                  </label>
                  <input
                    type="text"
                    value={reguInfo.seksiP3k}
                    onChange={(e) => setReguInfo({ ...reguInfo, seksiP3k: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Seksi Keamanan & Ronda:
                  </label>
                  <input
                    type="text"
                    value={reguInfo.seksiKeamanan}
                    onChange={(e) => setReguInfo({ ...reguInfo, seksiKeamanan: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Adat Perkemahan & Api Unggun */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Flame className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Tata Tertib Adat Perkemahan & Api Unggun
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 space-y-1">
                <span className="font-bold text-amber-900 dark:text-amber-300 block">
                  1. Adat Masuk Perkemahan
                </span>
                <p>
                  Setiap peserta dan tamu wajib lapor pada pos piket keamanan, mengucapkan salam pramuka, dan menitipkan tanda pengenal sebelum memasuki tapak perkemahan.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  2. Keheningan Malam & Jam Malam (Maks. 22.00 WIB)
                </span>
                <p>
                  Setelah upacara api unggun selesai pukul 22.00, seluruh peserta wajib menjaga keheningan, tidak bersuara keras di tenda, dan menyerahkan penjagaan ke giliran regu ronda.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  3. Kesakralan Api Unggun
                </span>
                <p>
                  Api unggun adalah simbol kehangatan dan persaudaraan. Dilarang keras melompati api unggun, menyulut rokok, atau membuang sampah ke dalam tumpukan api unggun.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  4. Kebersihan Lingkungan (Leave No Trace)
                </span>
                <p>
                  Parit tenda harus dibuat rapi agar air hujan tidak menggenang, sampah organik dan anorganik dipisah, dan saat membongkar tenda lokasi harus bersih kembali seperti semula.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CHECKLIST PERLENGKAPAN RANSEL & CAMP */}
      {/* ============================================================== */}
      {activeSubTab === 'checklist' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                Checklist Perlengkapan Ransel & Camp
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pastikan seluruh perlengkapan telah dimasukkan ke dalam tas ransel sebelum keberangkatan.
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {['Semua', 'Pribadi', 'Regu', 'Logistik & Masak', 'P3K Darurat', 'Seragam & Dokumen'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setChecklistFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    checklistFilter === cat
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar Kesiapan */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-800 dark:text-emerald-300">
                Tingkat Kesiapan Bawaan Ransel:
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                {checklistProgress}% Siap
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>
          </div>

          {/* Checklist Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredChecklist.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.isChecked
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.isChecked}
                    onChange={() => handleToggleChecklist(item.id)}
                    className="w-4 h-4 rounded-md accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold block leading-snug">{item.nama}</span>
                    <span className="text-[10px] text-slate-400 block">{item.kategori}</span>
                  </div>
                </div>

                {item.isChecked && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
