import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  SKU_SIAGA_LENGKAP,
  ButirSkuSiaga,
  TingkatSiaga,
  AreaPengembanganSiaga,
} from '../data/skuSiagaData';
import { Sekolah } from '../types';
import { exportElementToPdf } from '../utils/pdfExport';
import {
  Award,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
  ExternalLink,
  X,
  HeartHandshake,
  Compass,
  Smile,
  Zap,
} from 'lucide-react';

interface SkuSiagaSectionProps {
  sekolahAktif?: Sekolah;
  onPilihSkuUntukJurnal?: (sku: ButirSkuSiaga) => void;
}

export const SkuSiagaSection: React.FC<SkuSiagaSectionProps> = ({
  sekolahAktif,
  onPilihSkuUntukJurnal,
}) => {
  const [selectedTingkat, setSelectedTingkat] = useState<string>('Semua');
  const [selectedArea, setSelectedArea] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSkuDetail, setActiveSkuDetail] = useState<ButirSkuSiaga | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingAllPdf, setIsExportingAllPdf] = useState<boolean>(false);

  const detailPrintRef = useRef<HTMLDivElement>(null);
  const allSkuPrintRef = useRef<HTMLDivElement>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = SKU_SIAGA_LENGKAP.length;
    const mula = SKU_SIAGA_LENGKAP.filter((x) => x.tingkat === 'Mula').length;
    const bantu = SKU_SIAGA_LENGKAP.filter((x) => x.tingkat === 'Bantu').length;
    const tata = SKU_SIAGA_LENGKAP.filter((x) => x.tingkat === 'Tata').length;
    return { total, mula, bantu, tata };
  }, []);

  // Filtered List
  const filteredList = useMemo(() => {
    return SKU_SIAGA_LENGKAP.filter((item) => {
      const matchTingkat = selectedTingkat === 'Semua' || item.tingkat === selectedTingkat;
      const matchArea = selectedArea === 'Semua' || item.area === selectedArea;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.bunyiSku.toLowerCase().includes(q) ||
        item.judulMateri.toLowerCase().includes(q) ||
        item.indikatorPencapaian.toLowerCase().includes(q) ||
        item.panduanPengujian.toLowerCase().includes(q) ||
        item.nomor.toString() === q ||
        `butir ${item.nomor}`.includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.alatBahan.some((a) => a.toLowerCase().includes(q));

      return matchTingkat && matchArea && matchSearch;
    });
  }, [selectedTingkat, selectedArea, searchQuery]);

  // Color helper for Area SESOSIF
  const getAreaBadgeColor = (area: AreaPengembanganSiaga) => {
    switch (area) {
      case 'Spiritual':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'Emosional':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'Sosial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Intelektual':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Fisik':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
    }
  };

  const getTingkatBadgeColor = (tingkat: TingkatSiaga) => {
    switch (tingkat) {
      case 'Mula':
        return 'bg-emerald-600 text-white dark:bg-emerald-700';
      case 'Bantu':
        return 'bg-teal-700 text-white dark:bg-teal-800';
      case 'Tata':
        return 'bg-green-800 text-white dark:bg-green-900';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  // Export Single SKU Module to PDF
  const handleDownloadDetailPdf = async (sku: ButirSkuSiaga) => {
    if (!detailPrintRef.current) return;
    setIsExportingPdf(true);
    try {
      const cleanTitle = sku.judulMateri.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      await exportElementToPdf(detailPrintRef.current, {
        filename: `Modul_SKU_Siaga_${sku.tingkat}_No${sku.nomor}_${cleanTitle}.pdf`,
        orientation: 'portrait',
        marginMm: 10,
        qualityScale: 2,
      });
    } catch (err) {
      console.error('Gagal export PDF SKU Siaga:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export All / Filtered SKU to PDF
  const handleExportAllSkuPdf = async () => {
    if (!allSkuPrintRef.current) return;
    setIsExportingAllPdf(true);
    try {
      const namaBersih = (sekolahAktif?.nama || 'Pramuka').replace(/\s+/g, '_');
      await exportElementToPdf(allSkuPrintRef.current, {
        filename: `Buku_Panduan_SKU_Siaga_Lengkap_${selectedTingkat}_${namaBersih}.pdf`,
        orientation: 'portrait',
        marginMm: 8,
        qualityScale: 2,
      });
    } catch (err) {
      console.error('Gagal export PDF Buku SKU Siaga:', err);
    } finally {
      setIsExportingAllPdf(false);
    }
  };

  // Export SKU to Excel
  const handleExportSkuExcel = () => {
    const wb = XLSX.utils.book_new();
    const namaSekolah = sekolahAktif?.nama?.toUpperCase() || 'PANGKALAN PRAMUKA';
    const gudep = sekolahAktif?.gudep || '00.000';

    const sheetData: any[][] = [
      ['STANDAR SYARAT KECAKAPAN UMUM (SKU) PRAMUKA SIAGA LENGKAP'],
      [`PANGKALAN ${namaSekolah} - GUGUS DEPAN ${gudep}`],
      [`GOLONGAN SIAGA (MULA, BANTU, & TATA) - TOTAL ${filteredList.length} BUTIR KECAKAPAN`],
      [],
      [
        'NO',
        'TINGKAT',
        'BUTIR KE',
        'AREA SESOSIF',
        'BUNYI BUTIR SKU RESMI',
        'JUDUL MATERI LATIHAN',
        'URAIAN MATERI POKOK',
        'PANDUAN PENGUJIAN PEMBINA',
        'INDIKATOR KETERCAPAIAN SISWA',
        'AKTIVITAS PERMAINAN BARUNG',
        'PERLENGKAPAN ALAT & BAHAN',
      ],
    ];

    filteredList.forEach((item, idx) => {
      sheetData.push([
        idx + 1,
        `Siaga ${item.tingkat}`,
        item.nomor,
        item.area,
        item.bunyiSku,
        item.judulMateri,
        item.uraianMateri.join(' | '),
        item.panduanPengujian,
        item.indikatorPencapaian,
        item.aktivitasPermainan,
        item.alatBahan.join(', '),
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
      { wch: 14 },
      { wch: 10 },
      { wch: 16 },
      { wch: 45 },
      { wch: 35 },
      { wch: 55 },
      { wch: 45 },
      { wch: 45 },
      { wch: 40 },
      { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'SKU Siaga Lengkap');
    const filename = `SKU_Siaga_Lengkap_${selectedTingkat}_${(sekolahAktif?.nama || 'Pramuka').replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stat Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Materi Lengkap Sesuai SKU Siaga (100 Butir)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Kurikulum resmi Standar Kecakapan Umum Pramuka Siaga (Mula 34 butir, Bantu 33 butir, Tata 33 butir) dilengkapi materi ajar, panduan pengujian Yanda/Bunda, dan permainan Barung.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isExportingAllPdf}
              onClick={handleExportAllSkuPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Unduh seluruh buku saku panduan SKU Siaga langsung ke file PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingAllPdf ? 'Menyimpan PDF...' : 'Simpan PDF Buku SKU (.pdf)'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportSkuExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-lg shadow-2xs transition-all cursor-pointer"
              title="Ekspor daftar butir SKU ke format Microsoft Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Ekspor Excel SKU (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div
            onClick={() => setSelectedTingkat('Semua')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedTingkat === 'Semua'
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-800 dark:border-slate-700 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total SKU Siaga</span>
              <Award className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-2xl font-black mt-1">{stats.total} Butir</div>
            <span className="text-[10px] opacity-75">Kurikulum Penuh Siaga</span>
          </div>

          <div
            onClick={() => setSelectedTingkat('Mula')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedTingkat === 'Mula'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                : 'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Siaga Mula</span>
              <span className="text-xs font-mono font-bold">1 Manggar</span>
            </div>
            <div className="text-2xl font-black mt-1">{stats.mula} Butir</div>
            <span className="text-[10px] opacity-80">Kecakapan Dasar Tingkat 1</span>
          </div>

          <div
            onClick={() => setSelectedTingkat('Bantu')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedTingkat === 'Bantu'
                ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                : 'bg-teal-50/70 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200 border-teal-200 dark:border-teal-800 hover:border-teal-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Siaga Bantu</span>
              <span className="text-xs font-mono font-bold">2 Manggar</span>
            </div>
            <div className="text-2xl font-black mt-1">{stats.bantu} Butir</div>
            <span className="text-[10px] opacity-80">Kecakapan Madya Tingkat 2</span>
          </div>

          <div
            onClick={() => setSelectedTingkat('Tata')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedTingkat === 'Tata'
                ? 'bg-green-800 text-white border-green-800 shadow-2xs'
                : 'bg-green-50/70 dark:bg-green-950/40 text-green-950 dark:text-green-200 border-green-200 dark:border-green-800 hover:border-green-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Siaga Tata</span>
              <span className="text-xs font-mono font-bold">3 Manggar</span>
            </div>
            <div className="text-2xl font-black mt-1">{stats.tata} Butir</div>
            <span className="text-[10px] opacity-80">Kecakapan Utama Tingkat 3</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari butir SKU (contoh: Butir 6, Simpul, Pancasila)..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-emerald-600 focus:bg-white"
            />
          </div>

          {/* Tingkat Selector */}
          <div>
            <select
              value={selectedTingkat}
              onChange={(e) => setSelectedTingkat(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
            >
              <option value="Semua">Semua Tingkatan Siaga ({stats.total} Butir)</option>
              <option value="Mula">Siaga Mula (34 Butir - 1 Manggar)</option>
              <option value="Bantu">Siaga Bantu (33 Butir - 2 Manggar)</option>
              <option value="Tata">Siaga Tata (33 Butir - 3 Manggar)</option>
            </select>
          </div>

          {/* Area SESOSIF Selector */}
          <div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
            >
              <option value="Semua">Semua Area Pengembangan SESOSIF</option>
              <option value="Spiritual">Spiritual (Agama & Doa)</option>
              <option value="Emosional">Emosional (Dwisatya, Dwidarma, Karakter)</option>
              <option value="Sosial">Sosial (Keluarga, Tetangga, Bangsa)</option>
              <option value="Intelektual">Intelektual (Tekpram, Sandi, Kompas, Rambu)</option>
              <option value="Fisik">Fisik (Olahraga, P3K, Kebersihan, Ketangkasan)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Menampilkan <strong>{filteredList.length}</strong> butir SKU terpilih
          </span>
          {(selectedTingkat !== 'Semua' || selectedArea !== 'Semua' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedTingkat('Semua');
                setSelectedArea('Semua');
                setSearchQuery('');
              }}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Grid of SKU Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Award className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Tidak Ada Butir SKU yang Cocok
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Coba sesuaikan kata kunci pencarian atau ganti pilihan filter tingkatan Siaga dan area.
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-700 transition-all group"
            >
              <div className="space-y-3">
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getTingkatBadgeColor(
                        item.tingkat
                      )}`}
                    >
                      Siaga {item.tingkat}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200">
                      Butir No. {item.nomor}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getAreaBadgeColor(
                        item.area
                      )}`}
                    >
                      {item.area}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    90 Menit
                  </span>
                </div>

                {/* Judul Materi */}
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {item.judulMateri}
                  </h3>
                </div>

                {/* Bunyi Butir SKU Box */}
                <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-700 dark:text-emerald-400 mb-0.5">
                    Bunyi Butir SKU Resmi:
                  </span>
                  "{item.bunyiSku}"
                </div>

                {/* Ringkasan Uraian Pokok */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 block text-[10px] uppercase tracking-wider">
                    Pokok Bahasan Latihan:
                  </span>
                  {item.uraianMateri.slice(0, 2).map((u, i) => (
                    <div key={i} className="flex items-start gap-1.5 truncate">
                      <span className="text-emerald-600 font-bold shrink-0">•</span>
                      <span className="truncate">{u}</span>
                    </div>
                  ))}
                  {item.uraianMateri.length > 2 && (
                    <span className="text-[10px] text-slate-400 italic">
                      +{item.uraianMateri.length - 2} pokok bahasan lainnya...
                    </span>
                  )}
                </div>

                {/* Permainan Khas Siaga Tag */}
                <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">
                    <strong>Permainan:</strong> {item.aktivitasPermainan}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSkuDetail(item)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lihat Modul & Uji</span>
                </button>

                {onPilihSkuUntukJurnal && (
                  <button
                    type="button"
                    onClick={() => onPilihSkuUntukJurnal(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-all cursor-pointer"
                    title="Gunakan butir SKU ini untuk langsung mengisi form Jurnal Latihan"
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

      {/* DETAIL MODAL & DIRECT PDF PRINTER UNTUK BUTIR SKU */}
      {activeSkuDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col text-slate-800 dark:text-slate-100 max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold">
                  <span className="text-lg">⚜</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                      SKU Siaga {activeSkuDetail.tingkat} · Butir No. {activeSkuDetail.nomor}
                    </span>
                    <span className="text-xs text-slate-300">{activeSkuDetail.area}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                    {activeSkuDetail.judulMateri}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveSkuDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Printable Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
              <div
                ref={detailPrintRef}
                className="bg-white p-6 rounded-xl border border-slate-200 space-y-5 text-slate-900 font-sans shadow-xs"
              >
                {/* Printable Document Header */}
                <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-800 block">
                    MODUL PEMBELAJARAN & PANDUAN PENGUJIAN SKU PRAMUKA SIAGA
                  </span>
                  <h2 className="text-lg font-black text-slate-900 uppercase">
                    SIAGA {activeSkuDetail.tingkat.toUpperCase()} - BUTIR NO. {activeSkuDetail.nomor}
                  </h2>
                  <h3 className="text-sm font-bold text-slate-800">
                    {activeSkuDetail.judulMateri}
                  </h3>
                  <div className="flex items-center justify-center gap-3 text-xs text-slate-600 font-medium pt-1">
                    <span>Pangkalan: {sekolahAktif?.nama || 'SD / Pangkalan Gugus Depan'}</span>
                    <span>•</span>
                    <span>Gudep: {sekolahAktif?.gudep || '00.000'}</span>
                    <span>•</span>
                    <span>Area: {activeSkuDetail.area}</span>
                    <span>•</span>
                    <span>Durasi: 90 Menit</span>
                  </div>
                </div>

                {/* 1. Bunyi Butir SKU Resmi */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-700" />
                    Bunyi Butir Syarat Kecakapan Umum (SKU)
                  </h4>
                  <p className="text-xs text-emerald-950 font-semibold bg-emerald-50 p-3 rounded-lg border border-emerald-200 italic">
                    "{activeSkuDetail.bunyiSku}"
                  </p>
                </div>

                {/* 2. Uraian Pokok Bahasan Teori & Praktik */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    Uraian Materi Pembelajaran Siaga
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    {activeSkuDetail.uraianMateri.map((u, i) => (
                      <li key={i} className="leading-relaxed">
                        {u}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Panduan Pengujian Pembina & Indikator Pencapaian */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 space-y-1">
                    <h5 className="font-bold text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Pedoman Pengujian (Yanda/Bunda):
                    </h5>
                    <p className="text-amber-800 leading-relaxed">
                      {activeSkuDetail.panduanPengujian}
                    </p>
                  </div>
                  <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 space-y-1">
                    <h5 className="font-bold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Indikator Ketercapaian Anak:
                    </h5>
                    <p className="text-emerald-800 leading-relaxed">
                      {activeSkuDetail.indikatorPencapaian}
                    </p>
                  </div>
                </div>

                {/* 4. Aktivitas Permainan Barung Ceria & Alat Bahan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200 space-y-1">
                    <h5 className="font-bold text-blue-900 flex items-center gap-1">
                      <Smile className="w-3.5 h-3.5" />
                      Aktivitas Permainan Barung:
                    </h5>
                    <p className="text-blue-800 leading-relaxed">
                      {activeSkuDetail.aktivitasPermainan}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                    <h5 className="font-bold text-slate-900">Perlengkapan Alat & Bahan:</h5>
                    <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                      {activeSkuDetail.alatBahan.map((ab, i) => (
                        <li key={i}>{ab}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 5. Skenario Langkah Latihan 90 Menit */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    Skenario Langkah Latihan Pertemuan (90 Menit)
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3 w-28">Tahapan</th>
                          <th className="py-2 px-3 w-24">Waktu</th>
                          <th className="py-2 px-3">Kegiatan Pelatih & Peserta Didik Siaga</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-900">Pendahuluan</td>
                          <td className="py-2 px-3 text-slate-600 font-mono">15 Menit</td>
                          <td className="py-2 px-3 text-slate-700">
                            Upacara pembukaan latihan formasi lingkaran perindukan Siaga, salam, doa bersama, dan pengantar materi ceria.
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-900">Inti</td>
                          <td className="py-2 px-3 text-slate-600 font-mono">60 Menit</td>
                          <td className="py-2 px-3 text-slate-700">
                            Praktik materi pokok, pelaksanaan permainan barung: <em>{activeSkuDetail.aktivitasPermainan}</em>, dan pengujian butir SKU No.{activeSkuDetail.nomor}.
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-900">Penutup</td>
                          <td className="py-2 px-3 text-slate-600 font-mono">15 Menit</td>
                          <td className="py-2 px-3 text-slate-700">
                            Evaluasi pencapaian kecakapan, tanda tangan paraf buku saku SKU, pesan moral Yanda/Bunda, dan upacara penutupan.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Modul Resmi SKU Siaga Lengkap (SK Kwarnas No. 198/2011)</span>
                  <span>SiPramuka Indonesia</span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                type="button"
                disabled={isExportingPdf}
                onClick={() => handleDownloadDetailPdf(activeSkuDetail)}
                className="inline-flex items-center gap-2 px-3.5 py-2 font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                title="Langsung unduh modul latihan butir SKU ini ke berkas PDF"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingPdf ? 'Menyimpan PDF...' : 'Simpan Langsung PDF (.pdf)'}</span>
              </button>

              <div className="flex items-center gap-2">
                {onPilihSkuUntukJurnal && (
                  <button
                    type="button"
                    onClick={() => {
                      onPilihSkuUntukJurnal(activeSkuDetail);
                      setActiveSkuDetail(null);
                    }}
                    className="px-4 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Ajarkan di Jurnal Latihan</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveSkuDetail(null)}
                  className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINTABLE CONTAINER FOR BULK PDF BUKU SKU SIAGA */}
      <div className="hidden">
        <div
          ref={allSkuPrintRef}
          className="bg-white p-8 text-slate-900 font-sans space-y-5 w-[210mm] min-h-[297mm]"
        >
          {/* Official Document Header */}
          <div className="border-b-4 border-double border-slate-900 pb-3 text-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-800">
              GERAKAN PRAMUKA GUGUS DEPAN {sekolahAktif?.gudep || '00.000'}
            </h4>
            <h2 className="text-lg font-black uppercase text-slate-950 mt-0.5">
              BUKU PANDUAN PENYELESAIAN SYARAT KECAKAPAN UMUM (SKU) PRAMUKA SIAGA
            </h2>
            <p className="text-xs text-slate-700 font-medium">
              Pangkalan: {sekolahAktif?.nama || 'Sekolah'} | Tingkat: {selectedTingkat === 'Semua' ? 'Mula, Bantu, Tata' : `Siaga ${selectedTingkat}`} | Total {filteredList.length} Butir Kecakapan
            </p>
          </div>

          {/* Table of SKU Items */}
          <table className="w-full text-left text-[9px] border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-400">
                <th className="p-1 border border-slate-300 w-6 text-center">No</th>
                <th className="p-1 border border-slate-300 w-14">Tingkat</th>
                <th className="p-1 border border-slate-300 w-14">Area</th>
                <th className="p-1 border border-slate-300 w-48">Bunyi Butir SKU</th>
                <th className="p-1 border border-slate-300 w-36">Judul Materi</th>
                <th className="p-1 border border-slate-300">Panduan Uji Pembina</th>
                <th className="p-1 border border-slate-300 w-32">Indikator Anak</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-1 border border-slate-300 text-center font-bold">{item.nomor}</td>
                  <td className="p-1 border border-slate-300 font-semibold">{item.tingkat}</td>
                  <td className="p-1 border border-slate-300">{item.area}</td>
                  <td className="p-1 border border-slate-300 font-medium">{item.bunyiSku}</td>
                  <td className="p-1 border border-slate-300 font-bold text-slate-900">{item.judulMateri}</td>
                  <td className="p-1 border border-slate-300 text-slate-700">{item.panduanPengujian}</td>
                  <td className="p-1 border border-slate-300 text-slate-600">{item.indikatorPencapaian}</td>
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
              <p className="text-slate-600">Disahkan oleh,</p>
              <p className="font-bold text-slate-900">Pembina Perindukan Siaga</p>
              <div className="h-16" />
              <p className="font-bold underline text-slate-900">
                {sekolahAktif?.pembina || '( .............................................. )'}
              </p>
              <p className="text-[11px] text-slate-500">NTA. Gudep {sekolahAktif?.gudep || '...........................................'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
