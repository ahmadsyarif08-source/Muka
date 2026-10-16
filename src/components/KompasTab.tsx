import React, { useState, useMemo } from 'react';
import {
  Compass,
  Sparkles,
  ArrowRightLeft,
  Ruler,
  Maximize2,
  HelpCircle,
  RotateCw,
  Eye,
  Trees,
} from 'lucide-react';

export interface MataAngin {
  kode: string;
  nama: string;
  derajat: number;
}

export const ENAM_BELAS_MATA_ANGIN: MataAngin[] = [
  { kode: 'U', nama: 'Utara', derajat: 0 },
  { kode: 'UTL', nama: 'Utara Timur Laut', derajat: 22.5 },
  { kode: 'TL', nama: 'Timur Laut', derajat: 45 },
  { kode: 'TTL', nama: 'Timur Timur Laut', derajat: 67.5 },
  { kode: 'T', nama: 'Timur', derajat: 90 },
  { kode: 'TM', nama: 'Timur Menenggara', derajat: 112.5 },
  { kode: 'TG', nama: 'Tenggara', derajat: 135 },
  { kode: 'SM', nama: 'Selatan Menenggara', derajat: 157.5 },
  { kode: 'S', nama: 'Selatan', derajat: 180 },
  { kode: 'SBD', nama: 'Selatan Barat Daya', derajat: 202.5 },
  { kode: 'BD', nama: 'Barat Daya', derajat: 225 },
  { kode: 'BBD', nama: 'Barat Barat Daya', derajat: 247.5 },
  { kode: 'B', nama: 'Barat', derajat: 270 },
  { kode: 'BBL', nama: 'Barat Barat Laut', derajat: 292.5 },
  { kode: 'BL', nama: 'Barat Laut', derajat: 315 },
  { kode: 'UBL', nama: 'Utara Barat Laut', derajat: 337.5 },
];

export const KompasTab: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'kompas' | 'tinggi' | 'sungai'>('kompas');

  // Compass State
  const [azimutDegree, setAzimutDegree] = useState<number>(45);

  // Menaksir Tinggi Pohon State
  const [tinggiTongkat, setTinggiTongkat] = useState<number>(1.6); // 160 cm
  const [jarakMataKeTongkat, setJarakMataKeTongkat] = useState<number>(2); // meter
  const [jarakTongkatKePohon, setJarakTongkatKePohon] = useState<number>(10); // meter
  const [tinggiMataPengamat, setTinggiMataPengamat] = useState<number>(0); // 0 jika tiarap di tanah

  // Menaksir Lebar Sungai State
  const [jarakPatokAB, setJarakPatokAB] = useState<number>(8); // meter
  const [jarakPatokCD, setJarakPatokCD] = useState<number>(8); // meter

  // Calculate Back-Azimut
  const backAzimut = useMemo(() => {
    const deg = (azimutDegree % 360 + 360) % 360;
    if (deg < 180) {
      return deg + 180;
    } else {
      return deg - 180;
    }
  }, [azimutDegree]);

  // Current Cardinal Name
  const currentCardinal = useMemo(() => {
    const deg = (azimutDegree % 360 + 360) % 360;
    let closest = ENAM_BELAS_MATA_ANGIN[0];
    let minDiff = 360;
    ENAM_BELAS_MATA_ANGIN.forEach((m) => {
      let diff = Math.abs(m.derajat - deg);
      if (diff > 180) diff = 360 - diff;
      if (diff < minDiff) {
        minDiff = diff;
        closest = m;
      }
    });
    return closest;
  }, [azimutDegree]);

  // Calculated Tree Height
  const hasilTinggiPohon = useMemo(() => {
    // Segitiga sebangun:
    // T_pohon / Total_Jarak = t_tongkat / d_tongkat
    const totalJarak = jarakMataKeTongkat + jarakTongkatKePohon;
    if (jarakMataKeTongkat <= 0) return 0;
    const ratio = totalJarak / jarakMataKeTongkat;
    const h = (tinggiTongkat - tinggiMataPengamat) * ratio + tinggiMataPengamat;
    return Math.round(h * 100) / 100;
  }, [tinggiTongkat, jarakMataKeTongkat, jarakTongkatKePohon, tinggiMataPengamat]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-orange-700 via-amber-800 to-amber-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/60 backdrop-blur-md text-orange-200 text-xs font-semibold border border-orange-500/40">
            <Sparkles className="w-3.5 h-3.5 text-orange-300" />
            <span>Navigasi Darat & Estimasi Matematika Lapangan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Kompas Bidik & Kalkulator Menaksir
          </h1>
          <p className="text-orange-100 text-sm sm:text-base leading-relaxed">
            Dial kompas 360° interaktif 16 arah mata angin, kalkulator otomatis Azimut & Back-Azimut sasaran balik, serta perhitungan menaksir tinggi pohon dan lebar sungai tanpa menyeberang.
          </p>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTool('kompas')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTool === 'kompas'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Kompas Bidik & Back-Azimut</span>
        </button>
        <button
          onClick={() => setActiveTool('tinggi')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTool === 'tinggi'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Trees className="w-4 h-4" />
          <span>Menaksir Tinggi Pohon (Tongkat 160 cm)</span>
        </button>
        <button
          onClick={() => setActiveTool('sungai')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTool === 'sungai'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>Menaksir Lebar Sungai</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. KOMPAS BIDIK 360° & BACK-AZIMUT */}
      {/* ============================================================== */}
      {activeTool === 'kompas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Dial Graphic */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col items-center space-y-6">
            <div className="w-full flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Dial Kompas Bidik 360°
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Arah: <strong className="text-amber-600">{currentCardinal.nama} ({currentCardinal.kode})</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                  {azimutDegree}°
                </span>
              </div>
            </div>

            {/* Graphic Compass Dial */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Outer Housing Ring */}
              <div className="absolute inset-0 rounded-full border-8 border-slate-200 dark:border-slate-800 bg-linear-to-b from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-950 shadow-2xl flex items-center justify-center">
                {/* 16 Cardinal Ticks */}
                {ENAM_BELAS_MATA_ANGIN.map((m) => {
                  const isMain = ['U', 'T', 'S', 'B'].includes(m.kode);
                  return (
                    <div
                      key={m.kode}
                      className="absolute w-full h-full flex flex-col items-center justify-start pointer-events-none"
                      style={{ transform: `rotate(${m.derajat}deg)` }}
                    >
                      <span
                        className={`mt-2 font-bold tracking-tighter ${
                          m.kode === 'U'
                            ? 'text-red-600 text-sm font-extrabold'
                            : isMain
                            ? 'text-slate-900 dark:text-white text-xs'
                            : 'text-slate-400 dark:text-slate-500 text-[9px]'
                        }`}
                      >
                        {m.kode}
                      </span>
                    </div>
                  );
                })}

                {/* Rotating Needle */}
                <div
                  className="w-10 h-44 relative flex items-center justify-center transition-transform duration-300 ease-out"
                  style={{ transform: `rotate(${azimutDegree}deg)` }}
                >
                  {/* North Needle (Red Arrow) */}
                  <div
                    className="absolute top-2 w-0 h-0 border-l-8 border-r-8 border-b-[80px] border-l-transparent border-r-transparent border-b-red-600 drop-shadow-md"
                    title="Jarum Utara"
                  />
                  {/* South Needle (Silver/Black Arrow) */}
                  <div
                    className="absolute bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-[80px] border-l-transparent border-r-transparent border-t-slate-400 dark:border-t-slate-600 drop-shadow-md"
                    title="Jarum Selatan"
                  />
                  {/* Center Pivot Brass Pin */}
                  <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 shadow-md z-10" />
                </div>
              </div>
            </div>

            {/* Slider Control */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>0° (Utara)</span>
                <span>Putar Sudut Derajat (0° - 360°)</span>
                <span>360°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={azimutDegree}
                onChange={(e) => setAzimutDegree(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>

            {/* Preset Buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 w-full">
              {[
                { label: 'U (0°)', val: 0 },
                { label: 'TL (45°)', val: 45 },
                { label: 'T (90°)', val: 90 },
                { label: 'TG (135°)', val: 135 },
                { label: 'S (180°)', val: 180 },
                { label: 'BD (225°)', val: 225 },
                { label: 'B (270°)', val: 270 },
                { label: 'BL (315°)', val: 315 },
              ].map((b) => (
                <button
                  key={b.val}
                  type="button"
                  onClick={() => setAzimutDegree(b.val)}
                  className={`py-1.5 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                    azimutDegree === b.val
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Azimut & Back-Azimut Calculator */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                Penghitung Azimut & Back-Azimut
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sudut sasaran balik untuk navigasi pulang agar tidak tersesat di hutan.
              </p>
            </div>

            {/* Big Azimut & Back-Azimut Card */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                  Sudut Azimut (Bidik)
                </span>
                <div className="text-3xl font-black font-mono text-amber-800 dark:text-amber-200">
                  {azimutDegree}°
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                  Arah sasaran pergi
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                  Back-Azimut (Balik)
                </span>
                <div className="text-3xl font-black font-mono text-emerald-800 dark:text-emerald-200">
                  {backAzimut}°
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                  Arah sasaran kembali
                </span>
              </div>
            </div>

            {/* Formula Explanation */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                Rumus Standar Sasaran Balik (Back-Azimut):
              </span>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono space-y-1">
                <div className="text-amber-700 dark:text-amber-300 font-bold">
                  • Jika Azimut &lt; 180° ➔ Tambahkan 180°
                </div>
                <div className="text-emerald-700 dark:text-emerald-300 font-bold">
                  • Jika Azimut &gt;= 180° ➔ Kurangkan 180°
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Contoh: Anda membidik pohon sasaran di <strong>{azimutDegree}°</strong>. Saat hendak kembali ke titik awal camp, bidik kompas ke <strong>{backAzimut}°</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MENAKSIR TINGGI POHON (SEGITIGA SEBANGUN) */}
      {/* ============================================================== */}
      {activeTool === 'tinggi' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Trees className="w-5 h-5 text-emerald-600" />
              Menaksir Tinggi Pohon dengan Tongkat Pramuka (160 cm)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Metode perbandingan segitiga sebangun menggunakan tongkat standar 160 cm tanpa perlu memanjat pohon.
            </p>
          </div>

          {/* Visual Triangle Diagram SVG */}
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700 flex flex-col items-center">
            <svg width="100%" height="160" viewBox="0 0 540 160" className="max-w-xl">
              {/* Ground line */}
              <line x1="30" y1="140" x2="510" y2="140" stroke="#78350f" strokeWidth="4" />

              {/* Observer Eye Point A */}
              <circle cx="50" cy="140" r="5" fill="#2563eb" />
              <text x="35" y="155" fill="#2563eb" fontSize="11" fontWeight="bold">Titik Mata</text>

              {/* Scout Staff CD (Tongkat 160cm) */}
              <line x1="160" y1="140" x2="160" y2="85" stroke="#d97706" strokeWidth="5" />
              <circle cx="160" cy="85" r="4" fill="#d97706" />
              <text x="145" y="75" fill="#d97706" fontSize="10" fontWeight="bold">Tongkat ({tinggiTongkat}m)</text>

              {/* Tree EF (Pohon) */}
              <line x1="460" y1="140" x2="460" y2="25" stroke="#16a34a" strokeWidth="6" />
              <circle cx="460" cy="25" r="5" fill="#15803d" />
              <text x="430" y="18" fill="#15803d" fontSize="11" fontWeight="bold">Pohon ({hasilTinggiPohon}m)</text>

              {/* Sight Line (Garis Pandang dari mata melalui pucuk tongkat ke puncak pohon) */}
              <line x1="50" y1="140" x2="460" y2="25" stroke="#dc2626" strokeWidth="2" strokeDasharray="5 3" />

              {/* Distance Labels */}
              <text x="95" y="132" fill="#475569" fontSize="10">d1: {jarakMataKeTongkat}m</text>
              <text x="280" y="132" fill="#475569" fontSize="10">d2: {jarakTongkatKePohon}m</text>
            </svg>
          </div>

          {/* Calculator Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tinggi Tongkat Pramuka (Meter):
              </label>
              <input
                type="number"
                step="0.1"
                value={tinggiTongkat}
                onChange={(e) => setTinggiTongkat(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400">Standar tongkat: 1.6 meter</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Jarak Mata Pengamat ke Tongkat (d1):
              </label>
              <input
                type="number"
                step="0.5"
                value={jarakMataKeTongkat}
                onChange={(e) => setJarakMataKeTongkat(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400">Contoh: 2 meter (tiarap di tanah)</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Jarak Tongkat ke Pohon (d2):
              </label>
              <input
                type="number"
                step="0.5"
                value={jarakTongkatKePohon}
                onChange={(e) => setJarakTongkatKePohon(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400">Diukur dengan langkah kaki tongkat</span>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Estimasi Hasil Menaksir Tinggi Pohon:
              </span>
              <div className="text-3xl font-black text-emerald-800 dark:text-emerald-200 mt-0.5">
                {hasilTinggiPohon} Meter
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 max-w-sm">
              Rumus: <strong>Tinggi = ((d1 + d2) / d1) × Tinggi Tongkat</strong>
              <br />
              = (({jarakMataKeTongkat} + {jarakTongkatKePohon}) / {jarakMataKeTongkat}) × {tinggiTongkat} = {hasilTinggiPohon} m
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MENAKSIR LEBAR SUNGAI */}
      {/* ============================================================== */}
      {activeTool === 'sungai' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Ruler className="w-5 h-5 text-blue-600" />
              Menaksir Lebar Sungai (Metode Segitiga Siku-siku Kongruen)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Menghitung jarak ke seberang sungai tanpa harus berenang dengan menancapkan patok segitiga 90 derajat.
            </p>
          </div>

          {/* Diagram Sungai SVG */}
          <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-800/60 border border-sky-200/60 dark:border-slate-700 flex flex-col items-center">
            <svg width="100%" height="180" viewBox="0 0 540 180" className="max-w-xl">
              {/* River Blue Area */}
              <rect x="50" y="10" width="440" height="60" rx="4" fill="#bae6fd" />
              <text x="230" y="45" fill="#0369a1" fontSize="12" fontWeight="bold">Sungai Mengalir</text>

              {/* Target Tree in opposite bank (X) */}
              <circle cx="150" cy="20" r="6" fill="#15803d" />
              <text x="140" y="12" fill="#15803d" fontSize="10" fontWeight="bold">Pohon X (Seberang)</text>

              {/* Bank Shore Line */}
              <line x1="50" y1="70" x2="490" y2="70" stroke="#78350f" strokeWidth="3" />

              {/* Peg A (Facing X directly 90 deg) */}
              <circle cx="150" cy="70" r="5" fill="#dc2626" />
              <text x="140" y="85" fill="#dc2626" fontSize="10" fontWeight="bold">Patok A</text>

              {/* Peg B (Midpoint) */}
              <circle cx="270" cy="70" r="5" fill="#d97706" />
              <text x="260" y="85" fill="#d97706" fontSize="10" fontWeight="bold">Patok B</text>

              {/* Peg C (Equal distance to B) */}
              <circle cx="390" cy="70" r="5" fill="#2563eb" />
              <text x="380" y="85" fill="#2563eb" fontSize="10" fontWeight="bold">Patok C</text>

              {/* Peg D (Turn 90 deg backward until X-B-D are collinear) */}
              <line x1="390" y1="70" x2="390" y2="150" stroke="#7c3aed" strokeWidth="2" strokeDasharray="4 2" />
              <circle cx="390" cy="150" r="5" fill="#7c3aed" />
              <text x="400" y="155" fill="#7c3aed" fontSize="10" fontWeight="bold">Patok D</text>

              {/* Sight Line X - B - D */}
              <line x1="150" y1="20" x2="390" y2="150" stroke="#ea580c" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Jarak Patok A ke Patok B (Meter):
              </label>
              <input
                type="number"
                value={jarakPatokAB}
                onChange={(e) => setJarakPatokAB(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400">Jarak patok B ke C dibuat persis sama</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Jarak Mundur Patok C ke D (Meter):
              </label>
              <input
                type="number"
                value={jarakPatokCD}
                onChange={(e) => setJarakPatokCD(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400">Diukur saat titik D sejajar dengan B dan pohon X</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Estimasi Lebar Sungai (Jarak Patok A ke Pohon X):
              </span>
              <div className="text-3xl font-black text-blue-800 dark:text-blue-200 mt-0.5">
                {jarakPatokCD} Meter
              </div>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              Sifat segitiga kongruen ΔABX ≅ ΔCBD ➔ <strong>Panjang AX = Panjang CD</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
