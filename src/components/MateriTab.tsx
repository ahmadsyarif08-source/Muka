import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { MATERI_BANK, MateriSiapPakai } from '../data/materiBank';
import { ButirSkuSiaga } from '../data/skuSiagaData';
import { SkuSiagaSection } from './SkuSiagaSection';
import { Sekolah, KategoriMateri } from '../types';
import { exportElementToPdf } from '../utils/pdfExport';
import { MainModuleHeader } from './MainModuleHeader';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  ChevronRight,
  Download,
  Printer,
  Sparkles,
  Compass,
  Flame,
  Shield,
  FileText,
  FileSpreadsheet,
  X,
  ExternalLink,
  Calendar,
} from 'lucide-react';

interface MateriTabProps {
  sekolahAktif?: Sekolah;
  onGunakanMateriDiJurnal?: (materi: MateriSiapPakai) => void;
}

export const MateriTab: React.FC<MateriTabProps> = ({
  sekolahAktif,
  onGunakanMateriDiJurnal,
}) => {
  const [subTabMode, setSubTabMode] = useState<'silabus' | 'sku-siaga'>('silabus');
  const [selectedSemester, setSelectedSemester] = useState<'Semua' | '1' | '2'>('Semua');
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [selectedTingkat, setSelectedTingkat] = useState<string>('Semua');
  const [selectedPertemuan, setSelectedPertemuan] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMateriDetail, setActiveMateriDetail] = useState<MateriSiapPakai | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingAllPdf, setIsExportingAllPdf] = useState<boolean>(false);

  const detailPrintRef = useRef<HTMLDivElement>(null);
  const fullYearPrintRef = useRef<HTMLDivElement>(null);

  // Convert ButirSkuSiaga to MateriSiapPakai for Jurnal
  const handlePilihSkuUntukJurnal = (sku: ButirSkuSiaga) => {
    if (!onGunakanMateriDiJurnal) return;
    const materiAdapted: MateriSiapPakai = {
      id: sku.id,
      judul: `[SKU Siaga ${sku.tingkat} No.${sku.nomor}] ${sku.judulMateri}`,
      kategori: 'SKU',
      tingkat: 'Siaga',
      pertemuanKe: sku.nomor,
      semester: sku.tingkat === 'Mula' ? 1 : 2,
      bulanEstimasi: `Golongan Siaga ${sku.tingkat}`,
      durasiMenit: sku.durasiMenit || 90,
      tujuan: `[Bunyi Butir SKU]: ${sku.bunyiSku}`,
      ringkasanMateri: sku.uraianMateri,
      langkah: [
        {
          tahap: 'Pendahuluan',
          waktu: '15 Menit',
          kegiatan:
            'Upacara pembukaan lingkaran perindukan Siaga, salam, doa bersama, dan pengantar materi ceria ' +
            sku.judulMateri,
        },
        {
          tahap: 'Inti',
          waktu: '60 Menit',
          kegiatan: `${sku.aktivitasPermainan}. Praktik pemahaman materi dan pengujian kecakapan butir SKU No.${sku.nomor}.`,
        },
        {
          tahap: 'Penutup',
          waktu: '15 Menit',
          kegiatan:
            'Evaluasi pencapaian kecakapan, paraf buku saku SKU, pesan moral Yanda/Bunda, dan upacara penutupan.',
        },
      ],
      alatBahan: sku.alatBahan,
      indikator: sku.indikatorPencapaian,
      kodeSKU: `SKU Siaga ${sku.tingkat} Butir No.${sku.nomor} (${sku.area})`,
    };
    onGunakanMateriDiJurnal(materiAdapted);
  };

  // Filter materials based on criteria
  const filteredList = useMemo(() => {
    return MATERI_BANK.filter((item) => {
      const matchSemester =
        selectedSemester === 'Semua' || item.semester.toString() === selectedSemester;
      const matchKategori = selectedKategori === 'Semua' || item.kategori === selectedKategori;
      const matchTingkat =
        selectedTingkat === 'Semua' ||
        item.tingkat === 'Semua' ||
        item.tingkat === selectedTingkat;
      const matchPertemuan =
        selectedPertemuan === 'Semua' || item.pertemuanKe.toString() === selectedPertemuan;
      const matchSearch =
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tujuan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.kodeSKU && item.kodeSKU.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.bulanEstimasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.alatBahan.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSemester && matchKategori && matchTingkat && matchPertemuan && matchSearch;
    });
  }, [selectedSemester, selectedKategori, selectedTingkat, selectedPertemuan, searchQuery]);

  // Export Single Module to PDF
  const handleDownloadDetailPdf = async (materi: MateriSiapPakai) => {
    if (!detailPrintRef.current) return;
    setIsExportingPdf(true);
    try {
      const cleanTitle = materi.judul.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      await exportElementToPdf(detailPrintRef.current, {
        filename: `Modul_Pramuka_P${materi.pertemuanKe}_${cleanTitle}.pdf`,
        orientation: 'portrait',
        marginMm: 10,
        qualityScale: 2,
      });
    } catch (err) {
      console.error('Gagal export PDF materi:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export Full 1-Year Program to Excel (.xlsx)
  const handleExportSilabusExcel = () => {
    const wb = XLSX.utils.book_new();
    const namaSekolah = sekolahAktif?.nama?.toUpperCase() || 'GUDEP PRAMUKA';
    const gudep = sekolahAktif?.gudep || '00.000';

    const sheetData: any[][] = [
      ['SILABUS & PROGRAM KERJA LATIHAN GERAKAN PRAMUKA 1 TAHUN LENGKAP'],
      [`PANGKALAN ${namaSekolah} - GUGUS DEPAN ${gudep}`],
      ['KURIKULUM RESMI 36 PERTEMUAN (SEMESTER 1 GANJIL & SEMESTER 2 GENAP)'],
      [],
      [
        'NO',
        'SEMESTER',
        'ESTIMASI WAKTU',
        'PERTEMUAN KE',
        'KATEGORI MATERI',
        'GOLONGAN TINGKAT',
        'MATERI POKOK / JUDUL LATIHAN',
        'TUJUAN PEMBELAJARAN',
        'PERLENGKAPAN ALAT & BAHAN',
        'INDIKATOR KETERCAPAIAN SISWA',
        'STANDAR BUTIR SKU / SKK',
      ],
    ];

    MATERI_BANK.forEach((m, idx) => {
      sheetData.push([
        idx + 1,
        `Semester ${m.semester} (${m.semester === 1 ? 'Ganjil' : 'Genap'})`,
        m.bulanEstimasi,
        `Pertemuan Ke-${m.pertemuanKe}`,
        m.kategori,
        m.tingkat,
        m.judul,
        m.tujuan,
        m.alatBahan.join(', '),
        m.indikator,
        m.kodeSKU || '-',
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } },
    ];

    ws['!cols'] = [
      { wch: 5 },
      { wch: 18 },
      { wch: 22 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 42 },
      { wch: 45 },
      { wch: 35 },
      { wch: 45 },
      { wch: 28 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Silabus 1 Tahun');
    const filename = `Silabus_Pramuka_1_Tahun_${(sekolahAktif?.nama || 'Lengkap').replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  // Export Full 1-Year Program to PDF
  const handleExportFullYearPdf = async () => {
    if (!fullYearPrintRef.current) return;
    setIsExportingAllPdf(true);
    try {
      const namaBersih = (sekolahAktif?.nama || 'Pramuka').replace(/\s+/g, '_');
      await exportElementToPdf(fullYearPrintRef.current, {
        filename: `Silabus_Program_Kerja_Pramuka_1_Tahun_${namaBersih}.pdf`,
        orientation: 'landscape',
        marginMm: 8,
        qualityScale: 2,
      });
    } catch (err) {
      console.error('Gagal export PDF silabus 1 tahun:', err);
    } finally {
      setIsExportingAllPdf(false);
    }
  };

  const getKategoriBadgeColor = (kat: KategoriMateri) => {
    switch (kat) {
      case 'Tekpram':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'PBB':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'SKU':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'SKK':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'Outbound':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'Upacara':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Utama Modul Bank Materi & SKU (Purple) */}
      <MainModuleHeader
        tabId="materi"
        customBadges={[
          { label: '36 Pertemuan Silabus Lengkap', icon: BookOpen },
          { label: '100 Butir SKU Siaga (Mula, Bantu, Tata)', icon: Award },
          { label: 'Ekspor Excel & PDF', icon: Download },
        ]}
        rightAction={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportSilabusExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xs"
              title="Unduh Silabus Lengkap ke Microsoft Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Unduh Silabus Excel</span>
            </button>
            <button
              onClick={handleExportFullYearPdf}
              disabled={isExportingAllPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-purple-950 bg-purple-200 hover:bg-purple-100 rounded-xl shadow-md transition-all cursor-pointer border border-purple-300"
              title="Unduh Modul Lengkap ke Dokumen PDF"
            >
              <Download className="w-4 h-4 text-purple-900" />
              <span>{isExportingAllPdf ? 'Mengekspor...' : 'Cetak PDF 1 Tahun'}</span>
            </button>
          </div>
        }
      />

      {/* Top Subtab Navigator: Silabus 1 Tahun vs SKU Siaga Lengkap */}
      <div className="flex flex-wrap items-center gap-2.5 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <button
          type="button"
          onClick={() => setSubTabMode('silabus')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            subTabMode === 'silabus'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Silabus 1 Tahun (36 Pertemuan)</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              subTabMode === 'silabus'
                ? 'bg-white/20 text-white'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            Sem 1 & 2
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTabMode('sku-siaga')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            subTabMode === 'sku-siaga'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Materi Full SKU Siaga (100 Butir Lengkap)</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              subTabMode === 'sku-siaga'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            Mula · Bantu · Tata
          </span>
        </button>
      </div>

      {subTabMode === 'sku-siaga' ? (
        <SkuSiagaSection
          sekolahAktif={sekolahAktif}
          onPilihSkuUntukJurnal={handlePilihSkuUntukJurnal}
        />
      ) : (
        <>
          {/* Top Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Bank Materi & Silabus Pramuka 1 Tahun Penuh
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Program kerja kurikulum resmi 36 pertemuan (18 Semester Ganjil & 18 Semester Genap) mencakup SKU, SKK, Teknik Kepramukaan, PBB, Outbound, dan Upacara.
            </p>
          </div>

          {/* Action Download Full Year Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isExportingAllPdf}
              onClick={handleExportFullYearPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Cetak & simpan seluruh silabus 36 pertemuan 1 tahun langsung ke berkas PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingAllPdf ? 'Menyimpan PDF...' : 'Simpan PDF 1 Tahun (.pdf)'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportSilabusExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-lg shadow-2xs transition-all cursor-pointer"
              title="Unduh seluruh matriks jadwal 1 tahun ke format spreadsheet Microsoft Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Ekspor Excel 1 Tahun (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="pt-4 space-y-3 text-xs">
          {/* Semester Selector Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Pilihan Semester:</span>
              <div className="inline-flex p-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedSemester('Semua')}
                  className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    selectedSemester === 'Semua'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  Semua (36 Pertemuan)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSemester('1')}
                  className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    selectedSemester === '1'
                      ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  Semester 1 / Ganjil (P 1-18)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSemester('2')}
                  className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    selectedSemester === '2'
                      ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  Semester 2 / Genap (P 19-36)
                </button>
              </div>
            </div>

            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Menampilkan <strong>{filteredList.length}</strong> dari {MATERI_BANK.length} materi latihan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari materi simpul, sandi, PBB, bulan..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-emerald-600 focus:bg-white"
              />
            </div>

            {/* Kategori Filter */}
            <div className="space-y-1">
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
              >
                <option value="Semua">Semua Kategori Materi</option>
                <option value="Tekpram">Teknik Kepramukaan (Tekpram)</option>
                <option value="PBB">PBB & Tongkat</option>
                <option value="SKU">Syarat Kecakapan Umum (SKU)</option>
                <option value="SKK">Syarat Kecakapan Khusus (SKK)</option>
                <option value="Outbound">Outbound & Permainan</option>
                <option value="Upacara">Upacara & Tradisi</option>
              </select>
            </div>

            {/* Tingkatan Filter */}
            <div className="space-y-1">
              <select
                value={selectedTingkat}
                onChange={(e) => setSelectedTingkat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
              >
                <option value="Semua">Semua Golongan Usia</option>
                <option value="Siaga">Pramuka Siaga (SD)</option>
                <option value="Penggalang">Pramuka Penggalang (SMP / SD Atas)</option>
                <option value="Penegak">Pramuka Penegak (SMA / SMK)</option>
              </select>
            </div>

            {/* Urutan Pertemuan Filter (1-36) */}
            <div className="space-y-1">
              <select
                value={selectedPertemuan}
                onChange={(e) => setSelectedPertemuan(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
              >
                <option value="Semua">Semua Urutan Pertemuan (P 1 - 36)</option>
                {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num.toString()}>
                    Pertemuan Ke-{num} ({num <= 18 ? 'Sem 1 Ganjil' : 'Sem 2 Genap'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Materials Grid (36 Complete Items) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Tidak Ada Materi yang Cocok
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Coba sesuaikan kata kunci pencarian atau ganti filter semester, kategori, dan tingkatan.
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
            >
              <div className="space-y-3">
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200">
                      P-{item.pertemuanKe}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      Sem {item.semester} ({item.bulanEstimasi})
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getKategoriBadgeColor(
                        item.kategori
                      )}`}
                    >
                      {item.kategori}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {item.tingkat}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {item.durasiMenit} Menit
                  </span>
                </div>

                {/* Judul Materi */}
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {item.judul}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {item.tujuan}
                  </p>
                </div>

                {/* Ringkasan Teori Bullet Points */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 block text-[10px] uppercase tracking-wider">
                    Pokok Bahasan Latihan:
                  </span>
                  {item.ringkasanMateri.slice(0, 2).map((rm, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 truncate">
                      <span className="text-emerald-600 font-bold shrink-0">•</span>
                      <span className="truncate">{rm}</span>
                    </div>
                  ))}
                  {item.ringkasanMateri.length > 2 && (
                    <span className="text-[10px] text-slate-400 italic">
                      +{item.ringkasanMateri.length - 2} pokok bahasan lainnya...
                    </span>
                  )}
                </div>

                {/* Alat Bahan Tag */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Alat:</span>{' '}
                  {item.alatBahan.join(', ')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMateriDetail(item)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lihat Modul</span>
                </button>

                {onGunakanMateriDiJurnal && (
                  <button
                    type="button"
                    onClick={() => onGunakanMateriDiJurnal(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-all cursor-pointer"
                    title="Gunakan materi ini langsung untuk membuat catatan di Jurnal Latihan"
                  >
                    <span>Ajarkan di Jurnal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAIL MODAL & DIRECT PDF PRINTER */}
      {activeMateriDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col text-slate-800 dark:text-slate-100 max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold">
                  <span className="text-lg">⚜</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-semibold">
                      Pertemuan Ke-{activeMateriDetail.pertemuanKe} (Sem {activeMateriDetail.semester})
                    </span>
                    <span className="text-xs text-slate-300">{activeMateriDetail.kategori}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                    {activeMateriDetail.judul}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveMateriDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body (Captured for Direct PDF) */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
              <div
                ref={detailPrintRef}
                className="bg-white p-5 rounded-xl border border-slate-200 space-y-5 text-slate-900 font-sans shadow-xs"
              >
                {/* Printable Header */}
                <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-800 block">
                    PANDUAN MATERI & SILABUS LATIHAN PRAMUKA MINGGUAN
                  </span>
                  <h2 className="text-lg font-black text-slate-900 uppercase">
                    {activeMateriDetail.judul}
                  </h2>
                  <div className="flex items-center justify-center gap-3 text-xs text-slate-600 font-medium">
                    <span>Pertemuan Ke: {activeMateriDetail.pertemuanKe}</span>
                    <span>•</span>
                    <span>Semester: {activeMateriDetail.semester} ({activeMateriDetail.bulanEstimasi})</span>
                    <span>•</span>
                    <span>Kategori: {activeMateriDetail.kategori}</span>
                    <span>•</span>
                    <span>Durasi: {activeMateriDetail.durasiMenit} Menit</span>
                    {activeMateriDetail.kodeSKU && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-emerald-800">{activeMateriDetail.kodeSKU}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* 1. Tujuan Pembelajaran */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Tujuan & Kompetensi yang Dicapai
                  </h4>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {activeMateriDetail.tujuan}
                  </p>
                </div>

                {/* 2. Uraian Pokok Bahasan */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    Pokok Bahasan / Materi Teori & Praktik
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {activeMateriDetail.ringkasanMateri.map((rm, i) => (
                      <li key={i} className="leading-relaxed">
                        {rm}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Langkah-Langkah Pembelajaran */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    Skenario / Langkah Pembelajaran Pertemuan
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3 w-28">Tahapan</th>
                          <th className="py-2 px-3 w-24">Waktu</th>
                          <th className="py-2 px-3">Kegiatan Pelatih & Peserta Didik</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeMateriDetail.langkah.map((l, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-semibold text-slate-900">{l.tahap}</td>
                            <td className="py-2 px-3 text-slate-600 font-mono">{l.waktu}</td>
                            <td className="py-2 px-3 text-slate-700">{l.kegiatan}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Alat Bahan & Indikator Ketercapaian */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                    <h5 className="font-bold text-slate-900">Perlengkapan / Alat & Bahan:</h5>
                    <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                      {activeMateriDetail.alatBahan.map((ab, i) => (
                        <li key={i}>{ab}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 space-y-1">
                    <h5 className="font-bold text-emerald-900">Indikator Ketercapaian Murid:</h5>
                    <p className="text-emerald-800">{activeMateriDetail.indikator}</p>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Modul Silabus Resmi Gerakan Pramuka 1 Tahun Penuh</span>
                  <span>SiPramuka Indonesia</span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isExportingPdf}
                  onClick={() => handleDownloadDetailPdf(activeMateriDetail)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  title="Langsung unduh modul latihan ini dalam bentuk file PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExportingPdf ? 'Menyimpan PDF...' : 'Simpan Langsung PDF (.pdf)'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {onGunakanMateriDiJurnal && (
                  <button
                    type="button"
                    onClick={() => {
                      onGunakanMateriDiJurnal(activeMateriDetail);
                      setActiveMateriDetail(null);
                    }}
                    className="px-4 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Terapkan ke Jurnal Latihan</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveMateriDetail(null)}
                  className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINTABLE CONTAINER FOR FULL 1-YEAR PDF MATRIX */}
      <div className="hidden">
        <div
          ref={fullYearPrintRef}
          className="bg-white p-8 text-slate-900 font-sans space-y-5 w-[297mm] min-h-[210mm]"
        >
          {/* Official Document Header */}
          <div className="border-b-4 border-double border-slate-900 pb-3 text-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-800">
              GERAKAN PRAMUKA GUGUS DEPAN {sekolahAktif?.gudep || '00.000'}
            </h4>
            <h2 className="text-xl font-black uppercase text-slate-950 mt-0.5">
              SILABUS & PROGRAM KERJA EKSTRAKURIKULER PRAMUKA 1 TAHUN AJARAN PENUH
            </h2>
            <p className="text-xs text-slate-700 font-medium">
              Pangkalan: {sekolahAktif?.nama || 'Sekolah'} | Golongan: {sekolahAktif?.tingkat || 'Penggalang'} | 36 Pertemuan Latihan
            </p>
          </div>

          {/* Table of 36 Meetings */}
          <table className="w-full text-left text-[10px] border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-400">
                <th className="p-1.5 border border-slate-300 w-8 text-center">No</th>
                <th className="p-1.5 border border-slate-300 w-16">Semester</th>
                <th className="p-1.5 border border-slate-300 w-24">Waktu</th>
                <th className="p-1.5 border border-slate-300 w-16 text-center">P-Ke</th>
                <th className="p-1.5 border border-slate-300 w-16">Kategori</th>
                <th className="p-1.5 border border-slate-300">Materi Pokok / Bahasan</th>
                <th className="p-1.5 border border-slate-300">Tujuan Pembelajaran</th>
                <th className="p-1.5 border border-slate-300 w-36">Alat & Bahan</th>
                <th className="p-1.5 border border-slate-300 w-28">Standar SKU</th>
              </tr>
            </thead>
            <tbody>
              {MATERI_BANK.map((m, idx) => (
                <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-1 border border-slate-300 text-center font-bold">{idx + 1}</td>
                  <td className="p-1 border border-slate-300 font-semibold">Sem {m.semester}</td>
                  <td className="p-1 border border-slate-300">{m.bulanEstimasi}</td>
                  <td className="p-1 border border-slate-300 text-center font-bold">P-{m.pertemuanKe}</td>
                  <td className="p-1 border border-slate-300 font-semibold">{m.kategori}</td>
                  <td className="p-1 border border-slate-300 font-bold text-slate-900">{m.judul}</td>
                  <td className="p-1 border border-slate-300 text-slate-700">{m.tujuan}</td>
                  <td className="p-1 border border-slate-300 text-slate-600">{m.alatBahan.join(', ')}</td>
                  <td className="p-1 border border-slate-300 font-semibold text-emerald-800">{m.kodeSKU || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures Footer */}
          <div className="pt-6 grid grid-cols-2 text-center text-xs">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-bold text-slate-900">Ketua Mabigus / Kepala Sekolah</p>
              <div className="h-16" />
              <p className="font-bold underline text-slate-900">
                {sekolahAktif?.kepalaSekolah || '( .............................................. )'}
              </p>
              <p className="text-[11px] text-slate-500">NIP. {sekolahAktif?.nipKepsek || '...........................................'}</p>
            </div>
            <div>
              <p className="text-slate-600">Disusun oleh,</p>
              <p className="font-bold text-slate-900">Pembina Gugus Depan</p>
              <div className="h-16" />
              <p className="font-bold underline text-slate-900">
                {sekolahAktif?.pembina || '( .............................................. )'}
              </p>
              <p className="text-[11px] text-slate-500">NTA. Gudep {sekolahAktif?.gudep || '...........................................'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )}
</div>
  );
};
