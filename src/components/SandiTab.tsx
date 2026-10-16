import React, { useState, useEffect, useRef, useMemo } from 'react';
import { scoutAudio } from '../utils/audioSynth';
import {
  Code,
  Volume2,
  VolumeX,
  Sun,
  Play,
  Square,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  XCircle,
  Layers,
} from 'lucide-react';

// Morse Code Dictionary
export const MORSE_DICT: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.',
  ' ': '/',
};

const REVERSE_MORSE: Record<string, string> = Object.entries(MORSE_DICT).reduce(
  (acc, [letter, morse]) => {
    acc[morse] = letter;
    return acc;
  },
  {} as Record<string, string>
);

// Semaphore Angles (Degrees: 0 is straight down, 45, 90, 135, 180 is up, 225, 270, 315)
// Standard Semaphore Arm Positions:
// 0: Down (6 o'clock)
// 45: Down-Right (7:30)
// 90: Right (9 o'clock)
// 135: Up-Right (10:30)
// 180: Straight Up (12 o'clock)
// 225: Up-Left (1:30)
// 270: Left (3 o'clock)
// 315: Down-Left (4:30)
export const SEMAPHORE_CONFIG: Record<string, [number, number]> = {
  A: [0, 45],
  B: [0, 90],
  C: [0, 135],
  D: [0, 180],
  E: [315, 0],
  F: [270, 0],
  G: [225, 0],
  H: [90, 45],
  I: [135, 45],
  J: [270, 180],
  K: [180, 45],
  L: [315, 45],
  M: [270, 45],
  N: [225, 45],
  O: [135, 90],
  P: [180, 90],
  Q: [315, 90],
  R: [270, 90],
  S: [225, 90],
  T: [180, 135],
  U: [315, 135],
  V: [180, 225],
  W: [270, 135],
  X: [270, 225],
  Y: [315, 135],
  Z: [270, 315],
  ' ': [0, 0],
};

export const SandiTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'morse' | 'semaphore' | 'kotak' | 'an_az'>('morse');

  // Morse State
  const [textInput, setTextInput] = useState('PRAMUKA');
  const [morseInput, setMorseInput] = useState('.--. .-. .- -- ..- -.- .-');
  const [isPlayingMorse, setIsPlayingMorse] = useState(false);
  const [signalLightOn, setSignalLightOn] = useState(false);
  const [activeMorseSymbol, setActiveMorseSymbol] = useState<string | null>(null);

  // Telegraph Sandbox
  const [sandboxMorse, setSandboxMorse] = useState('');
  const [telegraphKeyDownTime, setTelegraphKeyDownTime] = useState<number | null>(null);

  // Semaphore State
  const [semaphoreChar, setSemaphoreChar] = useState('A');
  const [semaphoreSentence, setSemaphoreSentence] = useState('SIAGA');
  const [isAnimatingSentence, setIsAnimatingSentence] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);

  // Semaphore Quiz State
  const [quizLetter, setQuizLetter] = useState('S');
  const [quizOptions, setQuizOptions] = useState<string[]>(['S', 'B', 'P', 'T']);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Sandi Kotak State
  const [kotakText, setKotakText] = useState('PRAJA MUDA');

  // Sync Text to Morse
  const handleTextChange = (val: string) => {
    setTextInput(val);
    const upper = val.toUpperCase();
    const morseWords = upper
      .split(' ')
      .map((word) =>
        word
          .split('')
          .map((ch) => MORSE_DICT[ch] || '')
          .filter(Boolean)
          .join(' ')
      )
      .join(' / ');
    setMorseInput(morseWords);
  };

  // Sync Morse to Text
  const handleMorseChange = (val: string) => {
    setMorseInput(val);
    const words = val.trim().split(/\s*[\/|]\s*/);
    const decodedWords = words.map((w) => {
      const letters = w.split(/\s+/);
      return letters.map((m) => REVERSE_MORSE[m] || '?').join('');
    });
    setTextInput(decodedWords.join(' '));
  };

  // Play Morse Audio & Signal Flash
  const handlePlayMorse = () => {
    if (isPlayingMorse) {
      scoutAudio.stopMorse();
      setIsPlayingMorse(false);
      setSignalLightOn(false);
      return;
    }

    setIsPlayingMorse(true);
    scoutAudio.playMorse(
      morseInput,
      14,
      (symbol) => {
        setActiveMorseSymbol(symbol);
        if (symbol === '.' || symbol === '-') {
          setSignalLightOn(true);
          setTimeout(() => setSignalLightOn(false), symbol === '.' ? 90 : 250);
        } else {
          setSignalLightOn(false);
        }
      },
      () => {
        setIsPlayingMorse(false);
        setSignalLightOn(false);
        setActiveMorseSymbol(null);
      }
    );
  };

  // Telegraph Key down/up handlers
  const handleTelegraphDown = () => {
    scoutAudio.startTelegraphTone();
    setSignalLightOn(true);
    setTelegraphKeyDownTime(Date.now());
  };

  const handleTelegraphUp = () => {
    scoutAudio.stopTelegraphTone();
    setSignalLightOn(false);
    if (telegraphKeyDownTime) {
      const duration = Date.now() - telegraphKeyDownTime;
      const symbol = duration < 240 ? '.' : '-';
      setSandboxMorse((prev) => prev + symbol);
      setTelegraphKeyDownTime(null);
    }
  };

  // Play Sentence in Semaphore
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnimatingSentence) {
      const chars = semaphoreSentence.toUpperCase().replace(/[^A-Z ]/g, '').split('');
      if (activeSentenceIndex < chars.length) {
        setSemaphoreChar(chars[activeSentenceIndex] || ' ');
        timer = setTimeout(() => {
          setActiveSentenceIndex((prev) => prev + 1);
        }, 1200);
      } else {
        setIsAnimatingSentence(false);
        setActiveSentenceIndex(0);
      }
    }
    return () => clearTimeout(timer);
  }, [isAnimatingSentence, activeSentenceIndex, semaphoreSentence]);

  const handleStartSentenceAnimation = () => {
    setActiveSentenceIndex(0);
    setIsAnimatingSentence(true);
  };

  // Initialize/Next Semaphore Quiz
  const generateNewQuiz = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const randomTarget = letters[Math.floor(Math.random() * letters.length)];
    const distractors: string[] = [];
    while (distractors.length < 3) {
      const r = letters[Math.floor(Math.random() * letters.length)];
      if (r !== randomTarget && !distractors.includes(r)) {
        distractors.push(r);
      }
    }
    const options = [randomTarget, ...distractors].sort(() => Math.random() - 0.5);
    setQuizLetter(randomTarget);
    setQuizOptions(options);
    setQuizFeedback(null);
  };

  const handleAnswerQuiz = (selected: string) => {
    if (selected === quizLetter) {
      setQuizScore((prev) => prev + 10);
      setQuizStreak((prev) => prev + 1);
      setQuizFeedback('correct');
      setTimeout(generateNewQuiz, 800);
    } else {
      setQuizStreak(0);
      setQuizFeedback('wrong');
    }
  };

  // Sandi AN / AZ helpers
  const sandiAN = (str: string) => {
    return str
      .toUpperCase()
      .split('')
      .map((c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 77) return String.fromCharCode(code + 13);
        if (code >= 78 && code <= 90) return String.fromCharCode(code - 13);
        return c;
      })
      .join('');
  };

  const sandiAZ = (str: string) => {
    return str
      .toUpperCase()
      .split('')
      .map((c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCharCode(155 - code);
        return c;
      })
      .join('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-700 via-indigo-800 to-indigo-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/60 backdrop-blur-md text-blue-200 text-xs font-semibold border border-blue-500/40">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Keterampilan Komunikasi Rahasia Pandu</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Keterampilan Sandi Interaktif
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Laboratorium sandi kepramukaan lengkap: Sandi Morse dengan audio beeper & senter sorot, Simulator Semaphore visual 360°, Sandi Kotak I & II SVG, Sandi Rumput, serta Sandi AN/AZ.
          </p>
        </div>
      </div>

      {/* Subtab Selector */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('morse')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'morse'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Sandi Morse & Senter
        </button>
        <button
          onClick={() => setActiveSubTab('semaphore')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'semaphore'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Sandi Semaphore Visual
        </button>
        <button
          onClick={() => setActiveSubTab('kotak')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'kotak'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Sandi Kotak I, II & Rumput
        </button>
        <button
          onClick={() => setActiveSubTab('an_az')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'an_az'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Sandi AN & Sandi AZ
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. SANDI MORSE & SENTER SINYAL */}
      {/* ============================================================== */}
      {activeSubTab === 'morse' && (
        <div className="space-y-6">
          {/* Penerjemah 2 Arah */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Penerjemah 2 Arah (Teks ⇄ Morse)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ketik teks latin atau kode morse (gunakan titik . dan strip - dipisah spasi)
                </p>
              </div>

              {/* Senter Sinyal & Audio Play */}
              <div className="flex items-center gap-3">
                {/* Visual Signal Lamp */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                    signalLightOn
                      ? 'bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/50 scale-110 ring-4 ring-amber-300/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                  title="Simulasi Lampu Senter Sinyal Morse"
                >
                  <Sun className={`w-5 h-5 ${signalLightOn ? 'animate-spin-slow' : ''}`} />
                </div>

                <button
                  type="button"
                  onClick={handlePlayMorse}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPlayingMorse
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {isPlayingMorse ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isPlayingMorse ? 'Hentikan Bunyi' : 'Bunyikan Morse (Beeper)'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Teks Latin
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Ketik teks di sini..."
                  rows={3}
                  className="w-full p-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Kode Morse</span>
                  <span className="text-[10px] text-slate-400">/ = jeda kata</span>
                </label>
                <textarea
                  value={morseInput}
                  onChange={(e) => handleMorseChange(e.target.value)}
                  placeholder="Contoh: .--. .-. .- -- ..- -.- .-"
                  rows={3}
                  className="w-full p-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-mono font-bold tracking-widest focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Sandbox Papan Ketuk Telegraf Morse */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Papan Ketuk Telegraf Morse (Sandbox Tangan)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tekan tombol ketuk untuk melatih ritme morse Anda: tekan singkat untuk titik (•) dan tekan tahan untuk strip (—).
                </p>
              </div>

              <button
                onClick={() => setSandboxMorse('')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Telegraph Big Push Button */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onMouseDown={handleTelegraphDown}
                  onMouseUp={handleTelegraphUp}
                  onTouchStart={handleTelegraphDown}
                  onTouchEnd={handleTelegraphUp}
                  className="w-32 h-32 rounded-full bg-linear-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 active:scale-95 text-white shadow-xl flex flex-col items-center justify-center gap-1 cursor-pointer select-none transition-transform active:shadow-inner"
                >
                  <span className="text-xs font-mono uppercase tracking-wider font-extrabold">
                    TEKAN KETUK
                  </span>
                  <span className="text-[10px] opacity-75">Hold to Dah</span>
                </button>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-semibold">
                  Klik & Tahan (Web Audio Active)
                </span>
              </div>

              {/* Transcribed Result */}
              <div className="md:col-span-2 space-y-3">
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Hasil Ketukan Morse Anda:
                  </span>
                  <div className="text-xl font-mono font-extrabold text-blue-600 dark:text-blue-400 min-h-7 tracking-widest break-all">
                    {sandboxMorse || 'Belum ada ketukan...'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSandboxMorse((prev) => prev + ' ')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    + Spasi Huruf
                  </button>
                  <button
                    onClick={() => setSandboxMorse((prev) => prev + ' / ')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    + Jeda Kata ( / )
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bagan Alfabet Morse A-Z */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Bagan Standar Alfabet & Angka Morse
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
              {Object.entries(MORSE_DICT).filter(([k]) => k !== ' ').map(([char, code]) => (
                <div
                  key={char}
                  onClick={() => {
                    setTextInput(char);
                    setMorseInput(code);
                    scoutAudio.playMorse(code);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-center cursor-pointer transition-colors"
                >
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">{char}</div>
                  <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SANDI SEMAPHORE VISUAL */}
      {/* ============================================================== */}
      {activeSubTab === 'semaphore' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Simulator */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 flex flex-col items-center">
              <div className="w-full flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Simulator Posisi Bendera Semaphore
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Karakter aktif: <strong className="text-blue-600">{semaphoreChar}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <select
                    value={semaphoreChar}
                    onChange={(e) => setSemaphoreChar(e.target.value)}
                    className="p-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => (
                      <option key={c} value={c}>
                        Huruf {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Semaphore Graphic SVG */}
              <div className="py-6 flex justify-center">
                <SemaphoreScoutVisual char={semaphoreChar} />
              </div>

              {/* Degrees Indicator */}
              <div className="w-full flex items-center justify-around text-xs font-mono p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div>
                  Lengan Kiri:{' '}
                  <strong className="text-amber-600">
                    {SEMAPHORE_CONFIG[semaphoreChar]?.[0] || 0}°
                  </strong>
                </div>
                <div>
                  Lengan Kanan:{' '}
                  <strong className="text-amber-600">
                    {SEMAPHORE_CONFIG[semaphoreChar]?.[1] || 0}°
                  </strong>
                </div>
              </div>
            </div>

            {/* Sentence Player & Animator */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Pemutar Kalimat Semaphore Berseri
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ketik kata atau kalimat untuk dimainkan secara otomatis huruf demi huruf.
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  value={semaphoreSentence}
                  onChange={(e) => setSemaphoreSentence(e.target.value.toUpperCase())}
                  placeholder="Ketik kata/kalimat..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold tracking-widest uppercase text-slate-900 dark:text-white"
                />

                <button
                  type="button"
                  onClick={handleStartSentenceAnimation}
                  disabled={isAnimatingSentence}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>
                    {isAnimatingSentence
                      ? `Memutar Huruf (${activeSentenceIndex + 1}/${semaphoreSentence.length})...`
                      : 'Mulai Animasi Berseri'}
                  </span>
                </button>
              </div>

              {/* Kuis Tebak Semaphore */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                      Mode Kuis: Tebak Huruf Semaphore
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Tebak huruf yang diperagakan pandu di samping
                    </span>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-emerald-600">Skor: {quizScore}</span>
                    {quizStreak > 1 && (
                      <span className="block text-[10px] text-amber-600 font-bold">
                        Streak: {quizStreak}x 🔥
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2">
                  {quizOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswerQuiz(opt)}
                      className="p-3 rounded-xl font-extrabold text-base border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {quizFeedback === 'correct' && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hebat! Jawaban Anda benar (+10 poin).</span>
                  </div>
                )}
                {quizFeedback === 'wrong' && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    <span>Kurang tepat. Coba perhatikan kembali sudut bendera.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SANDI KOTAK I, II & RUMPUT */}
      {/* ============================================================== */}
      {activeSubTab === 'kotak' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Render Grafis Sandi Kotak I, II & Sandi Rumput
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ketik teks di bawah untuk menghasilkan gambar simbol garis sandi secara dinamis.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Teks Masukan:
            </label>
            <input
              type="text"
              value={kotakText}
              onChange={(e) => setKotakText(e.target.value.toUpperCase())}
              placeholder="Contoh: PRAJA MUDA"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold tracking-widest uppercase text-slate-900 dark:text-white"
            />
          </div>

          {/* Sandi Kotak 1 Rendering */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              1. Sandi Kotak I
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 min-h-16 items-center">
              {kotakText.split('').map((char, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <SandiKotak1Glyph char={char} />
                  <span className="text-[10px] font-mono text-slate-400 mt-1">{char}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sandi Rumput Rendering */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              2. Sandi Rumput (Berdasarkan Morse: Pendek = Rumput Rendah, Panjang = Rumput Tinggi)
            </h4>
            <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 overflow-x-auto min-h-20 flex items-end gap-3">
              {kotakText.split(' ').map((word, wIdx) => (
                <div key={wIdx} className="flex items-end gap-1 px-2 py-1 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                  {word.split('').map((char, cIdx) => {
                    const morse = MORSE_DICT[char] || '';
                    return (
                      <div key={cIdx} className="flex flex-col items-center">
                        <SandiRumputGlyph morse={morse} />
                        <span className="text-[9px] font-mono text-slate-400 mt-1">{char}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SANDI AN & AZ */}
      {/* ============================================================== */}
      {activeSubTab === 'an_az' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sandi AN */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Sandi AN (Kunci: A = N)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Alfabet dibagi 2 baris (A-M dan N-Z). Huruf saling bertukar posisi secara vertikal.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold space-y-1 text-center">
              <div className="tracking-widest text-blue-600">A B C D E F G H I J K L M</div>
              <div className="tracking-widest text-amber-600">N O P Q R S T U V W X Y Z</div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Hasil Enkripsi Sandi AN:
              </label>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-sm font-mono font-bold text-blue-800 dark:text-blue-300">
                {sandiAN(textInput) || '-'}
              </div>
            </div>
          </div>

          {/* Sandi AZ */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Sandi AZ (Kunci: A = Z)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Alfabet dibalik dari belakang ke depan (A berpasangan dengan Z, B dengan Y, dst).
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold space-y-1 text-center">
              <div className="tracking-widest text-emerald-600">A B C D E F G H I J K L M</div>
              <div className="tracking-widest text-purple-600">Z Y X W V U T S R Q P O N</div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Hasil Enkripsi Sandi AZ:
              </label>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-sm font-mono font-bold text-purple-800 dark:text-purple-300">
                {sandiAZ(textInput) || '-'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// SVG Semaphore Scout Figurine
const SemaphoreScoutVisual: React.FC<{ char: string }> = ({ char }) => {
  const angles = SEMAPHORE_CONFIG[char.toUpperCase()] || [0, 0];
  const [leftAngle, rightAngle] = angles;

  // Convert compass degree (0 down) to SVG coordinate math
  // Origin body at (100, 100)
  const getFlagPos = (angleDeg: number) => {
    // 0 is down (90 deg in trig coords)
    const rad = ((angleDeg + 90) * Math.PI) / 180;
    const len = 50;
    const x = 100 + len * Math.cos(rad);
    const y = 100 + len * Math.sin(rad);
    return { x, y };
  };

  const leftPos = getFlagPos(leftAngle);
  const rightPos = getFlagPos(rightAngle);

  return (
    <svg width="220" height="220" viewBox="0 0 200 200" className="drop-shadow-md">
      {/* Compass background circle */}
      <circle cx="100" cy="100" r="85" fill="none" stroke="#e2e8f0" strokeDasharray="3 3" />

      {/* Scout Body */}
      {/* Head & Hat */}
      <circle cx="100" cy="55" r="14" fill="#f59e0b" />
      {/* Brown Baret Hat */}
      <path d="M 85 50 Q 100 40 118 48 Q 112 56 85 50" fill="#78350f" />
      {/* Torso */}
      <rect x="90" y="70" width="20" height="50" rx="4" fill="#92400e" />
      {/* Legs */}
      <line x1="95" y1="120" x2="90" y2="165" stroke="#451a03" strokeWidth="6" strokeLinecap="round" />
      <line x1="105" y1="120" x2="110" y2="165" stroke="#451a03" strokeWidth="6" strokeLinecap="round" />

      {/* Left Arm & Flag */}
      <line x1="92" y1="80" x2={leftPos.x} y2={leftPos.y} stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
      <circle cx={leftPos.x} cy={leftPos.y} r="3" fill="#000" />
      {/* Left Flag (Red & Yellow triangle) */}
      <polygon
        points={`${leftPos.x},${leftPos.y} ${leftPos.x + 16},${leftPos.y - 14} ${leftPos.x + 22},${leftPos.y + 10}`}
        fill="#dc2626"
      />
      <polygon
        points={`${leftPos.x},${leftPos.y} ${leftPos.x + 8},${leftPos.y - 7} ${leftPos.x + 11},${leftPos.y + 5}`}
        fill="#facc15"
      />

      {/* Right Arm & Flag */}
      <line x1="108" y1="80" x2={rightPos.x} y2={rightPos.y} stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
      <circle cx={rightPos.x} cy={rightPos.y} r="3" fill="#000" />
      {/* Right Flag */}
      <polygon
        points={`${rightPos.x},${rightPos.y} ${rightPos.x - 16},${rightPos.y - 14} ${rightPos.x - 22},${rightPos.y + 10}`}
        fill="#dc2626"
      />
      <polygon
        points={`${rightPos.x},${rightPos.y} ${rightPos.x - 8},${rightPos.y - 7} ${rightPos.x - 11},${rightPos.y + 5}`}
        fill="#facc15"
      />
    </svg>
  );
};

// SVG Sandi Kotak 1 Glyph
const SandiKotak1Glyph: React.FC<{ char: string }> = ({ char }) => {
  if (char === ' ') return <div className="w-6 h-6 border-b-2 border-slate-300" />;

  // Mapping letter to box position & dot
  // Grid 1: A B (pos 0), C D (pos 1), E F (pos 2)
  // G H (pos 3), I J (pos 4), K L (pos 5)
  // M N (pos 6), O P (pos 7), Q R (pos 8)
  // Grid 2 (X): S T, U V, W X, Y Z
  const letter = char.toUpperCase();
  const isSecond = 'BDFHJLNPRTVXZ'.includes(letter);

  return (
    <svg width="28" height="28" viewBox="0 0 30 30" className="stroke-slate-800 dark:stroke-slate-100">
      {/* Outer frame */}
      <rect x="2" y="2" width="26" height="26" fill="none" strokeWidth="2.5" />
      {isSecond && <circle cx="15" cy="15" r="2.5" fill="currentColor" />}
    </svg>
  );
};

// SVG Sandi Rumput Glyph
const SandiRumputGlyph: React.FC<{ morse: string }> = ({ morse }) => {
  if (!morse) return <span className="text-xs text-slate-400">-</span>;

  return (
    <svg width={morse.length * 14 + 6} height="36" viewBox={`0 0 ${morse.length * 14 + 6} 36`}>
      <line x1="0" y1="34" x2="100%" y2="34" stroke="#16a34a" strokeWidth="2" />
      {morse.split('').map((sym, idx) => {
        const x = idx * 14 + 4;
        const height = sym === '-' ? 28 : 12;
        return (
          <path
            key={idx}
            d={`M ${x} 34 L ${x + 4} ${34 - height} L ${x + 8} 34`}
            fill="none"
            stroke="#15803d"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};
