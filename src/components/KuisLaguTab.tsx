import React, { useState } from 'react';
import {
  KUIS_PRAMUKA_12,
  DAFTAR_LAGU_PRAMUKA,
  LaguPramuka,
  KuisSoal,
} from '../data/pramukaData';
import { scoutAudio } from '../utils/audioSynth';
import {
  Award,
  Sparkles,
  HelpCircle,
  Music,
  HeartPulse,
  Play,
  Square,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const KuisLaguTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'kuis' | 'p3k' | 'lagu'>('kuis');

  // Kuis State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Lagu & Synthesizer State
  const [activeSong, setActiveSong] = useState<LaguPramuka>(DAFTAR_LAGU_PRAMUKA[0]);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [playingNoteIdx, setPlayingNoteIdx] = useState<number | null>(null);

  // Kuis handlers
  const currentQ: KuisSoal = KUIS_PRAMUKA_12[currentQuestionIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    if (selectedAnswer === currentQ.kunci) {
      setScore((prev) => prev + 10);
      setCorrectCount((prev) => prev + 1);
      scoutAudio.playCorrectSound();
    } else {
      scoutAudio.playWrongSound();
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < KUIS_PRAMUKA_12.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setCorrectCount(0);
    setIsQuizCompleted(false);
  };

  // Badge award evaluation
  const getBadgeAward = (finalScore: number) => {
    if (finalScore >= 110) {
      return {
        badge: '🌟 Lencana Pramuka Garuda',
        status: 'Istimewa / Master Kepanduan',
        desc: 'Pemahaman sempurna tentang kepanduan dunia, sejarah nasional, dan teknik lapangan!',
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-300',
      };
    } else if (finalScore >= 90) {
      return {
        badge: '🎖️ Lencana Teladan Utama',
        status: 'Sangat Baik',
        desc: 'Pemahaman kepramukaan sangat tinggi dan siap menjadi pemimpin regu teladan!',
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300',
      };
    } else if (finalScore >= 70) {
      return {
        badge: '🥈 Lencana Penggalang Terap',
        status: 'Cukup Baik',
        desc: 'Menguasai sebagian besar materi dasar dan teknik kepanduan dengan baik.',
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-300',
      };
    } else {
      return {
        badge: '🥉 Lencana Penggalang Ramu',
        status: 'Perlu Belajar Lagi',
        desc: 'Terus giat berlatih dan membaca buku saku pandu untuk meningkatkan wawasan!',
        color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-300',
      };
    }
  };

  // Play Melody Handlers
  const handleTogglePlaySong = (song: LaguPramuka) => {
    if (isPlayingSong && activeSong.id === song.id) {
      scoutAudio.stopMelody();
      setIsPlayingSong(false);
      setPlayingNoteIdx(null);
      return;
    }

    setActiveSong(song);
    setIsPlayingSong(true);
    scoutAudio.playMelody(
      song.melody,
      song.tempoBpm,
      (idx) => setPlayingNoteIdx(idx),
      () => {
        setIsPlayingSong(false);
        setPlayingNoteIdx(null);
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-rose-700 via-pink-800 to-rose-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/60 backdrop-blur-md text-rose-200 text-xs font-semibold border border-rose-500/40">
            <Sparkles className="w-3.5 h-3.5 text-rose-300" />
            <span>Asah Otak, Penanganan Medis & Lagu Pandu</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Kuis Cerdas Cermat, P3K & Lagu Pramuka
          </h1>
          <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
            Uji pengetahuan kepramukaan 12 soal berbobot dengan penganugerahan lencana kehormatan, panduan pertolongan pertama (P3K) darurat, serta nyanyian lagu-lagu Pramuka dengan audio melodi nyata.
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveSection('kuis')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'kuis'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Kuis Cerdas Cermat (12 Soal)</span>
        </button>
        <button
          onClick={() => setActiveSection('p3k')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'p3k'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Pertolongan Pertama (P3K Lapangan)</span>
        </button>
        <button
          onClick={() => setActiveSection('lagu')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'lagu'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Lagu Pramuka & Audio Melodi</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. KUIS CERDAS CERMAT 12 SOAL */}
      {/* ============================================================== */}
      {activeSection === 'kuis' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          {!isQuizCompleted ? (
            <>
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Soal #{currentQuestionIdx + 1} dari {KUIS_PRAMUKA_12.length}
                  </span>
                  <div className="w-36 bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-rose-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${((currentQuestionIdx + 1) / KUIS_PRAMUKA_12.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Skor Sementara:</span>
                  <span className="text-xl font-mono font-black text-rose-600">
                    {score} Poin
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.pertanyaan}
                </h3>

                {/* Multiple Choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ.pilihan.map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQ.kunci;
                    let btnStyle =
                      'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300';

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200';
                      }
                    } else if (isSelected) {
                      btnStyle = 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 shadow-2xs';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`p-4 rounded-2xl border text-left font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-3 ${btnStyle}`}
                      >
                        <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-mono shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanation & Next button */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {selectedAnswer === currentQ.kunci ? (
                      <span className="text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Jawaban Anda Tepat! (+10 Poin)
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Jawaban Anda Belum Tepat
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>Penjelasan:</strong> {currentQ.penjelasan}
                  </p>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                {!isAnswerSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    Kunci Jawaban
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span>
                      {currentQuestionIdx < KUIS_PRAMUKA_12.length - 1
                        ? 'Soal Berikutnya'
                        : 'Lihat Hasil & Lencana'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Quiz Completed View */
            <div className="text-center py-6 space-y-6 max-w-lg mx-auto">
              <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 mx-auto flex items-center justify-center text-4xl shadow-inner">
                ⚜
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  Kuis Selesai!
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Skor Anda: {score} / 120 Poin
                </h3>
                <p className="text-xs text-slate-500">
                  Benar {correctCount} dari {KUIS_PRAMUKA_12.length} soal kepramukaan.
                </p>
              </div>

              {/* Badge Certificate Card */}
              {(() => {
                const award = getBadgeAward(score);
                return (
                  <div className={`p-6 rounded-3xl border ${award.color} space-y-2`}>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                      Penganugerahan Lencana Kehormatan:
                    </span>
                    <h4 className="text-xl font-black">{award.badge}</h4>
                    <span className="text-xs font-bold block">{award.status}</span>
                    <p className="text-xs leading-relaxed opacity-90">{award.desc}</p>
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={handleRestartQuiz}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Kuis</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. PANDUAN P3K DARURAT LAPANGAN */}
      {/* ============================================================== */}
      {activeSection === 'p3k' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600" />
              Protokol Tindakan Pertolongan Pertama (P3K) di Perkemahan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tindakan cepat dan tepat saat menghadapi kecelakaan darurat lapangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Keseleo / RICE */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <span className="p-1 rounded-md bg-rose-100 dark:bg-rose-950">1</span>
                Terkilir / Keseleo (Metode R.I.C.E)
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <li><strong>Rest (Istirahat):</strong> Hentikan segera aktivitas korban dan jangan dibiarkan bertumpu pada kaki yang cedera.</li>
                <li><strong>Ice (Kompres Dingin):</strong> Beri kompres es/air dingin selama 15-20 menit untuk meredakan pembengkakan.</li>
                <li><strong>Compression (Balut Tekan):</strong> Balut dengan perban elastis mitela agar persendian tidak bergeser, jangan terlalu kencang.</li>
                <li><strong>Elevation (Tinggikan):</strong> Posisikan bagian tubuh yang cedera lebih tinggi dari posisi jantung.</li>
              </ul>
            </div>

            {/* 2. Hipotermia */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <span className="p-1 rounded-md bg-blue-100 dark:bg-blue-950">2</span>
                Hipotermia (Kedinginan Ekstrem di Gunung/Camp)
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <li>Bawa segera korban ke dalam tenda kering yang terhindar dari angin.</li>
                <li>Ganti seluruh pakaian yang basah dengan pakaian kering tebal dan kaos kaki hangat.</li>
                <li>Bungkus dengan sleeping bag dan thermal emergency blanket.</li>
                <li>Beri minuman hangat manis (teh manis/cokelat), jangan berikan kopi atau alkohol.</li>
              </ul>
            </div>

            {/* 3. Luka Bakar */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-950">3</span>
                Luka Bakar Api Unggun / Air Mendidih
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <li>Aliri area luka bakar dengan air bersih yang mengalir selama minimal 10-15 menit.</li>
                <li><strong>DILARANG:</strong> Jangan pernah mengoleskan odol, kecap, mentega, atau minyak tanah pada luka bakar!</li>
                <li>Tutup dengan kain kasa steril lembap yang tidak berbulu secara longgar.</li>
                <li>Bawa ke puskesmas terdekat jika terdapat gelembung lepuh yang besar.</li>
              </ul>
            </div>

            {/* 4. Gigitan Ular / Hewan */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                <span className="p-1 rounded-md bg-purple-100 dark:bg-purple-950">4</span>
                Gigitan Ular / Serangga Berbisa
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <li>Tenangkan korban dan <strong>imobilisasi</strong> (jangan digerakkan) bagian tubuh yang digigit dengan bidai tongkat.</li>
                <li><strong>DILARANG:</strong> Jangan menyayat luka, jangan mengikat torniket terlalu kencang, dan jangan menghisap racun dengan mulut!</li>
                <li>Lepaskan cincin/jam tangan sebelum bagian tubuh membengkak.</li>
                <li>Evakuasi korban dengan tandu darurat menuju fasilitas kesehatan sesegera mungkin.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. LAGU PRAMUKA & AUDIO SYNTHESIZER */}
      {/* ============================================================== */}
      {activeSection === 'lagu' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Song list */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Daftar Lagu Wajib & Riang Pramuka
            </h3>
            {DAFTAR_LAGU_PRAMUKA.map((song) => {
              const isSelected = activeSong.id === song.id;
              const isCurrentPlaying = isPlayingSong && isSelected;

              return (
                <div
                  key={song.id}
                  onClick={() => {
                    if (isPlayingSong && !isSelected) {
                      scoutAudio.stopMelody();
                      setIsPlayingSong(false);
                      setPlayingNoteIdx(null);
                    }
                    setActiveSong(song);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                      {song.judul}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Ciptaan: {song.pencipta} ({song.tempoBpm} BPM)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlaySong(song);
                    }}
                    className={`p-2 rounded-xl text-white font-bold transition-all cursor-pointer ${
                      isCurrentPlaying
                        ? 'bg-rose-600 animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                    title={isCurrentPlaying ? 'Stop Melodi' : 'Putar Melodi Synth'}
                  >
                    {isCurrentPlaying ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Song Lyrics & Visualizer */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {activeSong.judul}
                </h3>
                <span className="text-xs text-slate-500">
                  Ciptaan: {activeSong.pencipta} • {activeSong.deskripsi}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleTogglePlaySong(activeSong)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors cursor-pointer ${
                  isPlayingSong ? 'bg-rose-600 animate-pulse' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isPlayingSong ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlayingSong ? 'Hentikan Melodi' : 'Putar Melodi (Web Audio)'}</span>
              </button>
            </div>

            {/* Note Visualizer Dots */}
            {isPlayingSong && (
              <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 tracking-wider block">
                  Synthesizer Nada Melodi Berjalan:
                </span>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {activeSong.melody.map((m, idx) => (
                    <span
                      key={idx}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                        playingNoteIdx === idx
                          ? 'bg-rose-600 text-white scale-125 shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m.note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lyrics View */}
            <div className="space-y-2.5 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-center font-medium text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-loose">
              {activeSong.lirik.map((baris, idx) => (
                <p key={idx} className="tracking-wide">
                  {baris}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
