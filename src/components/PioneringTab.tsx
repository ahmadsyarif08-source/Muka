import React, { useState } from 'react';
import { DAFTAR_SIMPUL, SimpulItem } from '../data/pramukaData';
import {
  Compass,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  Activity,
  ChevronRight,
} from 'lucide-react';

export const PioneringTab: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'Semua' | 'Simpul' | 'Ikatan' | 'Tandu'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSimpul, setSelectedSimpul] = useState<SimpulItem>(DAFTAR_SIMPUL[0]);

  const filteredSimpulList = DAFTAR_SIMPUL.filter((item) => {
    const matchCategory = selectedFilter === 'Semua' || item.kategori === selectedFilter;
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fungsi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-700 via-teal-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/60 backdrop-blur-md text-emerald-200 text-xs font-semibold border border-emerald-500/40">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Kecakapan Teknik Kepramukaan (Tekpram)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Tali-Temali & Pionering Lapangan
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Kuasai 10 simpul dan ikatan wajib, teknik merangkai konstruksi tongkat kayu perkemahan, serta panduan khusus pembuatan Tandu Darurat (Dragbar P3K) untuk evakuasi medan berat.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto w-full sm:w-auto">
          {(['Semua', 'Simpul', 'Ikatan', 'Tandu'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'Tandu' ? '🚑 Tandu Darurat Dragbar' : cat}
            </button>
          ))}
        </div>

        {selectedFilter !== 'Tandu' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama simpul atau fungsi..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* KHUSUS: PANDUAN TANDU DARURAT (DRAGBAR P3K) */}
      {/* ============================================================== */}
      {selectedFilter === 'Tandu' ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Pertolongan Pertama Pada Kecelakaan (P3K)
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Panduan Pembuatan Tandu Darurat (Dragbar)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Konstruksi tandu kokoh menggunakan 2 tongkat panjang, 2 anak tandu pendek, dan tali 12-15 meter.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  Waktu Standar Lomba: &lt; 5 Menit
                </span>
              </div>
            </div>

            {/* Visual Diagram Tandu SVG */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Diagram Kerangka Tandu & Jaring Anyaman Simpul Jangkar
              </span>
              <svg width="100%" height="180" viewBox="0 0 600 180" className="max-w-xl">
                {/* 2 Long Poles (Tongkat Panjang 160cm-220cm) */}
                <rect x="20" y="25" width="560" height="12" rx="4" fill="#b45309" />
                <rect x="20" y="145" width="560" height="12" rx="4" fill="#b45309" />

                {/* 2 Short Crossbars (Anak Tandu 60cm) */}
                <rect x="80" y="10" width="12" height="160" rx="3" fill="#d97706" />
                <rect x="490" y="10" width="12" height="160" rx="3" fill="#d97706" />

                {/* 4 Corner Square Lashings (Ikatan Palang) */}
                <circle cx="86" cy="31" r="10" fill="#dc2626" opacity="0.8" />
                <circle cx="496" cy="31" r="10" fill="#dc2626" opacity="0.8" />
                <circle cx="86" cy="151" r="10" fill="#dc2626" opacity="0.8" />
                <circle cx="496" cy="151" r="10" fill="#dc2626" opacity="0.8" />

                {/* Mesh Webbing (Simpul Jangkar Tali Tandu) */}
                {[130, 180, 230, 280, 330, 380, 430].map((x, i) => (
                  <g key={i}>
                    {/* Vertical web line */}
                    <line x1={x} y1="37" x2={x + 25} y2="145" stroke="#0284c7" strokeWidth="3" />
                    <line x1={x + 25} y1="37" x2={x} y2="145" stroke="#0284c7" strokeWidth="3" />
                    {/* Anchor loops on poles */}
                    <circle cx={x} cy="31" r="5" fill="#0369a1" />
                    <circle cx={x + 25} cy="151" r="5" fill="#0369a1" />
                  </g>
                ))}

                {/* Handles Label */}
                <text x="35" y="100" fill="#78350f" fontSize="11" fontWeight="bold">Pegangan Depan</text>
                <text x="505" y="100" fill="#78350f" fontSize="11" fontWeight="bold">Pegangan Belakang</text>
              </svg>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> 4 Ikatan Palang</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" /> Anyaman Simpul Jangkar</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-700 inline-block" /> Tongkat Pramuka</span>
              </div>
            </div>

            {/* Tahapan Pembuatan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
                  Bahan & Perlengkapan Wajib
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>2 Tongkat Utama (panjang 160 cm atau 220 cm)</li>
                  <li>2 Anak Tandu (panjang 60 cm)</li>
                  <li>1 gulung tali tambang tandu nilon/katun (panjang 12-15 meter)</li>
                  <li>2 buah mitela (kain segitiga) untuk pengikat dada/kaki korban</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">2</span>
                  Langkah Pembuatan Kerangka
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Letakkan 2 tongkat panjang sejajar dengan jarak 50 cm.</li>
                  <li>Letakkan 2 anak tandu bersilangan 90 derajat di ujung kepala dan kaki (sisakan 25 cm untuk pegangan).</li>
                  <li>Ikat 4 sudut pertemuan kayu menggunakan <strong>Ikatan Palang</strong> rapat dan kokoh.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">3</span>
                  Menganyam Jaring Tandu
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Awali dengan <strong>Simpul Pangkal</strong> pada tongkat panjang kiri dekat anak tandu kepala.</li>
                  <li>Tarik tali ke tongkat kanan, lalu buat <strong>Simpul Jangkar</strong>.</li>
                  <li>Tarik menyilang ke tongkat kiri dan ulangi simpul jangkar hingga 7-8 trap ke arah kaki.</li>
                  <li>Pastikan tarikan tali kencang dan tidak kendor saat ditekan beban tubuh.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">4</span>
                  Penguncian & Uji Beban
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Kunci tali di anak tandu bawah dengan Simpul Pangkal dan Simpul Mati.</li>
                  <li>Uji tekan anyaman dengan tangan berbobot kuat sebelum menaikkan korban.</li>
                  <li>Ikat tubuh korban dengan mitela agar tidak terguling saat evakuasi mendaki/menurun.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* DAFTAR 10 SIMPUL & IKATAN */
        /* ============================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List of Knots */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              Katalog Simpul & Ikatan ({filteredSimpulList.length})
            </h3>
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredSimpulList.map((item) => {
                const isSelected = selectedSimpul.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSimpul(item)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.kategori}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            item.kesulitan === 'Mudah'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : item.kesulitan === 'Sedang'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {item.kesulitan}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {item.nama}
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? 'text-emerald-600 translate-x-1' : 'text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed View & Steps */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {selectedSimpul.kategori} Kepramukaan
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {selectedSimpul.nama}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {selectedSimpul.fungsi}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                  selectedSimpul.kesulitan === 'Mudah'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : selectedSimpul.kesulitan === 'Sedang'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                Tingkat: {selectedSimpul.kesulitan}
              </span>
            </div>

            {/* SVG Illustration of Knot */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
              <KnotIllustrationSvg id={selectedSimpul.id} />
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3">
                Diagram Alur Tali {selectedSimpul.nama}
              </div>
            </div>

            {/* Practical Application */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Fungsi Nyata di Perkemahan:
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedSimpul.kegunaanKemah}
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Langkah-Langkah Pembuatan:
              </h3>
              <div className="space-y-2">
                {selectedSimpul.langkah.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Clean SVG illustration generator for knots
const KnotIllustrationSvg: React.FC<{ id: string }> = ({ id }) => {
  return (
    <svg width="280" height="130" viewBox="0 0 280 130" className="drop-shadow-xs">
      {/* Wood stick if it's hitch/lashing */}
      {(id.includes('pangkal') || id.includes('jangkar') || id.includes('palang') || id.includes('silang')) && (
        <rect x="20" y="55" width="240" height="20" rx="6" fill="#b45309" />
      )}
      {(id.includes('palang') || id.includes('silang')) && (
        <rect x="130" y="10" width="20" height="110" rx="6" fill="#d97706" />
      )}

      {/* Rope lines according to knot type */}
      {id === 'simpul-mati' && (
        <g stroke="#0284c7" strokeWidth="8" fill="none" strokeLinecap="round">
          {/* Loop 1 */}
          <path d="M 40 65 Q 90 30 140 65 T 240 65" />
          {/* Loop 2 interlinked */}
          <path d="M 40 65 Q 90 100 140 65 T 240 65" stroke="#dc2626" />
        </g>
      )}

      {id === 'simpul-hidup' && (
        <g stroke="#0284c7" strokeWidth="8" fill="none" strokeLinecap="round">
          <path d="M 50 65 L 120 65 C 160 30 160 100 120 65 L 230 65" />
          <circle cx="140" cy="65" r="16" stroke="#0284c7" strokeWidth="6" />
        </g>
      )}

      {id === 'simpul-pangkal' && (
        <g stroke="#38bdf8" strokeWidth="8" fill="none" strokeLinecap="round">
          <path d="M 70 85 L 120 45 L 160 85 L 210 45" />
          <line x1="110" y1="40" x2="170" y2="90" stroke="#0284c7" strokeWidth="7" />
        </g>
      )}

      {id === 'simpul-jangkar' && (
        <g stroke="#0284c7" strokeWidth="8" fill="none" strokeLinecap="round">
          <path d="M 90 90 L 90 40 Q 140 25 190 40 L 190 90" />
          <line x1="90" y1="65" x2="190" y2="65" stroke="#38bdf8" strokeWidth="8" />
        </g>
      )}

      {(id === 'ikatan-palang' || id === 'ikatan-silang') && (
        <g stroke="#dc2626" strokeWidth="7" fill="none" strokeLinecap="round">
          <rect x="120" y="45" width="40" height="40" rx="3" stroke="#0284c7" strokeWidth="6" />
          <line x1="115" y1="40" x2="165" y2="90" />
          <line x1="165" y1="40" x2="115" y2="90" />
        </g>
      )}

      {!['simpul-mati', 'simpul-hidup', 'simpul-pangkal', 'simpul-jangkar', 'ikatan-palang', 'ikatan-silang'].includes(id) && (
        <g stroke="#0284c7" strokeWidth="8" fill="none" strokeLinecap="round">
          <path d="M 50 65 Q 90 20 140 65 Q 190 110 230 65" />
          <path d="M 60 75 Q 110 120 150 75 Q 190 30 220 75" stroke="#16a34a" />
        </g>
      )}
    </svg>
  );
};
