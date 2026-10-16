import React, { useState, useEffect, useMemo, useRef } from 'react';
import { KUIS_PRAMUKA_12, KuisSoal } from '../data/pramukaData';
import { scoutAudio } from '../utils/audioSynth';
import { ImportSoalModal } from './ImportSoalModal';
import {
  HelpCircle,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Bot,
  Settings,
  BookOpen,
  Award,
  Download,
  Upload,
  Flame,
  Check,
  X,
  RefreshCw,
  Search,
  BellRing,
  Music,
  Lightbulb,
  FileSpreadsheet,
} from 'lucide-react';

const STORAGE_KEY = 'pramukahub_custom_quiz_questions';

const PRESET_TOPICS = [
  'Sejarah Baden-Powell & HB IX',
  'Dasa Darma & Tri Satya',
  'Sandi Morse & Senter Sinyal',
  'Sandi Semaphore & Bendera',
  'Tali-Temali & Pionering Lapangan',
  'Kompas Bidik & Menaksir',
  'Pertolongan Pertama (P3K)',
  'Tata Adat Perkemahan & Tenda',
  'SKU Penggalang Ramu & Rakit',
  'Makna Lambang Tunas Kelapa',
];

export const QuizTab: React.FC = () => {
  // Active View Mode inside Quiz Module
  const [viewMode, setViewMode] = useState<'main' | 'kelola' | 'buat_ai'>('main');

  // Question Bank State with LocalStorage Persistence
  const [questions, setQuestions] = useState<KuisSoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load custom questions', e);
    }
    return KUIS_PRAMUKA_12;
  });

  // Sound settings
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Quiz Game State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [lastResultFeedback, setLastResultFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Search filter for question management
  const [searchQuery, setSearchQuery] = useState('');

  // Edit / Add Modal State
  const [editingQuestion, setEditingQuestion] = useState<KuisSoal | null>(null);
  const [formPertanyaan, setFormPertanyaan] = useState('');
  const [formPilihan, setFormPilihan] = useState(['', '', '', '']);
  const [formKunci, setFormKunci] = useState(0);
  const [formPenjelasan, setFormPenjelasan] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // AI Generator State
  const [aiTopic, setAiTopic] = useState('Sejarah Kepanduan & Baden-Powell');
  const [aiGolongan, setAiGolongan] = useState<'Siaga' | 'Penggalang' | 'Penegak'>('Penggalang');
  const [aiDifficulty, setAiDifficulty] = useState<'Mudah' | 'Sedang' | 'Sulit'>('Sedang');
  const [aiCount, setAiCount] = useState(5);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generatedAiQuestions, setGeneratedAiQuestions] = useState<KuisSoal[]>([]);

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save questions to localStorage whenever questions change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    } catch (e) {
      console.warn('Failed to save questions', e);
    }
  }, [questions]);

  // Current Question in quiz play
  const currentQ: KuisSoal | undefined = questions[currentIdx] || questions[0];

  // Sound testing handlers
  const handleTestCorrectSound = () => {
    scoutAudio.playCorrectSound();
  };

  const handleTestWrongSound = () => {
    scoutAudio.playWrongSound();
  };

  // Answer Submission with Real Sound Effects
  const handleSelectOption = (optIdx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted || !currentQ) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.kunci;
    if (isCorrect) {
      setScore((prev) => prev + 10);
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > highestStreak) setHighestStreak(next);
        return next;
      });
      setLastResultFeedback('correct');

      // Play Benar Sound Effect
      if (isSoundEnabled) {
        scoutAudio.playCorrectSound();
      }
    } else {
      setStreak(0);
      setLastResultFeedback('wrong');

      // Play Salah Sound Effect
      if (isSoundEnabled) {
        scoutAudio.playWrongSound();
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setLastResultFeedback(null);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setIsQuizCompleted(false);
    setLastResultFeedback(null);
  };

  // CRUD Operations
  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormPertanyaan('');
    setFormPilihan(['', '', '', '']);
    setFormKunci(0);
    setFormPenjelasan('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: KuisSoal) => {
    setEditingQuestion(q);
    setFormPertanyaan(q.pertanyaan);
    setFormPilihan([...q.pilihan]);
    setFormKunci(q.kunci);
    setFormPenjelasan(q.penjelasan);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPertanyaan.trim() || formPilihan.some((p) => !p.trim())) return;

    if (editingQuestion) {
      // Update existing
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                pertanyaan: formPertanyaan,
                pilihan: [...formPilihan],
                kunci: formKunci,
                penjelasan: formPenjelasan,
              }
            : q
        )
      );
      // Also update in generated list if editing from AI preview
      setGeneratedAiQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                pertanyaan: formPertanyaan,
                pilihan: [...formPilihan],
                kunci: formKunci,
                penjelasan: formPenjelasan,
              }
            : q
        )
      );
    } else {
      // Create new
      const newQ: KuisSoal = {
        id: Date.now(),
        pertanyaan: formPertanyaan,
        pilihan: [...formPilihan],
        kunci: formKunci,
        penjelasan: formPenjelasan || 'Pembahasan butir soal materi kepramukaan.',
      };
      setQuestions((prev) => [...prev, newQ]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteQuestion = (id: number) => {
    if (questions.length <= 1) {
      alert('Minimal harus ada 1 butir soal dalam kuis.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus butir soal ini?')) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (currentIdx >= questions.length - 1) {
        setCurrentIdx(0);
      }
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan bank soal ke 12 butir soal standar bawaan? Perubahan manual akan digantikan.')) {
      setQuestions(KUIS_PRAMUKA_12);
      handleRestartQuiz();
    }
  };

  // Export questions to JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `PramukaHub_BankSoal_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import questions from JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].pertanyaan && parsed[0].pilihan) {
          setQuestions(parsed);
          alert(`Berhasil mengimpor ${parsed.length} butir soal ke Bank Soal!`);
          handleRestartQuiz();
        } else {
          alert('Format file JSON tidak sesuai struktur butir soal.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle success from Excel import modal
  const handleImportExcelSuccess = (newQuestions: KuisSoal[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setQuestions(newQuestions);
      alert(`Berhasil menggantikan seluruh bank soal dengan ${newQuestions.length} butir soal dari Excel!`);
    } else {
      setQuestions((prev) => [...prev, ...newQuestions]);
      alert(`Berhasil menambahkan ${newQuestions.length} butir soal dari Excel ke Bank Soal! Total: ${questions.length + newQuestions.length} butir.`);
    }
    handleRestartQuiz();
  };

  // AI Quiz Generation via Server-Side Proxy / Fallback
  const handleGenerateWithAi = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    setGeneratedAiQuestions([]);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          golongan: aiGolongan,
          difficulty: aiDifficulty,
          count: aiCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses soal kuis');
      }

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        const formatted: KuisSoal[] = data.questions.map((q: any, i: number) => ({
          id: Date.now() + i,
          pertanyaan: q.pertanyaan,
          pilihan: q.pilihan || ['A', 'B', 'C', 'D'],
          kunci: typeof q.kunci === 'number' ? q.kunci : 0,
          penjelasan: q.penjelasan || 'Pembahasan butir soal kuis kepramukaan.',
        }));
        setGeneratedAiQuestions(formatted);
      } else {
        throw new Error('Format respon AI tidak valid');
      }
    } catch (err: any) {
      console.warn('AI Generation Endpoint Error:', err);
      // Smart Fallback questions generator
      const fallbackGenerated: KuisSoal[] = [
        {
          id: Date.now(),
          pertanyaan: `[AI Generator] Dalam kegiatan kepramukaan dengan tema "${aiTopic}", apa fungsi utama dari prinsip Leave No Trace?`,
          pilihan: [
            'Tidak merusak vegetasi alam dan membawa pulang seluruh sampah',
            'Menebang pohon sembarangan untuk kayu bakar api unggun',
            'Membuat api unggun dekat dengan tenda tidur perkemahan',
            'Mengabaikan kebersihan sumber air perkemahan',
          ],
          kunci: 0,
          penjelasan: 'Prinsip Leave No Trace mengajarkan setiap pandu untuk menjaga kelestarian alam dan tidak meninggalkan jejak sampah apa pun.',
        },
        {
          id: Date.now() + 1,
          pertanyaan: `[AI Generator] Sikap patriotisme, sopan santun, dan jiwa kesatria seorang Pramuka Indonesia tertuang secara eksplisit pada Dasa Darma ke berapa?`,
          pilihan: ['Dasa Darma ke-1', 'Dasa Darma ke-3', 'Dasa Darma ke-7', 'Dasa Darma ke-9'],
          kunci: 1,
          penjelasan: 'Dasa Darma ke-3 berbunyi: "Patriot yang sopan dan kesatria".',
        },
        {
          id: Date.now() + 2,
          pertanyaan: `[AI Generator] Pada materi navigasi kompas bidik, apabila pembacaan sudut sasaran bidik adalah 135°, maka berapakah nilai sasaran balik (Back-Azimut)?`,
          pilihan: ['45°', '225°', '315°', '180°'],
          kunci: 2,
          penjelasan: 'Karena sudut sasaran < 180°, rumus Back-Azimut adalah: 135° + 180° = 315°.',
        },
        {
          id: Date.now() + 3,
          pertanyaan: `[AI Generator] Untuk membuat tandu darurat (dragbar) P3K di perkemahan, simpul apa yang paling tepat digunakan untuk mengikat palang ke tongkat utama?`,
          pilihan: ['Simpul Hidup', 'Simpul Jangkar dan Ikatan Palang', 'Simpul Pangkal dan Simpul Mati', 'Simpul Kembar'],
          kunci: 1,
          penjelasan: 'Simpul jangkar digunakan untuk anyaman tali tandu, sedangkan ikatan palang mengikat sambungan tongkat secara kokoh.',
        },
      ];
      setGeneratedAiQuestions(fallbackGenerated.slice(0, aiCount));
      setAiError(
        `${err.message || 'Server AI tidak merespon'}. Ditampilkan contoh butir soal cerdas cermat otomatis yang siap Anda tinjau, edit, atau masukkan ke bank soal.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleApplyAiQuestions = (mode: 'append' | 'replace') => {
    if (generatedAiQuestions.length === 0) return;
    if (mode === 'replace') {
      if (confirm(`Gantikan seluruh bank soal (${questions.length} butir) dengan ${generatedAiQuestions.length} butir soal AI baru?`)) {
        setQuestions(generatedAiQuestions);
        alert(`Bank soal berhasil diganti dengan ${generatedAiQuestions.length} butir soal baru!`);
        setGeneratedAiQuestions([]);
        setViewMode('main');
        handleRestartQuiz();
      }
    } else {
      setQuestions((prev) => [...prev, ...generatedAiQuestions]);
      alert(`${generatedAiQuestions.length} butir soal baru berhasil ditambahkan ke Bank Soal! Total: ${questions.length + generatedAiQuestions.length} butir.`);
      setGeneratedAiQuestions([]);
      setViewMode('main');
      handleRestartQuiz();
    }
  };

  // Filtered questions for management
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const q = searchQuery.toLowerCase();
    return questions.filter(
      (item) =>
        item.pertanyaan.toLowerCase().includes(q) ||
        item.pilihan.some((p) => p.toLowerCase().includes(q)) ||
        item.penjelasan.toLowerCase().includes(q)
    );
  }, [questions, searchQuery]);

  // Badge award evaluation
  const badgeAward = useMemo(() => {
    const totalPossible = questions.length * 10;
    const ratio = totalPossible > 0 ? score / totalPossible : 0;

    if (ratio >= 0.9) {
      return {
        badge: '🌟 Lencana Pramuka Garuda',
        status: 'Istimewa / Master Kepanduan',
        desc: 'Hebat sekali! Pemahaman kepanduan Anda sempurna dengan akurasi sangat tinggi.',
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-300',
      };
    } else if (ratio >= 0.75) {
      return {
        badge: '🎖️ Lencana Teladan Utama',
        status: 'Sangat Baik',
        desc: 'Pemahaman kepramukaan sangat tinggi dan siap menjadi teladan regu!',
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300',
      };
    } else if (ratio >= 0.5) {
      return {
        badge: '🥈 Lencana Penggalang Terap',
        status: 'Cukup Baik',
        desc: 'Menguasai sebagian besar materi teknik kepanduan dengan baik.',
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-300',
      };
    } else {
      return {
        badge: '🥉 Lencana Penggalang Ramu',
        status: 'Perlu Belajar Lagi',
        desc: 'Terus giat berlatih dan membaca buku panduan kepramukaan!',
        color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-300',
      };
    }
  }, [score, questions.length]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-rose-700 via-pink-800 to-amber-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/60 backdrop-blur-md text-rose-200 text-xs font-semibold border border-rose-500/40">
            <Sparkles className="w-3.5 h-3.5 text-rose-300" />
            <span>Kuis Cerdas Cermat Interaktif dengan Audio Benar/Salah &amp; Generator AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Quiz &amp; Cerdas Cermat Pramuka
          </h1>
          <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
            Asah pengetahuan kepanduan dengan bunyi nada benar (chime) &amp; nada salah (buzz) Web Audio API. Soal dapat dikelola dan diedit secara bebas, atau diracik otomatis dengan bantuan AI!
          </p>
        </div>
        <div className="absolute -right-6 -bottom-10 opacity-10 pointer-events-none select-none text-[200px] font-bold">
          ⚜
        </div>
      </div>

      {/* Navigation Subtabs & Sound Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-2xs">
          <button
            onClick={() => setViewMode('main')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              viewMode === 'main'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Mulai Main Kuis ({questions.length} Soal)</span>
          </button>
          <button
            onClick={() => setViewMode('buat_ai')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              viewMode === 'buat_ai'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-500" />
            <span>Buat Soal dengan AI</span>
          </button>
          <button
            onClick={() => setViewMode('kelola')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              viewMode === 'kelola'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Kelola &amp; Edit Bank Soal</span>
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 shadow-2xs"
            title="Import butir soal kuis dari berkas Excel (.xlsx / .xls)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Import Excel</span>
          </button>
        </div>

        {/* Audio Sound Effects Controls & Sound Test Buttons */}
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
            Uji Suara:
          </span>

          {/* Test Correct Sound */}
          <button
            type="button"
            onClick={handleTestCorrectSound}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Klik untuk mendengarkan bunyi tanda Benar (Chime Ding)"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tes Benar (Ding!)</span>
          </button>

          {/* Test Wrong Sound */}
          <button
            type="button"
            onClick={handleTestWrongSound}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Klik untuk mendengarkan bunyi tanda Salah (Buzzer Buzz)"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Tes Salah (Buzz!)</span>
          </button>

          {/* Mute/Unmute Switch */}
          <button
            type="button"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isSoundEnabled
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
            }`}
            title={isSoundEnabled ? 'Suara Bunyi Aktif Saat Menjawab' : 'Suara Dimatikan'}
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isSoundEnabled ? 'Audio: ON' : 'Audio: OFF'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. TAMPILAN PERMAINAN KUIS UTAMA */}
      {/* ============================================================== */}
      {viewMode === 'main' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          {!isQuizCompleted ? (
            <>
              {/* Question Header & Score/Streak */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      Soal #{currentIdx + 1} dari {questions.length}
                    </span>
                    {streak > 1 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 animate-bounce">
                        <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {streak}x Benar Beruntun!
                      </span>
                    )}
                  </div>
                  <div className="w-48 sm:w-64 bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-rose-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentIdx + 1) / questions.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center min-w-20">
                    <span className="text-[10px] text-slate-400 block font-sans">Skor</span>
                    <strong className="text-base text-rose-600">{score} Poin</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center min-w-20">
                    <span className="text-[10px] text-slate-400 block font-sans">Akurasi</span>
                    <strong className="text-base text-emerald-600">
                      {currentIdx > 0 ? Math.round((correctCount / currentIdx) * 100) : 100}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ?.pertanyaan}
                </h3>

                {/* Multiple Choice Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ?.pilihan.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQ.kunci;
                    let style =
                      'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200';

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        style =
                          'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400/40';
                      } else if (isSelected && !isCorrect) {
                        style =
                          'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 ring-2 ring-rose-400/40';
                      }
                    } else if (isSelected) {
                      style =
                        'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/40';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`p-4 rounded-2xl border text-left font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-3 shadow-2xs ${style}`}
                      >
                        <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-mono shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 leading-snug">{opt}</span>
                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Alert with Explanation */}
              {isAnswerSubmitted && (
                <div
                  className={`p-4 rounded-2xl border space-y-2 animate-in fade-in duration-150 ${
                    lastResultFeedback === 'correct'
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                    {lastResultFeedback === 'correct' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Jawaban Tepat! (+10 Poin) — Bunyi Chime Ding Berdering 🔔</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-600" />
                        <span>
                          Jawaban Belum Tepat — Bunyi Buzzer Berbunyi ❌. Kunci yang benar adalah opsi (
                          {String.fromCharCode(65 + (currentQ?.kunci ?? 0))})
                        </span>
                      </>
                    )}
                  </div>
                  {currentQ?.penjelasan && (
                    <p className="text-xs leading-relaxed opacity-90 pl-7">
                      <strong>Penjelasan / Pembahasan:</strong> {currentQ.penjelasan}
                    </p>
                  )}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleRestartQuiz}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Ulangi Dari Awal
                </button>

                {!isAnswerSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
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
                      {currentIdx < questions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}
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

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  Kuis Selesai!
                </span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  Skor: {score} / {questions.length * 10}
                </h3>
                <p className="text-xs text-slate-500">
                  Berhasil menjawab benar {correctCount} dari {questions.length} soal (Streak Terbaik: {highestStreak}x).
                </p>
              </div>

              {/* Award Badge Card */}
              <div className={`p-6 rounded-3xl border ${badgeAward.color} space-y-2`}>
                <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                  Hasil Predikat &amp; Lencana Kehormatan:
                </span>
                <h4 className="text-xl font-black">{badgeAward.badge}</h4>
                <span className="text-xs font-bold block">{badgeAward.status}</span>
                <p className="text-xs leading-relaxed opacity-90">{badgeAward.desc}</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRestartQuiz}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Mainkan Lagi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('kelola')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  <span>Edit Soal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('buat_ai')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm border border-rose-300 dark:border-rose-700 cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Buat Soal AI</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. BUAT SOAL DENGAN AI (GENERATOR OTOMATIS) */}
      {/* ============================================================== */}
      {viewMode === 'buat_ai' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-500" />
              Generator Soal Kuis Otomatis Berbasis AI
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Hasilkan butir soal kuis cerdas cermat baru secara instan berdasarkan topik materi dan tingkatan golongan kepramukaan. Anda dapat meninjau dan mengedit soal sebelum dimasukkan ke bank soal.
            </p>
          </div>

          {/* Quick Topic Preset Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Pilih Topik Populer atau Ketik Sendiri:</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TOPICS.map((topic, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAiTopic(topic)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    aiTopic === topic
                      ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Generator Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Topik / Materi Kuis:
              </label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Contoh: Sandi Morse, Tali Temali, P3K, Baden Powell"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tingkat Golongan:
              </label>
              <select
                value={aiGolongan}
                onChange={(e) => setAiGolongan(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Siaga">Siaga (7–10 tahun)</option>
                <option value="Penggalang">Penggalang (11–15 tahun)</option>
                <option value="Penegak">Penegak (16–20 tahun)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tingkat Kesulitan:
              </label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Mudah">Mudah (Dasar)</option>
                <option value="Sedang">Sedang (Standar)</option>
                <option value="Sulit">Sulit (Menantang)</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Jumlah Butir Soal:
              </label>
              <select
                value={aiCount}
                onChange={(e) => setAiCount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value={3}>3 Butir Soal</option>
                <option value={5}>5 Butir Soal</option>
                <option value={10}>10 Butir Soal</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateWithAi}
              disabled={isGeneratingAi}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGeneratingAi ? 'Sedang Meracik Soal AI...' : 'Generate Soal dengan AI'}</span>
            </button>
          </div>

          {aiError && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <strong>Info Generator:</strong>
              <p>{aiError}</p>
            </div>
          )}

          {/* Generated Questions Preview */}
          {generatedAiQuestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Pratinjau {generatedAiQuestions.length} Soal Hasil AI (Bisa Diedit):
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyAiQuestions('append')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    title="Tambahkan soal baru ke bank soal tanpa menghapus yang lama"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambahkan ke Bank Soal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyAiQuestions('replace')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    title="Gantikan seluruh isi bank soal dengan soal AI ini"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Gantikan Seluruh Soal</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {generatedAiQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {idx + 1}. {q.pertanyaan}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(q)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:text-rose-600 cursor-pointer shrink-0"
                        title="Edit soal ini sebelum disimpan"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.pilihan.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          className={`p-2 rounded-lg border text-xs ${
                            pIdx === q.kunci
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 font-bold text-emerald-800 dark:text-emerald-300'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {String.fromCharCode(65 + pIdx)}. {p} {pIdx === q.kunci && '✓ (Kunci)'}
                        </div>
                      ))}
                    </div>

                    {q.penjelasan && (
                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <strong>Pembahasan:</strong> {q.penjelasan}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. KELOLA & EDIT BANK SOAL (CRUD LENGKAP) */}
      {/* ============================================================== */}
      {viewMode === 'kelola' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-rose-600" />
                Kelola &amp; Edit Bank Soal Kuis ({questions.length} Butir)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ubah teks pertanyaan, tentukan kunci jawaban, hapus butir, ekspor/impor JSON, atau tambahkan butir baru buatan sendiri.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportJson}
                accept=".json"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                title="Unggah berkas Excel (.xlsx / .xls) untuk menambahkan soal massal"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Import Excel</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Impor Bank Soal dari file JSON"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Impor JSON</span>
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Unduh seluruh bank soal ke file JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor JSON</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                title="Pulihkan ke 12 Soal Bawaan"
              >
                Reset Default
              </button>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Soal Manual</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari butir soal berdasarkan pertanyaan atau pembahasan..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          {/* Question List Table / Cards */}
          <div className="space-y-3">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {q.pertanyaan}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 pl-8 space-y-0.5">
                      <div>
                        Kunci Jawaban:{' '}
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          ({String.fromCharCode(65 + q.kunci)}) {q.pilihan[q.kunci]}
                        </strong>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {q.pilihan.map((p, pIdx) => (
                          <span
                            key={pIdx}
                            className={`px-2 py-0.5 rounded-md text-[11px] border ${
                              pIdx === q.kunci
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-300 font-bold'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {String.fromCharCode(65 + pIdx)}: {p}
                          </span>
                        ))}
                      </div>
                      {q.penjelasan && (
                        <div className="italic text-[11px] opacity-80 pt-1">
                          <strong>Pembahasan:</strong> {q.penjelasan}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pl-8 sm:pl-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(q)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                      title="Edit Butir Soal Ini"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Hapus Butir Soal Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                Tidak ada butir soal yang sesuai dengan pencarian "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL FORM TAMBAH / EDIT SOAL */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-rose-600" />
                <span>{editingQuestion ? 'Edit Butir Soal Kuis' : 'Tambah Butir Soal Baru'}</span>
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kalimat Pertanyaan:
                </label>
                <textarea
                  value={formPertanyaan}
                  onChange={(e) => setFormPertanyaan(e.target.value)}
                  placeholder="Ketik kalimat pertanyaan kuis..."
                  required
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* 4 Choices */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  4 Pilihan Jawaban &amp; Pilih Kunci yang Benar:
                </label>
                {formPilihan.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={`kunciRadio_${idx}`}
                      name="kunciJawaban"
                      checked={formKunci === idx}
                      onChange={() => setFormKunci(idx)}
                      className="accent-emerald-600 cursor-pointer w-4 h-4"
                      title="Tandai sebagai kunci jawaban benar"
                    />
                    <label
                      htmlFor={`kunciRadio_${idx}`}
                      className="text-xs font-mono font-bold w-4 cursor-pointer"
                    >
                      {String.fromCharCode(65 + idx)}.
                    </label>
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => {
                        const copy = [...formPilihan];
                        copy[idx] = e.target.value;
                        setFormPilihan(copy);
                      }}
                      placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                      required
                      className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                ))}
                <span className="text-[11px] text-slate-400 block italic">
                  * Klik lingkaran radio di sebelah kiri untuk menandai pilihan mana yang merupakan kunci jawaban yang benar.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Penjelasan / Pembahasan Jawaban:
                </label>
                <textarea
                  value={formPenjelasan}
                  onChange={(e) => setFormPenjelasan(e.target.value)}
                  placeholder="Ulasan edukatif mengapa pilihan tersebut benar..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL IMPORT SOAL DARI EXCEL */}
      {/* ============================================================== */}
      <ImportSoalModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportExcelSuccess}
        currentQuestionCount={questions.length}
      />
    </div>
  );
};
