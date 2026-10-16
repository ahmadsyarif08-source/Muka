import React, { useState, useMemo } from 'react';
import {
  INITIAL_SKU_RAMU,
  KATALOG_TKK,
  SkuRamuItem,
  TkkItem,
} from '../data/pramukaData';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
  UserCheck,
  Shield,
  Layers,
  Search,
  Filter,
  Check,
  X,
  BookOpen,
} from 'lucide-react';

export const SkuTkkTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'sku' | 'tkk'>('sku');

  // SKU State
  const [skuList, setSkuList] = useState<SkuRamuItem[]>(INITIAL_SKU_RAMU);
  const [skuFilter, setSkuFilter] = useState<'Semua' | 'Lulus' | 'Belum'>('Semua');
  const [editingSku, setEditingSku] = useState<SkuRamuItem | null>(null);
  const [pengujiName, setPengujiName] = useState('');
  const [tglUjiDate, setTglUjiDate] = useState('');

  // TKK State
  const [selectedBidang, setSelectedBidang] = useState<string>('Semua');
  const [selectedTingkat, setSelectedTingkat] = useState<string>('Semua');
  const [tkkSearch, setTkkSearch] = useState('');

  // SKU Progress
  const skuProgress = useMemo(() => {
    const total = skuList.length;
    if (total === 0) return 0;
    const lulus = skuList.filter((s) => s.isLulus).length;
    return Math.round((lulus / total) * 100);
  }, [skuList]);

  const filteredSkuList = useMemo(() => {
    if (skuFilter === 'Lulus') return skuList.filter((s) => s.isLulus);
    if (skuFilter === 'Belum') return skuList.filter((s) => !s.isLulus);
    return skuList;
  }, [skuList, skuFilter]);

  const handleOpenUjiModal = (item: SkuRamuItem) => {
    setEditingSku(item);
    setPengujiName(item.penguji || 'Kak Dimas Pratama');
    setTglUjiDate(item.tglUji || new Date().toISOString().split('T')[0]);
  };

  const handleSaveUji = (isPassed: boolean) => {
    if (!editingSku) return;
    setSkuList((prev) =>
      prev.map((s) =>
        s.nomor === editingSku.nomor
          ? {
              ...s,
              isLulus: isPassed,
              tglUji: isPassed ? tglUjiDate : undefined,
              penguji: isPassed ? pengujiName : undefined,
            }
          : s
      )
    );
    setEditingSku(null);
  };

  // Filtered TKK
  const filteredTkkList = useMemo(() => {
    return KATALOG_TKK.filter((t) => {
      const matchBidang = selectedBidang === 'Semua' || t.bidang === selectedBidang;
      const matchTingkat = selectedTingkat === 'Semua' || t.tingkat === selectedTingkat;
      const matchSearch =
        t.nama.toLowerCase().includes(tkkSearch.toLowerCase()) ||
        t.deskripsi.toLowerCase().includes(tkkSearch.toLowerCase());
      return matchBidang && matchTingkat && matchSearch;
    });
  }, [selectedBidang, selectedTingkat, tkkSearch]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-purple-700 via-indigo-800 to-indigo-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/60 backdrop-blur-md text-purple-200 text-xs font-semibold border border-purple-500/40">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Sistem Tanda Kecakapan Gerakan Pramuka</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Buku Saku SKU & TKK Digital
          </h1>
          <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
            Lembar uji digital Syarat Kecakapan Umum (SKU) Penggalang Ramu lengkap dengan modal validasi penguji, serta katalog Tanda Kecakapan Khusus (TKK) 5 bidang warna dan 3 tingkatan (Purwa, Madya, Utama).
          </p>
        </div>
      </div>

      {/* Subtab Selector */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('sku')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'sku'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>SKU Penggalang Ramu ({skuProgress}% Tercapai)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('tkk')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'tkk'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Katalog TKK (5 Bidang & 3 Tingkat)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. LEMBAR UJI SKU PENGGALANG RAMU */}
      {/* ============================================================== */}
      {activeSubTab === 'sku' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Lembar Butir Syarat Kecakapan Umum (SKU) Penggalang Ramu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Klik butir untuk mencatat nama penguji dan tanggal lulus uji.
              </p>
            </div>

            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              {(['Semua', 'Lulus', 'Belum'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setSkuFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    skuFilter === f
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {f === 'Semua' ? 'Semua' : f === 'Lulus' ? 'Sudah Lulus' : 'Belum Diuji'}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar Kelulusan SKU */}
          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-purple-800 dark:text-purple-300">
                Progres Pelantikan Ramu:
              </span>
              <span className="text-purple-700 dark:text-purple-400 font-mono text-sm">
                {skuList.filter((s) => s.isLulus).length} dari {skuList.length} Butir ({skuProgress}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${skuProgress}%` }}
              />
            </div>
          </div>

          {/* SKU Items List */}
          <div className="space-y-3">
            {filteredSkuList.map((item) => (
              <div
                key={item.nomor}
                onClick={() => handleOpenUjiModal(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.isLulus
                    ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800/80 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      item.isLulus
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.nomor}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.kategori}
                      </span>
                      {item.isLulus && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Lulus Uji
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {item.butir}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Indikator: {item.indikator}
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs shrink-0 self-end sm:self-center">
                  {item.isLulus ? (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                      <div>Penguji: <strong className="text-slate-800 dark:text-slate-200">{item.penguji}</strong></div>
                      <div>Tgl: {item.tglUji}</div>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                      + Input Hasil Uji
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Modal Input Uji SKU */}
          {editingSku && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    Uji Butir SKU #{editingSku.nomor}
                  </h4>
                  <button
                    onClick={() => setEditingSku(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200">
                  {editingSku.butir}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nama Pembina / Penguji:
                    </label>
                    <input
                      type="text"
                      value={pengujiName}
                      onChange={(e) => setPengujiName(e.target.value)}
                      placeholder="Contoh: Kak Dimas Pratama"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Tanggal Lulus Pengujian:
                    </label>
                    <input
                      type="date"
                      value={tglUjiDate}
                      onChange={(e) => setTglUjiDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {editingSku.isLulus && (
                    <button
                      type="button"
                      onClick={() => handleSaveUji(false)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer mr-auto"
                    >
                      Batalkan Lulus
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingSku(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveUji(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Simpan & Tandai Lulus
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. KATALOG TKK (5 BIDANG & 3 TINGKAT) */}
      {/* ============================================================== */}
      {activeSubTab === 'tkk' && (
        <div className="space-y-6">
          {/* Legend 5 Bidang Warna TKK */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Arti 5 Bidang Warna Dasar Tanda Kecakapan Khusus (TKK)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { warna: 'Putih', nama: 'Ketangkasan & Kesehatan', contoh: 'Berkemah, P3K, Berenang' },
                { warna: 'Kuning', nama: 'Agama, Moral & Mental', contoh: 'Sholat, Doa, Menabung' },
                { warna: 'Hijau', nama: 'Keterampilan & Pembangunan', contoh: 'Juru Masak, Pionering, Jahit' },
                { warna: 'Biru', nama: 'Sosial & Gotong Royong', contoh: 'Pengaman Kampung, Pemandu' },
                { warna: 'Merah', nama: 'Patriotisme & Seni Budaya', contoh: 'Pengatur Meja, Tari, Lukis' },
              ].map((b) => (
                <div
                  key={b.warna}
                  onClick={() => setSelectedBidang(selectedBidang === b.warna ? 'Semua' : b.warna)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedBidang === b.warna
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3.5 h-3.5 rounded-full shrink-0 border ${
                        b.warna === 'Putih'
                          ? 'bg-white border-slate-300'
                          : b.warna === 'Kuning'
                          ? 'bg-amber-400 border-amber-500'
                          : b.warna === 'Hijau'
                          ? 'bg-emerald-500 border-emerald-600'
                          : b.warna === 'Biru'
                          ? 'bg-blue-500 border-blue-600'
                          : 'bg-rose-500 border-rose-600'
                      }`}
                    />
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      Warna {b.warna}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-1">
                    {b.nama}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {b.contoh}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Tingkat Bentuk:</span>
              <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {(['Semua', 'Purwa', 'Madya', 'Utama'] as const).map((tk) => (
                  <button
                    key={tk}
                    onClick={() => setSelectedTingkat(tk)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      selectedTingkat === tk
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tk === 'Purwa' ? 'Purwa (Lingkaran)' : tk === 'Madya' ? 'Madya (Persegi)' : tk === 'Utama' ? 'Utama (Segilima)' : 'Semua'}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={tkkSearch}
                onChange={(e) => setTkkSearch(e.target.value)}
                placeholder="Cari TKK..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* TKK Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTkkList.map((tkk) => (
              <div
                key={tkk.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-400 dark:hover:border-purple-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <TkkBadgeSvg bentuk={tkk.bentuk} bidang={tkk.bidang} />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                      {tkk.tingkat}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {tkk.nama}
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-500 block mb-2">
                    Bidang {tkk.namaBidang}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {tkk.deskripsi}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">Syarat Utama:</strong>
                  {tkk.syaratUtama}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// SVG Badge Graphic for TKK according to shape and color
const TkkBadgeSvg: React.FC<{ bentuk: 'Lingkaran' | 'Persegi' | 'Segilima'; bidang: string }> = ({
  bentuk,
  bidang,
}) => {
  const fillColor =
    bidang === 'Putih'
      ? '#ffffff'
      : bidang === 'Kuning'
      ? '#facc15'
      : bidang === 'Hijau'
      ? '#10b981'
      : bidang === 'Biru'
      ? '#3b82f6'
      : '#ef4444';

  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="drop-shadow-xs">
      {/* Penggalang Red Border */}
      {bentuk === 'Lingkaran' && (
        <>
          <circle cx="22" cy="22" r="19" fill={fillColor} stroke="#dc2626" strokeWidth="4" />
          <circle cx="22" cy="22" r="8" fill="none" stroke="#78350f" strokeWidth="1.5" />
        </>
      )}
      {bentuk === 'Persegi' && (
        <>
          <rect x="5" y="5" width="34" height="34" rx="4" fill={fillColor} stroke="#dc2626" strokeWidth="4" />
          <rect x="13" y="13" width="18" height="18" rx="2" fill="none" stroke="#78350f" strokeWidth="1.5" />
        </>
      )}
      {bentuk === 'Segilima' && (
        <>
          <polygon
            points="22,4 39,16 33,38 11,38 5,16"
            fill={fillColor}
            stroke="#dc2626"
            strokeWidth="3.5"
          />
          <polygon
            points="22,12 32,20 28,33 16,33 12,20"
            fill="none"
            stroke="#78350f"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
};
