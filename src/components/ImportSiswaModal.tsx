import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Siswa, JenisKelamin } from '../types';
import { generateUid } from '../utils/storage';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  HelpCircle,
  RefreshCw,
  Users,
} from 'lucide-react';

interface ImportSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  sekolahId: string;
  sekolahNama: string;
  tingkatSekolah: string;
  onImportSuccess: (siswaList: Siswa[], mode: 'append' | 'replace') => void;
}

interface ParsedStudentRow {
  nama: string;
  kelas: string;
  nis: string;
  jenisKelamin: JenisKelamin;
  regu: string;
  jabatan: string;
  isValid: boolean;
  errors: string[];
}

export const ImportSiswaModal: React.FC<ImportSiswaModalProps> = ({
  isOpen,
  onClose,
  sekolahId,
  sekolahNama,
  tingkatSekolah,
  onImportSuccess,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'paste'>('upload');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [pasteText, setPasteText] = useState<string>('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Clean and normalize column names
  const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '');

  const parseRowObject = (raw: Record<string, any>, idx: number): ParsedStudentRow => {
    let nama = '';
    let kelas = '';
    let nis = '';
    let jkRaw = '';
    let regu = '';
    let jabatan = 'Anggota';

    Object.entries(raw).forEach(([rawKey, val]) => {
      const key = normalizeHeader(rawKey);
      const strVal = String(val ?? '').trim();

      if (key.includes('nama') || key === 'name' || key === 'namasiswa' || key === 'namalengkap') {
        nama = strVal;
      } else if (key.includes('kelas') || key === 'rombel' || key === 'tingkat') {
        kelas = strVal;
      } else if (key.includes('nis') || key.includes('nta') || key.includes('induk') || key === 'noinduk') {
        nis = strVal;
      } else if (key.includes('jk') || key.includes('kelamin') || key === 'jeniskelamin' || key === 'lp') {
        jkRaw = strVal;
      } else if (key.includes('regu') || key.includes('barung') || key.includes('sangga') || key.includes('kelompok')) {
        regu = strVal;
      } else if (key.includes('jabatan') || key.includes('posisi') || key.includes('role')) {
        jabatan = strVal;
      }
    });

    // Default fallbacks if header wasn't standard
    const errors: string[] = [];
    if (!nama) {
      errors.push('Nama wajib diisi');
    }

    // Gender normalize
    let jenisKelamin: JenisKelamin = 'L';
    const jkLower = jkRaw.toLowerCase();
    if (jkLower.startsWith('p') || jkLower.includes('wanita') || jkLower.includes('perempuan')) {
      jenisKelamin = 'P';
    } else {
      jenisKelamin = 'L';
    }

    if (!kelas) {
      kelas = tingkatSekolah === 'SD' ? 'IV' : tingkatSekolah === 'SMP' ? 'VII' : 'X';
    }

    if (!regu) {
      regu = tingkatSekolah === 'SD'
        ? (jenisKelamin === 'P' ? 'Barung Kuning' : 'Barung Merah')
        : (jenisKelamin === 'P' ? 'Regu Melati' : 'Regu Rajawali');
    }

    if (!nis) {
      nis = String(Date.now()).slice(-6) + (idx + 1);
    }

    return {
      nama,
      kelas,
      nis,
      jenisKelamin,
      regu,
      jabatan: jabatan || 'Anggota',
      isValid: errors.length === 0,
      errors,
    };
  };

  // Handle Excel or CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse JSON with headers
        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (rawRows.length === 0) {
          setErrorMessage('Berkas Excel/CSV tidak memiliki baris data!');
          setParsedRows([]);
          return;
        }

        const parsed = rawRows.map((r, i) => parseRowObject(r, i));
        setParsedRows(parsed);
      } catch (err: any) {
        setErrorMessage(`Gagal membaca berkas: ${err.message || 'Format tidak didukung'}`);
        setParsedRows([]);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Terjadi kesalahan saat membaca file');
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle direct Copy-Paste parsing
  const handleParsePasteText = () => {
    if (!pasteText.trim()) {
      setParsedRows([]);
      setErrorMessage('Silakan tempel teks data terlebih dahulu');
      return;
    }

    setErrorMessage('');
    const lines = pasteText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    // Check if first line looks like headers
    const firstLineLower = lines[0].toLowerCase();
    const hasHeader =
      firstLineLower.includes('nama') ||
      firstLineLower.includes('kelas') ||
      firstLineLower.includes('nis');

    const dataLines = hasHeader ? lines.slice(1) : lines;

    const parsed: ParsedStudentRow[] = dataLines.map((line, idx) => {
      // Split by Tab (copied from Excel) or Comma or Semicolon
      const sep = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
      const parts = line.split(sep).map((p) => p.trim());

      const nama = parts[0] || '';
      const kelas = parts[1] || (tingkatSekolah === 'SD' ? 'IV-A' : 'VII-A');
      const nis = parts[2] || String(Date.now()).slice(-6) + (idx + 1);
      const jkRaw = parts[3] || 'L';
      const regu = parts[4] || (tingkatSekolah === 'SD' ? 'Barung Merah' : 'Regu Elang');
      const jabatan = parts[5] || 'Anggota';

      const jk: JenisKelamin = jkRaw.toLowerCase().startsWith('p') ? 'P' : 'L';
      const errors: string[] = [];
      if (!nama) errors.push('Nama kosong');

      return {
        nama,
        kelas,
        nis,
        jenisKelamin: jk,
        regu,
        jabatan,
        isValid: errors.length === 0,
        errors,
      };
    });

    setParsedRows(parsed);
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = (type: 'xlsx' | 'csv') => {
    const templateData = [
      {
        'Nama Siswa': 'Muhammad Rizky Pratama',
        'Kelas': tingkatSekolah === 'SD' ? 'V-A' : tingkatSekolah === 'SMP' ? 'VIII-B' : 'XI-IPA 1',
        'NIS': '20260101',
        'Jenis Kelamin': 'L',
        'Regu': tingkatSekolah === 'SD' ? 'Barung Merah' : 'Regu Rajawali',
        'Jabatan': 'Pemimpin Regu (Pinru)',
      },
      {
        'Nama Siswa': 'Siti Nur Aisyah',
        'Kelas': tingkatSekolah === 'SD' ? 'V-A' : tingkatSekolah === 'SMP' ? 'VIII-A' : 'XI-IPS 2',
        'NIS': '20260102',
        'Jenis Kelamin': 'P',
        'Regu': tingkatSekolah === 'SD' ? 'Barung Kuning' : 'Regu Melati',
        'Jabatan': 'Anggota',
      },
      {
        'Nama Siswa': 'Fadhil Ardiansyah',
        'Kelas': tingkatSekolah === 'SD' ? 'V-B' : tingkatSekolah === 'SMP' ? 'VIII-B' : 'XI-IPA 2',
        'NIS': '20260103',
        'Jenis Kelamin': 'L',
        'Regu': tingkatSekolah === 'SD' ? 'Barung Hijau' : 'Regu Garuda',
        'Jabatan': 'Wakil Pinru',
      },
      {
        'Nama Siswa': 'Zahra Anindita Putri',
        'Kelas': tingkatSekolah === 'SD' ? 'IV-C' : tingkatSekolah === 'SMP' ? 'VII-C' : 'X-MIPA 1',
        'NIS': '20260104',
        'Jenis Kelamin': 'P',
        'Regu': tingkatSekolah === 'SD' ? 'Barung Biru' : 'Regu Mawar',
        'Jabatan': 'Anggota',
      },
      {
        'Nama Siswa': 'Bima Satria Wicaksana',
        'Kelas': tingkatSekolah === 'SD' ? 'IV-A' : tingkatSekolah === 'SMP' ? 'VII-A' : 'X-MIPA 2',
        'NIS': '20260105',
        'Jenis Kelamin': 'L',
        'Regu': tingkatSekolah === 'SD' ? 'Barung Merah' : 'Regu Harimau',
        'Jabatan': 'Anggota',
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 30 }, // Nama
      { wch: 14 }, // Kelas
      { wch: 16 }, // NIS
      { wch: 16 }, // JK
      { wch: 20 }, // Regu
      { wch: 24 }, // Jabatan
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');

    if (type === 'xlsx') {
      XLSX.writeFile(wb, `Template_Import_Siswa_Pramuka_${tingkatSekolah}.xlsx`);
    } else {
      XLSX.writeFile(wb, `Template_Import_Siswa_Pramuka_${tingkatSekolah}.csv`);
    }
  };

  // Submit and commit valid rows to the app state
  const handleCommitImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid && r.nama.trim().length > 0);
    if (validRows.length === 0) {
      setErrorMessage('Tidak ada data anggota siswa yang valid untuk diimpor.');
      return;
    }

    const siswaEntities: Siswa[] = validRows.map((r) => ({
      id: generateUid('sis_imp'),
      sekolahId,
      nama: r.nama.trim(),
      kelas: r.kelas.trim(),
      nis: r.nis.trim(),
      jenisKelamin: r.jenisKelamin,
      regu: r.regu.trim(),
      jabatan: r.jabatan.trim() || 'Anggota',
    }));

    onImportSuccess(siswaEntities, importMode);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">Import Data Siswa / Anggota Pramuka</h3>
              <p className="text-xs text-slate-400">
                Pangkalan: <span className="text-white font-medium">{sekolahNama}</span> ({tingkatSekolah})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm text-slate-700">
          {/* Template Download Banner */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-700" />
                Unduh Format Template Siap Pakai
              </h4>
              <p className="text-[11px] sm:text-xs text-emerald-800 mt-0.5">
                Gunakan template standar agar kolom Nama, Kelas, NIS, JK, Regu, dan Jabatan terisi otomatis.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDownloadTemplate('xlsx')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-white border border-emerald-300 hover:bg-emerald-100 rounded-lg shadow-2xs cursor-pointer transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                Template Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => handleDownloadTemplate('csv')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs cursor-pointer transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Template CSV
              </button>
            </div>
          </div>

          {/* Input Method Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveInputTab('upload')}
              className={`pb-2.5 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${
                activeInputTab === 'upload'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              1. Unggah Berkas Excel / CSV
            </button>
            <button
              onClick={() => setActiveInputTab('paste')}
              className={`pb-2.5 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${
                activeInputTab === 'paste'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              2. Tempel Teks (Copy-Paste dari Excel)
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeInputTab === 'upload' && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-slate-50 hover:bg-emerald-50/40"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-800 text-sm">
                  {fileName ? `Berkas Terpilih: ${fileName}` : 'Klik untuk memilih berkas Excel atau CSV'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV (.csv)
                </p>
                {fileName && (
                  <span className="inline-block mt-3 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-md">
                    Ganti Berkas
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Paste from Clipboard */}
          {activeInputTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Salin (Ctrl+C) kolom tabel dari Excel, lalu tempel (Ctrl+V) di bawah ini:
                </label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Contoh baris tabel yang disalin dari Excel:\nMuhammad Rizky\tV-A\t202601\tL\tBarung Merah\tPinru\nSiti Nur Aisyah\tV-A\t202602\tP\tBarung Kuning\tAnggota\nFadhil Ardiansyah\tV-B\t202603\tL\tBarung Hijau\tWapinru`}
                  rows={6}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 focus:border-emerald-600 bg-slate-50"
                />
              </div>
              <button
                type="button"
                onClick={handleParsePasteText}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg cursor-pointer transition-all"
              >
                Proses & Periksa Teks
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview Table if rows exist */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-800 text-sm">Pratinjau Data yang Terdeteksi</h4>
                  <span className="px-2 py-0.5 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-full">
                    {validCount} Siswa Valid
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold text-rose-800 bg-rose-100 rounded-full">
                      {invalidCount} Baris Tidak Lengkap
                    </span>
                  )}
                </div>

                {/* Import Mode: Append vs Replace */}
                <div className="flex items-center gap-3 text-xs bg-slate-100 p-1.5 rounded-lg">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>Tambahkan ke data lama</span>
                  </label>
                  <span className="text-slate-300">|</span>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-rose-700">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-rose-600 focus:ring-rose-600"
                    />
                    <span>Gantikan semua siswa pangkalan ini</span>
                  </label>
                </div>
              </div>

              {/* Table */}
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 sticky top-0 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3">Nama Lengkap</th>
                      <th className="py-2.5 px-3">NIS</th>
                      <th className="py-2.5 px-3">JK</th>
                      <th className="py-2.5 px-3">Kelas</th>
                      <th className="py-2.5 px-3">Regu / Barung</th>
                      <th className="py-2.5 px-3">Jabatan</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedRows.map((r, idx) => (
                      <tr key={idx} className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">{r.nama}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{r.nis}</td>
                        <td className="py-2 px-3 font-semibold text-slate-700">{r.jenisKelamin}</td>
                        <td className="py-2 px-3 text-slate-700">{r.kelas}</td>
                        <td className="py-2 px-3 text-slate-700">{r.regu}</td>
                        <td className="py-2 px-3 text-emerald-800">{r.jabatan}</td>
                        <td className="py-2 px-3 text-center">
                          {r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Siap
                            </span>
                          ) : (
                            <span className="text-[11px] text-rose-600 font-medium">
                              {r.errors.join(', ')}
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
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 ? (
              <span>
                Total <strong className="text-slate-800">{validCount}</strong> siswa akan disimpan ke{' '}
                <strong>{sekolahNama}</strong>.
              </span>
            ) : (
              <span>Unggah berkas atau tempel teks untuk memulai pratinjau.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={validCount === 0}
              onClick={handleCommitImport}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm cursor-pointer transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Simpan & Import ({validCount} Siswa)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
