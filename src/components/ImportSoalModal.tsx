import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { KuisSoal } from '../data/pramukaData';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  HelpCircle,
  RefreshCw,
  Plus,
  Table,
  Check,
} from 'lucide-react';

interface ImportSoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (questions: KuisSoal[], mode: 'append' | 'replace') => void;
  currentQuestionCount: number;
}

interface ParsedQuizRow {
  no: number;
  pertanyaan: string;
  pilihan: string[];
  kunci: number; // 0, 1, 2, 3
  penjelasan: string;
  isValid: boolean;
  errors: string[];
}

export const ImportSoalModal: React.FC<ImportSoalModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  currentQuestionCount,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedQuizRow[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Header normalizer (remove whitespace, lowercase, alphanumeric only)
  const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Parse a single raw row object from Excel/JSON
  const parseRowObject = (raw: Record<string, any>, idx: number): ParsedQuizRow => {
    let pertanyaan = '';
    let pilA = '';
    let pilB = '';
    let pilC = '';
    let pilD = '';
    let rawKunci = '';
    let penjelasan = '';
    const errors: string[] = [];

    // Find columns by normalized name
    Object.keys(raw).forEach((origKey) => {
      const key = normalizeHeader(origKey);
      const val = raw[origKey] !== undefined && raw[origKey] !== null ? String(raw[origKey]).trim() : '';

      if (key.includes('pertanyaan') || key.includes('soal') || key.includes('question')) {
        if (!pertanyaan) pertanyaan = val;
      } else if (
        key === 'pilihana' ||
        key === 'opsia' ||
        key === 'a' ||
        key === 'opsi1' ||
        key === 'jawaban a' ||
        key.endsWith('pilihana')
      ) {
        if (!pilA) pilA = val;
      } else if (
        key === 'pilihanb' ||
        key === 'opsib' ||
        key === 'b' ||
        key === 'opsi2' ||
        key === 'jawaban b' ||
        key.endsWith('pilihanb')
      ) {
        if (!pilB) pilB = val;
      } else if (
        key === 'pilihanc' ||
        key === 'opsic' ||
        key === 'c' ||
        key === 'opsi3' ||
        key === 'jawaban c' ||
        key.endsWith('pilihanc')
      ) {
        if (!pilC) pilC = val;
      } else if (
        key === 'pilihand' ||
        key === 'opsid' ||
        key === 'd' ||
        key === 'opsi4' ||
        key === 'jawaban d' ||
        key.endsWith('pilihand')
      ) {
        if (!pilD) pilD = val;
      } else if (
        key.includes('kunci') ||
        key.includes('jawabanbenar') ||
        key.includes('answer') ||
        key.includes('key')
      ) {
        if (!rawKunci) rawKunci = val;
      } else if (
        key.includes('penjelasan') ||
        key.includes('pembahasan') ||
        key.includes('alasan') ||
        key.includes('explanation')
      ) {
        if (!penjelasan) penjelasan = val;
      }
    });

    // Validation
    if (!pertanyaan) {
      errors.push('Pertanyaan kosong');
    }
    if (!pilA || !pilB) {
      errors.push('Pilihan A atau B belum lengkap');
    }

    // Default missing choices if at least 2 exist
    const pilihan: string[] = [
      pilA || 'Opsi A',
      pilB || 'Opsi B',
      pilC || 'Opsi C',
      pilD || 'Opsi D',
    ];

    // Determine correct key index (0 to 3)
    let kunci = 0;
    const cleanKunci = rawKunci.trim().toUpperCase();

    if (cleanKunci === 'A' || cleanKunci === '1' || cleanKunci === '0') {
      kunci = 0;
    } else if (cleanKunci === 'B' || cleanKunci === '2') {
      kunci = 1;
    } else if (cleanKunci === 'C' || cleanKunci === '3') {
      kunci = 2;
    } else if (cleanKunci === 'D' || cleanKunci === '4') {
      kunci = 3;
    } else if (cleanKunci) {
      // Check if rawKunci matches text of one choice
      const matchIdx = pilihan.findIndex((p) => p.toLowerCase() === rawKunci.toLowerCase());
      if (matchIdx >= 0) {
        kunci = matchIdx;
      } else {
        errors.push(`Kunci "${rawKunci}" tidak dikenali (gunakan A, B, C, atau D)`);
      }
    } else {
      errors.push('Kunci jawaban belum diisi (otomatis diset ke A)');
    }

    return {
      no: idx + 1,
      pertanyaan,
      pilihan,
      kunci,
      penjelasan: penjelasan || 'Pembahasan materi butir soal kepramukaan.',
      isValid: errors.length === 0,
      errors,
    };
  };

  // Process Excel Workbook Buffer
  const processWorkbook = (workbook: XLSX.WorkBook) => {
    try {
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        setErrorMessage('File Excel tidak memiliki lembar (sheet).');
        return;
      }

      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      if (rawData.length === 0) {
        setErrorMessage('Lembar Excel kosong atau tidak ada data yang terbaca.');
        setParsedRows([]);
        return;
      }

      const rows = rawData.map((row, idx) => parseRowObject(row, idx));
      setParsedRows(rows);
      setErrorMessage('');
    } catch (err: any) {
      setErrorMessage(`Gagal memproses file Excel: ${err.message || 'Format tidak valid'}`);
      setParsedRows([]);
    }
  };

  // Handle file upload input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        processWorkbook(workbook);
      } catch (err: any) {
        setErrorMessage('Gagal membuka file Excel. Pastikan format .xlsx atau .xls valid.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        processWorkbook(workbook);
      } catch (err: any) {
        setErrorMessage('Gagal membuka file Excel.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Parse TSV/Text pasted from spreadsheet
  const handleParsePasteText = () => {
    if (!pasteText.trim()) {
      setErrorMessage('Silakan tempel teks tabel terlebih dahulu.');
      return;
    }

    try {
      const lines = pasteText.trim().split('\n');
      if (lines.length < 2) {
        setErrorMessage('Data yang ditempel harus memiliki baris judul dan minimal 1 baris soal.');
        return;
      }

      const header = lines[0].split('\t').map((h) => h.trim());
      const rawData: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split('\t');
        const obj: Record<string, string> = {};
        header.forEach((h, hIdx) => {
          obj[h] = cols[hIdx]?.trim() || '';
        });
        rawData.push(obj);
      }

      const rows = rawData.map((row, idx) => parseRowObject(row, idx));
      setParsedRows(rows);
      setFileName('Data Tempel Spreadsheet');
      setErrorMessage('');
    } catch (err: any) {
      setErrorMessage(`Gagal memproses data tempel: ${err.message}`);
    }
  };

  // Generate & Download Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        No: 1,
        'Pertanyaan Kuis': 'Siapakah nama Bapak Pandu Sedunia?',
        'Pilihan A': 'Lord Robert Baden-Powell',
        'Pilihan B': 'Sri Sultan Hamengkubuwono IX',
        'Pilihan C': 'Soenardjo Atmodipuro',
        'Pilihan D': 'William Smith',
        'Kunci Jawaban (A/B/C/D)': 'A',
        'Penjelasan / Pembahasan':
          'Lord Baden-Powell mendirikan gerakan kepanduan dunia pada tahun 1907 setelah perkemahan Brownsea Island.',
      },
      {
        No: 2,
        'Pertanyaan Kuis': 'Lambang Gerakan Pramuka Indonesia (Tunas Kelapa) diciptakan oleh...',
        'Pilihan A': 'W.R. Soepratman',
        'Pilihan B': 'Soenardjo Atmodipuro',
        'Pilihan C': 'Ki Hajar Dewantara',
        'Pilihan D': 'Sri Sultan Hamengkubuwono IX',
        'Kunci Jawaban (A/B/C/D)': 'B',
        'Penjelasan / Pembahasan':
          'Soenardjo Atmodipuro, pejabat Departemen Pertanian, menciptakan lambang Tunas Kelapa pada tahun 1961.',
      },
      {
        No: 3,
        'Pertanyaan Kuis': 'Simpul apakah yang digunakan untuk menyambung dua utas tali yang sama besar dalam keadaan kering?',
        'Pilihan A': 'Simpul Pangkal',
        'Pilihan B': 'Simpul Mati',
        'Pilihan C': 'Simpul Anyam',
        'Pilihan D': 'Simpul Tiang',
        'Kunci Jawaban (A/B/C/D)': 'B',
        'Penjelasan / Pembahasan':
          'Simpul mati (Reef Knot) digunakan untuk mengikat dua ujung tali berdiameter sama dalam kondisi kering.',
      },
      {
        No: 4,
        'Pertanyaan Kuis': 'Jika sasaran bidik kompas (Azimut) terbaca 240 derajat, berapakah nilai Back-Azimut (sasaran baliknya)?',
        'Pilihan A': '60 derajat',
        'Pilihan B': '420 derajat',
        'Pilihan C': '120 derajat',
        'Pilihan D': '300 derajat',
        'Kunci Jawaban (A/B/C/D)': 'A',
        'Penjelasan / Pembahasan':
          'Rumus sasaran balik jika sudut > 180°: 240° - 180° = 60°.',
      },
      {
        No: 5,
        'Pertanyaan Kuis': 'Berapakah panjang standar tongkat Pramuka penggalang yang digunakan dalam pionering dan menaksir?',
        'Pilihan A': '120 cm',
        'Pilihan B': '140 cm',
        'Pilihan C': '160 cm',
        'Pilihan D': '180 cm',
        'Kunci Jawaban (A/B/C/D)': 'C',
        'Penjelasan / Pembahasan':
          'Panjang standar tongkat Pramuka adalah 160 cm dengan diameter sekitar 3 cm.',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Auto column widths
    worksheet['!cols'] = [
      { wch: 6 }, // No
      { wch: 50 }, // Pertanyaan
      { wch: 30 }, // A
      { wch: 30 }, // B
      { wch: 30 }, // C
      { wch: 30 }, // D
      { wch: 25 }, // Kunci
      { wch: 60 }, // Penjelasan
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Soal Kuis');
    XLSX.writeFile(workbook, 'Template_Import_Soal_PramukaHub.xlsx');
  };

  // Submit and save questions
  const handleExecuteImport = () => {
    const validQuestions = parsedRows
      .filter((r) => r.isValid)
      .map((r, i) => ({
        id: Date.now() + i,
        pertanyaan: r.pertanyaan,
        pilihan: r.pilihan,
        kunci: r.kunci,
        penjelasan: r.penjelasan,
      }));

    if (validQuestions.length === 0) {
      alert('Tidak ada butir soal valid yang dapat diimpor.');
      return;
    }

    onImportSuccess(validQuestions, importMode);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Import Soal Kuis dari Excel (.xlsx)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unggah berkas spreadsheet untuk menambahkan butir soal cerdas cermat secara massal.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Action Ribbon: Download Template & Method Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                Format Kolom Excel yang Didukung:
              </span>
              <p className="text-[11px] text-emerald-800/90 dark:text-emerald-400 leading-relaxed">
                Kolom: <strong>Pertanyaan</strong>, <strong>Pilihan A</strong>, <strong>Pilihan B</strong>, <strong>Pilihan C</strong>, <strong>Pilihan D</strong>, <strong>Kunci Jawaban (A/B/C/D)</strong>, dan <strong>Penjelasan</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template Excel</span>
            </button>
          </div>

          {/* Subtabs: Upload File vs Paste Spreadsheet */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Unggah File (.xlsx / .xls / .csv)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'paste'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Tempel Teks Spreadsheet (Copy-Paste)</span>
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 mx-auto flex items-center justify-center mb-3 shadow-inner">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                {fileName ? `File terpilih: ${fileName}` : 'Klik untuk memilih file Excel atau seret ke sini'}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Format yang didukung: Microsoft Excel (.xlsx, .xls) atau CSV (.csv)
              </p>
            </div>
          )}

          {/* Tab 2: Paste Spreadsheet */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Salin baris tabel dari Excel / Google Spreadsheet lalu tempel di bawah ini:
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`Pertanyaan\tPilihan A\tPilihan B\tPilihan C\tPilihan D\tKunci Jawaban\tPenjelasan\nSiapa pencipta lambang Pramuka?\tKi Hajar\tSoenardjo Atmodipuro\tSudirman\tHabibie\tB\tSoenardjo Atmodipuro (1961)`}
                rows={5}
                className="w-full p-3 font-mono text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleParsePasteText}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Proses Teks Spreadsheet
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-slate-900 dark:text-white">
                    Hasil Analisis File: {parsedRows.length} Butir Soal
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px]">
                    ✓ {validCount} Siap Impor
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[11px]">
                      ⚠ {invalidCount} Perlu Perbaikan
                    </span>
                  )}
                </div>

                {/* Import Mode Radio */}
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="accent-rose-600"
                    />
                    <span>Tambahkan ke Bank Soal</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-rose-600"
                    />
                    <span>Gantikan Seluruh Soal Lama</span>
                  </label>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5 w-10 text-center">No</th>
                      <th className="p-2.5">Pertanyaan</th>
                      <th className="p-2.5">Pilihan Jawaban (A / B / C / D)</th>
                      <th className="p-2.5 w-24 text-center">Kunci</th>
                      <th className="p-2.5">Pembahasan</th>
                      <th className="p-2.5 w-20 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          row.isValid
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                            : 'bg-rose-50/40 dark:bg-rose-950/20'
                        }
                      >
                        <td className="p-2.5 text-center font-mono text-slate-400">{row.no}</td>
                        <td className="p-2.5 text-slate-900 dark:text-white font-semibold max-w-xs truncate">
                          {row.pertanyaan || <span className="text-rose-500 italic">Pertanyaan kosong</span>}
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-600 dark:text-slate-300 max-w-sm">
                          <div className="line-clamp-2">
                            A: {row.pilihan[0]} | B: {row.pilihan[1]} | C: {row.pilihan[2]} | D: {row.pilihan[3]}
                          </div>
                        </td>
                        <td className="p-2.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {String.fromCharCode(65 + row.kunci)}
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {row.penjelasan}
                        </td>
                        <td className="p-2.5 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold text-[10px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Valid
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-0.5 text-rose-600 font-bold text-[10px]"
                              title={row.errors.join(', ')}
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              Error
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {importMode === 'append' ? (
              <span>
                Mode Tambah: {validCount} soal baru akan ditambahkan ke {currentQuestionCount} butir yang sudah ada.
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                Mode Ganti: Seluruh {currentQuestionCount} soal lama akan dihapus dan digantikan {validCount} butir baru.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={validCount === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Impor {validCount} Soal Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
