import React, { useState } from 'react';
import {
  DASA_DARMA_LIST,
  TRI_SATYA_DATA,
} from '../data/pramukaData';
import { scoutAudio } from '../utils/audioSynth';
import { MainModuleHeader } from './MainModuleHeader';
import {
  BookOpen,
  Volume2,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  History,
  Trees,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';

export const FilosofiTab: React.FC = () => {
  const [activeSatyaTab, setActiveSatyaTab] = useState<'penggalang' | 'penegak'>('penggalang');
  const [expandedDarma, setExpandedDarma] = useState<number | null>(1);
  const [isClapping, setIsClapping] = useState(false);
  const [activeWhistle, setActiveWhistle] = useState<string | null>(null);

  const handlePlayWhistle = (type: 'pendek' | 'panjang' | 'kumpul' | 'awas' | 'bahaya') => {
    setActiveWhistle(type);
    scoutAudio.playWhistle(type);
    setTimeout(() => {
      setActiveWhistle(null);
    }, type === 'kumpul' ? 1200 : type === 'awas' ? 1400 : 800);
  };

  const handlePlayTepuk = () => {
    if (isClapping) return;
    setIsClapping(true);
    scoutAudio.playTepukPramuka(() => {
      setIsClapping(false);
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Utama Modul Dasar & Filosofi (Orange) */}
      <MainModuleHeader
        tabId="filosofi"
        customBadges={[
          { label: 'Dasa Darma 1–10 Lengkap', icon: Sparkles },
          { label: 'Tri Satya Penggalang & Penegak', icon: ShieldCheck },
          { label: 'Audio Nyata Tepuk & Peluit', icon: Volume2 },
        ]}
      />

      {/* ============================================================== */}
      {/* AUDIO INTERAKTIF: PELUIT PRAMUKA & TEPUK PRAMUKA */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Simulasi Suara & Peluit Lapangan (Web Audio API)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bunyi nyata sintetis tanpa rekaman luar: isyarat peluit lapangan dan ritme Tepuk Pramuka.
            </p>
          </div>

          {/* Tepuk Pramuka Action Button */}
          <button
            type="button"
            onClick={handlePlayTepuk}
            disabled={isClapping}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
              isClapping
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-amber-600 hover:bg-amber-700 text-white hover:scale-102'
            }`}
          >
            <span className="text-base">👏</span>
            <span>{isClapping ? 'Bertepuk Pramuka...' : 'Mainkan Tepuk Pramuka (2x)'}</span>
          </button>
        </div>

        {/* Whistle signals buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <button
            type="button"
            onClick={() => handlePlayWhistle('pendek')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              activeWhistle === 'pendek'
                ? 'bg-amber-500 text-white border-amber-600 scale-102 shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              Isyarat ( • )
            </div>
            <div className="font-bold text-sm mt-0.5">Tiupan Pendek</div>
            <div className="text-[11px] opacity-75 mt-1">Panggilan Siap / Perhatian</div>
          </button>

          <button
            type="button"
            onClick={() => handlePlayWhistle('panjang')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              activeWhistle === 'panjang'
                ? 'bg-amber-500 text-white border-amber-600 scale-102 shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              Isyarat ( — )
            </div>
            <div className="font-bold text-sm mt-0.5">Tiupan Panjang</div>
            <div className="text-[11px] opacity-75 mt-1">Berhenti / Istirahat</div>
          </button>

          <button
            type="button"
            onClick={() => handlePlayWhistle('kumpul')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              activeWhistle === 'kumpul'
                ? 'bg-amber-500 text-white border-amber-600 scale-102 shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              Isyarat ( • • — )
            </div>
            <div className="font-bold text-sm mt-0.5">Tiupan Kumpul</div>
            <div className="text-[11px] opacity-75 mt-1">Semua Regu Berkumpul</div>
          </button>

          <button
            type="button"
            onClick={() => handlePlayWhistle('awas')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              activeWhistle === 'awas'
                ? 'bg-amber-500 text-white border-amber-600 scale-102 shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              Isyarat ( • • • • • )
            </div>
            <div className="font-bold text-sm mt-0.5">Tiupan Awas / Cepat</div>
            <div className="text-[11px] opacity-75 mt-1">Peringatan Berjaga</div>
          </button>

          <button
            type="button"
            onClick={() => handlePlayWhistle('bahaya')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              activeWhistle === 'bahaya'
                ? 'bg-rose-500 text-white border-rose-600 scale-102 shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
              Isyarat ( — — — )
            </div>
            <div className="font-bold text-sm mt-0.5 text-rose-700 dark:text-rose-300">
              Tanda Bahaya
            </div>
            <div className="text-[11px] opacity-75 mt-1">Darurat / Evakuasi</div>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TRI SATYA (PENGGALANG VS PENEGAK) */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Tri Satya Pramuka
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tiga janji kesetiaan seorang anggota Pramuka Indonesia
            </p>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveSatyaTab('penggalang')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSatyaTab === 'penggalang'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Golongan Penggalang (11-15 th)
            </button>
            <button
              onClick={() => setActiveSatyaTab('penegak')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSatyaTab === 'penegak'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Golongan Penegak & Pandega (16-25 th)
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Demi kehormatanku aku berjanji akan bersungguh-sungguh:
          </p>
          <div className="space-y-2.5">
            {TRI_SATYA_DATA[activeSatyaTab].map((butir, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {idx + 1}
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                  {butir}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 italic border-t border-amber-200/50 dark:border-amber-800/40">
            {activeSatyaTab === 'penggalang'
              ? 'Catatan Penggalang: "mempersiapkan diri membangun masyarakat" karena masih dalam tahap pembinaan dasar keterampilan.'
              : 'Catatan Penegak: "ikut serta membangun masyarakat" karena sudah dewasa dan memiliki kewajiban bakti langsung ke masyarakat.'}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DASA DARMA PRAMUKA (1 - 10) */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Dasa Darma Pramuka (1–10)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sepuluh ketentuan moral dengan ulasan makna mendalam dan contoh penerapan nyata di perkemahan.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800">
            10 Darma
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {DASA_DARMA_LIST.map((item) => {
            const isExpanded = expandedDarma === item.nomor;
            return (
              <div
                key={item.nomor}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedDarma(isExpanded ? null : item.nomor)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-transform ${
                        isExpanded
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.nomor}
                    </div>
                    <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {item.teks}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-amber-200/60 dark:border-amber-800/60 text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[11px] block mb-1">
                        Makna Filosofis:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {item.makna}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-amber-200/70 dark:border-amber-800/70 space-y-1">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Pengamalan Nyata di Perkemahan:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                        {item.contohKemah}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAKNA LAMBANG TUNAS KELAPA & SEJARAH KEPANDUAN */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tunas Kelapa */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Trees className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Makna Lambang Tunas Kelapa (1961)
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <div className="font-semibold text-emerald-800 dark:text-emerald-300">
              Diciptakan oleh Soenardjo Atmodipuro (9 Maret 1961)
            </div>
            <p>
              Lambang resmi berupa siluet bayangan Tunas Kelapa (Nyiur) mengandung filosofi agung:
            </p>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 shrink-0">1. Buah Cikal:</span>
              <span>Buah nyiur yang bertumbuh melambangkan bahwa tiap Pramuka adalah inti kelangsungan hidup bangsa Indonesia.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 shrink-0">2. Daya Tahan Kuat:</span>
              <span>Buah kelapa dapat bertahan lama dalam keadaan apa pun, melambangkan keuletan jasmani dan rohani seorang pandu.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 shrink-0">3. Adaptasi Tinggi:</span>
              <span>Nyiur dapat tumbuh di mana saja, membuktikan Pramuka mampu beradaptasi dan menyesuaikan diri di segala situasi.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 shrink-0">4. Menjulang Tinggi:</span>
              <span>Pohon kelapa tumbuh lurus ke atas tanpa cabang, melambangkan cita-cita luhur dan kejujuran pandu yang tidak mudah goyah.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 shrink-0">5. Akar Kuat Menghunjam:</span>
              <span>Melambangkan tekad dan keyakinan yang berlandaskan dasar-dasar yang kuat, benar, dan nyata.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 shrink-0">6. Pohon Serba Guna:</span>
              <span>Dari akar hingga daun kelapa bermanfaat bagi manusia, mencerminkan Pramuka yang berguna bagi nusa, bangsa, dan agama.</span>
            </li>
          </ul>
        </div>

        {/* Sejarah Kepanduan Dunia & Indonesia */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Sejarah Kepanduan Dunia & Indonesia
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white text-xs block">
                🌍 Lord Robert Baden-Powell (1907)
              </span>
              <p className="leading-relaxed">
                Mendirikan perkemahan kepanduan pertama di Pulau Brownsea, Inggris (1-9 Agustus 1907) bersama 20 pemuda. Bukunya <em>Scouting for Boys</em> (1908) menginspirasi terbentuknya kepanduan di seluruh dunia.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white text-xs block">
                🇮🇩 Sri Sultan Hamengkubuwono IX (1961)
              </span>
              <p className="leading-relaxed">
                Bapak Pramuka Indonesia yang memimpin penyatuan puluhan organisasi kepanduan menjadi <strong>Gerakan Pramuka</strong> melalui Keppres No. 238 Tahun 1961. Beliau menjabat Ketua Kwarnas pertama selama 13 tahun.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white text-xs block">
                ⚜ Hari Pramuka 14 Agustus 1961
              </span>
              <p className="leading-relaxed">
                Ditandai dengan penyerahan Panji Gerakan Pramuka oleh Presiden Soekarno kepada Sri Sultan HB IX di Istana Negara serta defile pertama Pramuka di Jakarta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
