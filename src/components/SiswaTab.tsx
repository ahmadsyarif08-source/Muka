import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Sekolah, Siswa, AbsensiMap, StatusAbsensi, JenisKelamin } from '../types';
import { formatTanggalIndo, generateUid } from '../utils/storage';
import { exportBukuIndukToWord } from '../utils/wordExport';
import { exportElementToPdf } from '../utils/pdfExport';
import { ImportSiswaModal } from './ImportSiswaModal';
import { InfoSiswaModal } from './InfoSiswaModal';
import { InfoStatistikSiswaModal } from './InfoStatistikSiswaModal';
import { MainModuleHeader } from './MainModuleHeader';
import {
  Users,
  Calendar,
  Check,
  Search,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Upload,
  FileText,
  Download,
  Info,
} from 'lucide-react';

interface SiswaTabProps {
  sekolah: Sekolah | undefined;
  daftarSekolah: Sekolah[];
  sekolahAktifId: string;
  onSelectSekolahAktif: (id: string) => void;
  siswaList: Siswa[];
  absensi: AbsensiMap;
  onUpdateAbsensi: (sekolahId: string, tanggal: string, siswaId: string, status: StatusAbsensi | null) => void;
  onBatchSetAbsensi: (sekolahId: string, tanggal: string, status: StatusAbsensi) => void;
  onAddSiswa: (siswa: Siswa) => void;
  onAddBatchSiswa: (siswaList: Siswa[]) => void;
  onReplaceSiswa?: (sekolahId: string, siswaList: Siswa[]) => void;
  onUpdateSiswa: (siswa: Siswa) => void;
  onDeleteSiswa: (id: string) => void;
  onSyncWithJurnal?: (tanggal: string, jumlahHadir: number) => void;
}

export const SiswaTab: React.FC<SiswaTabProps> = ({
  sekolah,
  daftarSekolah,
  sekolahAktifId,
  onSelectSekolahAktif,
  siswaList,
  absensi,
  onUpdateAbsensi,
  onBatchSetAbsensi,
  onAddSiswa,
  onAddBatchSiswa,
  onReplaceSiswa,
  onUpdateSiswa,
  onDeleteSiswa,
  onSyncWithJurnal,
}) => {
  const [subTab, setSubTab] = useState<'presensi' | 'buku_induk' | 'rekap'>('presensi');
  const [tanggal, setTanggal] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedInfoSiswa, setSelectedInfoSiswa] = useState<Siswa | null>(null);
  const [showStatsInfoModal, setShowStatsInfoModal] = useState<boolean>(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);

  // Single Form State
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [nis, setNis] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<JenisKelamin>('L');
  const [regu, setRegu] = useState('');
  const [jabatan, setJabatan] = useState('Anggota');

  // Batch Form State
  const [batchText, setBatchText] = useState('');
  const [batchKelasDefault, setBatchKelasDefault] = useState('');
  const [batchReguDefault, setBatchReguDefault] = useState('');

  // Filter students by active school
  const activeSiswa = useMemo(() => {
    if (!sekolahAktifId) return [];
    return siswaList.filter((s) => s.sekolahId === sekolahAktifId);
  }, [siswaList, sekolahAktifId]);

  // Unique Classes in Active School
  const listKelas = useMemo(() => {
    const setK = new Set<string>();
    activeSiswa.forEach((s) => {
      if (s.kelas) setK.add(s.kelas);
    });
    return Array.from(setK).sort();
  }, [activeSiswa]);

  // Filtered by Search & Class
  const filteredSiswa = useMemo(() => {
    return activeSiswa.filter((s) => {
      const matchSearch =
        s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.regu && s.regu.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchKelas = !filterKelas || s.kelas === filterKelas;
      return matchSearch && matchKelas;
    });
  }, [activeSiswa, searchQuery, filterKelas]);

  // Attendance stats for selected date
  const statsPresensiHariIni = useMemo(() => {
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;

    activeSiswa.forEach((s) => {
      const key = `${sekolahAktifId}_${tanggal}_${s.id}`;
      const status = absensi[key];
      if (status === 'H') hadir++;
      else if (status === 'I') izin++;
      else if (status === 'S') sakit++;
      else if (status === 'A') alpa++;
    });

    const totalTerdata = hadir + izin + sakit + alpa;
    const persenHadir = activeSiswa.length > 0 ? Math.round((hadir / activeSiswa.length) * 100) : 0;

    return { hadir, izin, sakit, alpa, totalTerdata, persenHadir };
  }, [activeSiswa, sekolahAktifId, tanggal, absensi]);

  // Gender Statistics
  const statsGender = useMemo(() => {
    let putra = 0;
    let putri = 0;
    activeSiswa.forEach((s) => {
      if (s.jenisKelamin === 'P') {
        putri++;
      } else {
        putra++;
      }
    });
    return { putra, putri };
  }, [activeSiswa]);

  // Cumulative Attendance Stats
  const rekapKumulatif = useMemo(() => {
    // Find all dates recorded for this school
    const datesSet = new Set<string>();
    Object.keys(absensi).forEach((key) => {
      if (key.startsWith(`${sekolahAktifId}_`)) {
        const parts = key.split('_');
        if (parts.length >= 3) {
          datesSet.add(parts[1]);
        }
      }
    });
    const allDates = Array.from(datesSet).sort();

    const rows = activeSiswa.map((s) => {
      let h = 0;
      let i = 0;
      let sk = 0;
      let a = 0;

      allDates.forEach((d) => {
        const status = absensi[`${sekolahAktifId}_${d}_${s.id}`];
        if (status === 'H') h++;
        else if (status === 'I') i++;
        else if (status === 'S') sk++;
        else if (status === 'A') a++;
      });

      const totalTercatat = h + i + sk + a;
      const pct = allDates.length > 0 ? Math.round((h / allDates.length) * 100) : 0;

      return {
        siswa: s,
        hadir: h,
        izin: i,
        sakit: sk,
        alpa: a,
        totalTercatat,
        persen: pct,
      };
    });

    return { allDates, rows };
  }, [activeSiswa, absensi, sekolahAktifId]);

  // Date Navigation Helpers
  const shiftDate = (days: number) => {
    const current = new Date(tanggal);
    current.setDate(current.getDate() + days);
    setTanggal(current.toISOString().split('T')[0]);
  };

  // Open Form Add Single
  const openAddSingle = () => {
    setEditingSiswa(null);
    setNama('');
    setKelas(listKelas[0] || 'IV-A');
    setNis('');
    setJenisKelamin('L');
    setRegu(sekolah?.tingkat === 'SD' ? 'Barung Merah' : 'Regu Elang');
    setJabatan('Anggota');
    setShowAddModal(true);
  };

  const openEdit = (s: Siswa) => {
    setEditingSiswa(s);
    setNama(s.nama);
    setKelas(s.kelas);
    setNis(s.nis);
    setJenisKelamin(s.jenisKelamin || 'L');
    setRegu(s.regu);
    setJabatan(s.jabatan || 'Anggota');
    setShowAddModal(true);
  };

  const handleSaveSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !sekolahAktifId) return;

    if (editingSiswa) {
      onUpdateSiswa({
        ...editingSiswa,
        nama: nama.trim(),
        kelas: kelas.trim(),
        nis: nis.trim(),
        jenisKelamin,
        regu: regu.trim(),
        jabatan: jabatan.trim(),
      });
    } else {
      const newS: Siswa = {
        id: generateUid('sis'),
        sekolahId: sekolahAktifId,
        nama: nama.trim(),
        kelas: kelas.trim(),
        nis: nis.trim() || String(Math.floor(100000 + Math.random() * 900000)),
        jenisKelamin,
        regu: regu.trim(),
        jabatan: jabatan.trim(),
      };
      onAddSiswa(newS);
    }
    setShowAddModal(false);
  };

  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchText.trim() || !sekolahAktifId) return;

    const lines = batchText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const generated: Siswa[] = lines.map((line, idx) => {
      // Allow format: "Nama Siswa, Kelas, Regu" or simple "Nama Siswa"
      const parts = line.split(',').map((p) => p.trim());
      const sNama = parts[0];
      const sKelas = parts[1] || batchKelasDefault || 'IV-A';
      const sRegu = parts[2] || batchReguDefault || 'Regu Anggota';

      return {
        id: generateUid('sis_batch'),
        sekolahId: sekolahAktifId,
        nama: sNama,
        kelas: sKelas,
        nis: String(Date.now()).slice(-6) + (idx + 1),
        jenisKelamin: 'L',
        regu: sRegu,
        jabatan: 'Anggota',
      };
    });

    onAddBatchSiswa(generated);
    setBatchText('');
    setShowBatchModal(false);
  };

  const handleImportSuccess = (importedSiswa: Siswa[], mode: 'append' | 'replace') => {
    if (mode === 'replace' && onReplaceSiswa) {
      onReplaceSiswa(sekolahAktifId, importedSiswa);
    } else {
      onAddBatchSiswa(importedSiswa);
    }
    setSubTab('buku_induk');
  };

  const handleExportBukuIndukExcel = () => {
    if (!sekolah) return;
    const wb = XLSX.utils.book_new();
    const sheetData: any[][] = [
      ['BUKU INDUK REGISTRASI ANGGOTA PRAMUKA'],
      [`PANGKALAN ${sekolah.nama.toUpperCase()} - GUGUS DEPAN ${sekolah.gudep || '00.000'}`],
      [`TINGKAT: ${sekolah.tingkat} | TOTAL ANGGOTA: ${activeSiswa.length}`],
      [],
      ['NO', 'NAMA LENGKAP', 'NIS / NTA', 'JK', 'KELAS', 'REGU / BARUNG', 'JABATAN'],
    ];
    activeSiswa.forEach((s, idx) => {
      sheetData.push([
        idx + 1,
        s.nama,
        s.nis || '-',
        s.jenisKelamin,
        s.kelas,
        s.regu || '-',
        s.jabatan || 'Anggota',
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
    ];
    ws['!cols'] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 16 },
      { wch: 8 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Buku Induk');
    XLSX.writeFile(wb, `Buku_Induk_${sekolah.nama.replace(/\s+/g, '_')}.xlsx`);
  };

  const handleExportBukuIndukWord = () => {
    if (!sekolah) return;
    exportBukuIndukToWord(
      sekolah,
      activeSiswa,
      'Jakarta',
      new Date().toISOString().split('T')[0],
      sekolah.pembina || 'Pembina Gugus Depan'
    );
  };

  const handleExportBukuIndukPdf = async () => {
    if (!sekolah) return;
    const tableEl = document.getElementById('table-buku-induk-container');
    if (!tableEl) return;
    try {
      await exportElementToPdf(tableEl, {
        filename: `Buku_Induk_${sekolah.nama.replace(/\s+/g, '_')}.pdf`,
        orientation: 'portrait',
        marginMm: 10,
        qualityScale: 2,
      });
    } catch (err) {
      console.error('Gagal export PDF buku induk:', err);
    }
  };

  if (!sekolah) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-800">Pilih Pangkalan Sekolah Terlebih Dahulu</h3>
        <p className="text-sm text-slate-500 mt-1">
          Silakan pilih pangkalan aktif untuk melihat atau mengisi presensi anggota.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Utama Modul Siswa & Anggota (Green) */}
      <MainModuleHeader
        tabId="siswa"
        customBadges={[
          { label: `${activeSiswa.length} Anggota Terdaftar`, icon: Users },
          { label: `♂ ${statsGender.putra} Putra`, icon: Users },
          { label: `♀ ${statsGender.putri} Putri`, icon: Users },
          { label: `Tingkat ${sekolah.tingkat}`, icon: Calendar },
        ]}
        rightAction={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowStatsInfoModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-md border border-white/20 cursor-pointer transition-all shadow-xs"
            >
              <Info className="w-4 h-4" />
              <span>Info Statistik</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-200 hover:bg-emerald-100 rounded-xl shadow-md cursor-pointer transition-all border border-emerald-300"
            >
              <Upload className="w-4 h-4 text-emerald-800" />
              <span>Import Excel</span>
            </button>
          </div>
        }
      />

      {/* Top Banner & School Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
              {sekolah.tingkat === 'SD' ? 'Gudep Siaga' : sekolah.tingkat === 'SMP' ? 'Gudep Penggalang' : 'Gudep Penegak'}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Gudep: {sekolah.gudep || '-'}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{sekolah.nama}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pembina: <span className="font-medium text-slate-700 dark:text-slate-200">{sekolah.pembina || '-'}</span> · Latihan:{' '}
            <span className="font-medium text-slate-700 dark:text-slate-200">{sekolah.hariLatihan || '-'} ({sekolah.jamLatihan || '-'})</span>
          </p>
        </div>

        {/* Change School Quick Selector & Import Action */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowStatsInfoModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg shadow-2xs cursor-pointer transition-all"
            title="Lihat info ringkasan & statistik data siswa, pembagian regu, dan profil pangkalan"
          >
            <Info className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
            <span>Info Data Siswa</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-lg shadow-2xs cursor-pointer transition-all"
            title="Import data siswa dari berkas Excel (.xlsx, .xls) atau CSV"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Import Data Siswa</span>
          </button>

          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Pangkalan:</label>
            <select
              value={sekolahAktifId}
              onChange={(e) => onSelectSekolahAktif(e.target.value)}
              className="text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-emerald-600 focus:border-emerald-600"
            >
              {daftarSekolah.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.tingkat})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Segmented Control Subtabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-fit">
        <button
          onClick={() => setSubTab('presensi')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'presensi'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Presensi Harian ({formatTanggalIndo(tanggal).split(',')[0]})
        </button>
        <button
          onClick={() => setSubTab('buku_induk')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'buku_induk'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Buku Induk Anggota ({activeSiswa.length})
        </button>
        <button
          onClick={() => setSubTab('rekap')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'rekap'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Rekapitulasi Kehadiran
        </button>
      </div>

      {/* ============================================================== */}
      {/* SUBTAB 1: PRESENSI HARIAN                                      */}
      {/* ============================================================== */}
      {subTab === 'presensi' && (
        <div className="space-y-4">
          {/* Date Picker Bar & Quick Status */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Date Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => shiftDate(-1)}
                  title="Hari Sebelumnya"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800">
                  <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="text-xs font-medium text-slate-800 dark:text-white bg-transparent focus:outline-hidden"
                  />
                </div>
                <button
                  onClick={() => shiftDate(1)}
                  title="Hari Berikutnya"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTanggal(new Date().toISOString().split('T')[0])}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline px-1 cursor-pointer"
                >
                  Hari Ini
                </button>
              </div>

              {/* Action Buttons: Batch Mark */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onBatchSetAbsensi(sekolahAktifId, tanggal, 'H')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Semua Hadir</span>
                </button>
                {onSyncWithJurnal && statsPresensiHariIni.hadir > 0 && (
                  <button
                    onClick={() => onSyncWithJurnal(tanggal, statsPresensiHariIni.hadir)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                  >
                    <span>Sinkron ke Jurnal</span>
                  </button>
                )}
              </div>
            </div>

            {/* Attendance Stat Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Total Anggota</span>
                <span className="text-base font-bold text-slate-800 tabular-nums">{activeSiswa.length} Siswa</span>
              </div>
              <div className="bg-emerald-50/70 rounded-lg p-2.5 border border-emerald-100">
                <span className="text-emerald-700 block text-[11px]">Hadir (H)</span>
                <span className="text-base font-bold text-emerald-800 tabular-nums">
                  {statsPresensiHariIni.hadir} ({statsPresensiHariIni.persenHadir}%)
                </span>
              </div>
              <div className="bg-blue-50/70 rounded-lg p-2.5 border border-blue-100">
                <span className="text-blue-700 block text-[11px]">Izin (I)</span>
                <span className="text-base font-bold text-blue-800 tabular-nums">{statsPresensiHariIni.izin} Siswa</span>
              </div>
              <div className="bg-amber-50/70 rounded-lg p-2.5 border border-amber-100">
                <span className="text-amber-700 block text-[11px]">Sakit (S)</span>
                <span className="text-base font-bold text-amber-800 tabular-nums">{statsPresensiHariIni.sakit} Siswa</span>
              </div>
              <div className="bg-rose-50/70 rounded-lg p-2.5 border border-rose-100 col-span-2 sm:col-span-1">
                <span className="text-rose-700 block text-[11px]">Alpa (A)</span>
                <span className="text-base font-bold text-rose-800 tabular-nums">{statsPresensiHariIni.alpa} Siswa</span>
              </div>
            </div>
          </div>

          {/* Student Attendance List */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            {activeSiswa.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Belum ada anggota terdaftar di pangkalan ini.</p>
                <button
                  onClick={openAddSingle}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Anggota Pertama
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="px-4 py-3 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <div className="flex-1">Nama Anggota & Regu</div>
                  <div className="text-center w-64 sm:w-80">Presensi ({formatTanggalIndo(tanggal)})</div>
                </div>

                {activeSiswa.map((siswa, idx) => {
                  const key = `${sekolahAktifId}_${tanggal}_${siswa.id}`;
                  const currentStatus = absensi[key];

                  return (
                    <div
                      key={siswa.id}
                      className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400 w-5 tabular-nums">{idx + 1}.</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white">{siswa.nama}</h4>
                            <span className="text-[11px] text-slate-500 font-mono">({siswa.kelas})</span>
                            <button
                              type="button"
                              onClick={() => setSelectedInfoSiswa(siswa)}
                              className="p-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded cursor-pointer transition-colors"
                              title="Lihat Info Siswa & KTA"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>{siswa.regu || 'Regu Anggota'}</span>
                            {siswa.jabatan && siswa.jabatan !== 'Anggota' && (
                              <>
                                <span>·</span>
                                <span className="font-medium text-emerald-700">{siswa.jabatan}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 4 Interactive Status Buttons */}
                      <div className="flex items-center justify-end gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => onUpdateAbsensi(sekolahAktifId, tanggal, siswa.id, currentStatus === 'H' ? null : 'H')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                            currentStatus === 'H'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          Hadir
                        </button>
                        <button
                          onClick={() => onUpdateAbsensi(sekolahAktifId, tanggal, siswa.id, currentStatus === 'I' ? null : 'I')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                            currentStatus === 'I'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          Izin
                        </button>
                        <button
                          onClick={() => onUpdateAbsensi(sekolahAktifId, tanggal, siswa.id, currentStatus === 'S' ? null : 'S')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                            currentStatus === 'S'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          Sakit
                        </button>
                        <button
                          onClick={() => onUpdateAbsensi(sekolahAktifId, tanggal, siswa.id, currentStatus === 'A' ? null : 'A')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                            currentStatus === 'A'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          Alpa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 2: BUKU INDUK ANGGOTA                                    */}
      {/* ============================================================== */}
      {subTab === 'buku_induk' && (
        <div className="space-y-4">
          {/* Controls & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, atau regu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                />
              </div>
              {listKelas.length > 0 && (
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700"
                >
                  <option value="">Semua Kelas</option>
                  {listKelas.map((k) => (
                    <option key={k} value={k}>
                      Kelas {k}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setShowStatsInfoModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Lihat info ringkasan & statistik data siswa, pembagian regu, dan profil pangkalan"
              >
                <Info className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
                <span>Info Data Siswa</span>
              </button>
              <button
                onClick={handleExportBukuIndukPdf}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-900 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Ekspor buku induk ke berkas PDF (.pdf) langsung tersimpan"
              >
                <Download className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
                <span>PDF (.pdf)</span>
              </button>
              <button
                onClick={handleExportBukuIndukWord}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-300 dark:border-blue-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Ekspor buku induk ke berkas Microsoft Word (.doc)"
              >
                <FileText className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                <span>Word (.doc)</span>
              </button>
              <button
                onClick={handleExportBukuIndukExcel}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Ekspor buku induk ke Microsoft Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Import data siswa dari berkas Excel atau CSV"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Import Siswa</span>
              </button>
              <button
                onClick={() => setShowBatchModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Input Cepat</span>
              </button>
              <button
                onClick={openAddSingle}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Anggota Baru</span>
              </button>
            </div>
          </div>

          {/* Table of Members */}
          <div
            id="table-buku-induk-container"
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">NIS / NTA</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Regu / Barung</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSiswa.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                        Tidak ada data anggota yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredSiswa.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-slate-400 tabular-nums">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                          {s.nama}
                          <span className="ml-1 text-[11px] text-slate-400">({s.jenisKelamin})</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 tabular-nums">{s.nis || '-'}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{s.kelas}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{s.regu || '-'}</td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-800 dark:text-emerald-400 font-medium">{s.jabatan || 'Anggota'}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setSelectedInfoSiswa(s)}
                              className="p-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded cursor-pointer transition-colors"
                              title="Lihat Info Lengkap & KTA Anggota"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEdit(s)}
                              className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                              title="Edit Anggota"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus anggota "${s.nama}"? Riwayat presensi akan dihapus.`)) {
                                  onDeleteSiswa(s.id);
                                }
                              }}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                              title="Hapus Anggota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 3: REKAPITULASI KEHADIRAN                                */}
      {/* ============================================================== */}
      {subTab === 'rekap' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Rekapitulasi Persentase Presensi Anggota</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dihitung berdasarkan {rekapKumulatif.allDates.length} sesi pertemuan latihan yang tercatat di sistem.
              </p>
            </div>
            <button
              onClick={() => setShowStatsInfoModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Info className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
              <span>Info Statistik Lengkap</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Nama Anggota</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3 text-center text-emerald-700 dark:text-emerald-400">Hadir (H)</th>
                  <th className="py-2.5 px-3 text-center text-blue-700 dark:text-blue-400">Izin (I)</th>
                  <th className="py-2.5 px-3 text-center text-amber-700 dark:text-amber-400">Sakit (S)</th>
                  <th className="py-2.5 px-3 text-center text-rose-700 dark:text-rose-400">Alpa (A)</th>
                  <th className="py-2.5 px-3 text-right">Persentase</th>
                  <th className="py-2.5 px-3 text-center w-14">Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rekapKumulatif.rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-slate-500 dark:text-slate-400">
                      Belum ada data presensi untuk pangkalan ini.
                    </td>
                  </tr>
                ) : (
                  rekapKumulatif.rows.map((row, i) => (
                    <tr key={row.siswa.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 tabular-nums">{i + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{row.siswa.nama}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{row.siswa.kelas}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-emerald-800 dark:text-emerald-300 tabular-nums">{row.hadir}</td>
                      <td className="py-2.5 px-3 text-center text-blue-800 dark:text-blue-300 tabular-nums">{row.izin}</td>
                      <td className="py-2.5 px-3 text-center text-amber-800 dark:text-amber-300 tabular-nums">{row.sakit}</td>
                      <td className="py-2.5 px-3 text-center text-rose-800 dark:text-rose-300 tabular-nums">{row.alpa}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-semibold tabular-nums ${
                            row.persen >= 75
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : row.persen >= 50
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {row.persen}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedInfoSiswa(row.siswa)}
                          className="p-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded cursor-pointer transition-colors"
                          title="Lihat Info Siswa & KTA"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Single Siswa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                {editingSiswa ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveSingle} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Kelas / Rombel</label>
                  <input
                    type="text"
                    required
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="Contoh: IV-A atau VII-1"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">NIS / Nomor Induk</label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="202401"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as JenisKelamin)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                  >
                    <option value="L">Laki-laki (Putra)</option>
                    <option value="P">Perempuan (Putri)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Regu / Barung / Sangga</label>
                  <input
                    type="text"
                    value={regu}
                    onChange={(e) => setRegu(e.target.value)}
                    placeholder="Contoh: Regu Rajawali"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Jabatan Kepramukaan</label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Anggota / Pinru / Sulung / Pratama"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Batch Input Siswa */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Input Massal Anggota</h3>
                <p className="text-xs text-slate-500">Paste daftar nama siswa sekaligus dari Excel / Catatan.</p>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveBatch} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Kelas Default</label>
                  <input
                    type="text"
                    value={batchKelasDefault}
                    onChange={(e) => setBatchKelasDefault(e.target.value)}
                    placeholder="Contoh: IV-A"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Regu Default</label>
                  <input
                    type="text"
                    value={batchReguDefault}
                    onChange={(e) => setBatchReguDefault(e.target.value)}
                    placeholder="Contoh: Barung Hijau"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Daftar Nama (1 baris per nama atau Nama, Kelas, Regu)
                </label>
                <textarea
                  rows={6}
                  required
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  placeholder={`Ahmad Dani, IV-A, Barung Merah\nBudi Santoso, IV-A, Barung Merah\nCitra Kirana, IV-B, Barung Kuning`}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
                >
                  Simpan Semua
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Info Lengkap & KTA Siswa */}
      <InfoSiswaModal
        isOpen={Boolean(selectedInfoSiswa)}
        onClose={() => setSelectedInfoSiswa(null)}
        siswa={selectedInfoSiswa}
        sekolah={sekolah}
        absensi={absensi}
      />

      {/* Modal Info Ringkasan & Statistik Data Siswa */}
      <InfoStatistikSiswaModal
        isOpen={showStatsInfoModal}
        onClose={() => setShowStatsInfoModal(false)}
        sekolah={sekolah}
        siswaList={activeSiswa}
        absensi={absensi}
      />

      {/* Import Siswa Modal */}
      <ImportSiswaModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        sekolahId={sekolahAktifId}
        sekolahNama={sekolah.nama}
        tingkatSekolah={sekolah.tingkat}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};
