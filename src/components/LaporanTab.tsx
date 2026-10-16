import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Sekolah, Siswa, Kegiatan, AbsensiMap, PembayaranHonor } from '../types';
import {
  formatTanggalSaja,
  formatRupiah,
  formatBulanTahunIndo,
} from '../utils/storage';
import {
  exportJurnalToWord,
  exportPresensiToWord,
  exportHonorToWord,
} from '../utils/wordExport';
import { exportElementToPdf } from '../utils/pdfExport';
import { defaultScoutLogo } from '../assets/assetUrls';
import { MainModuleHeader } from './MainModuleHeader';
import {
  Printer,
  FileSpreadsheet,
  FileText,
  Download,
  Building,
  Calendar,
  Users,
  Shield,
  Upload,
  RotateCcw,
  Trash2,
  HelpCircle,
  Copy,
  Check,
  Eye,
  Table,
} from 'lucide-react';

interface LaporanTabProps {
  daftarSekolah: Sekolah[];
  sekolahAktifId: string;
  onSelectSekolahAktif: (id: string) => void;
  siswaList: Siswa[];
  kegiatanList: Kegiatan[];
  absensi: AbsensiMap;
  honorList: PembayaranHonor[];
  onUpdateSekolah?: (sekolah: Sekolah) => void;
}

export const LaporanTab: React.FC<LaporanTabProps> = ({
  daftarSekolah,
  sekolahAktifId,
  onSelectSekolahAktif,
  siswaList,
  kegiatanList,
  absensi,
  honorList,
  onUpdateSekolah,
}) => {
  const [jenisLaporan, setJenisLaporan] = useState<'jurnal' | 'presensi' | 'honor'>('jurnal');
  const [viewMode, setViewMode] = useState<'dokumen' | 'excel_grid'>('dokumen');
  const [selectedBulan, setSelectedBulan] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  const [kotaTtd, setKotaTtd] = useState('Jakarta');
  const [tanggalTtd, setTanggalTtd] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [paperOrientation, setPaperOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Logo Pramuka & Logo Pangkalan references
  const logoPramukaInputRef = useRef<HTMLInputElement>(null);
  const logoPangkalanInputRef = useRef<HTMLInputElement>(null);

  // Selected school
  const sekolah = useMemo(() => {
    return daftarSekolah.find((s) => s.id === sekolahAktifId) || daftarSekolah[0];
  }, [daftarSekolah, sekolahAktifId]);

  // Separate Logo states
  const DEFAULT_LOGO_PRAMUKA = defaultScoutLogo;
  const [logoPramuka, setLogoPramuka] = useState<string>(sekolah?.logoPramukaUrl || DEFAULT_LOGO_PRAMUKA);
  const [logoPangkalan, setLogoPangkalan] = useState<string>(sekolah?.logoPangkalanUrl || sekolah?.logoUrl || '');
  const [showLogoPramuka, setShowLogoPramuka] = useState(true);
  const [showLogoPangkalan, setShowLogoPangkalan] = useState(true);

  // Copy to clipboard notification
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Keep logos in sync when school changes
  React.useEffect(() => {
    setLogoPramuka(sekolah?.logoPramukaUrl || DEFAULT_LOGO_PRAMUKA);
    setLogoPangkalan(sekolah?.logoPangkalanUrl || sekolah?.logoUrl || '');
  }, [sekolah?.id, sekolah?.logoPramukaUrl, sekolah?.logoPangkalanUrl, sekolah?.logoUrl]);

  // List of all pembina in this school
  const listPembinaSekolah = useMemo(() => {
    if (!sekolah) return [];
    return sekolah.daftarPembina && sekolah.daftarPembina.length > 0
      ? sekolah.daftarPembina
      : (sekolah.pembina ? [sekolah.pembina] : []);
  }, [sekolah]);

  // Selected Pembina for Signature
  const [selectedPembinaTtd, setSelectedPembinaTtd] = useState<string>('');
  const pembinaTtd = selectedPembinaTtd || sekolah?.pembina || listPembinaSekolah[0] || 'Pembina Gugus Depan';

  // Students of selected school
  const siswaSekolah = useMemo(() => {
    if (!sekolah) return [];
    return siswaList.filter((s) => s.sekolahId === sekolah.id);
  }, [siswaList, sekolah]);

  // Kegiatan of selected school and month
  const kegiatanBulan = useMemo(() => {
    if (!sekolah) return [];
    return kegiatanList
      .filter((k) => k.sekolahId === sekolah.id && k.tanggal.startsWith(selectedBulan))
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  }, [kegiatanList, sekolah, selectedBulan]);

  // Honor of selected school and month
  const honorBulan = useMemo(() => {
    if (!sekolah) return [];
    return honorList.filter((h) => h.sekolahId === sekolah.id && h.bulan === selectedBulan);
  }, [honorList, sekolah, selectedBulan]);

  // Dates in this month that had attendance
  const allDatesBulan = useMemo(() => {
    if (!sekolah) return [];
    const setD = new Set<string>();
    Object.keys(absensi).forEach((key) => {
      if (key.startsWith(`${sekolah.id}_${selectedBulan}`)) {
        const parts = key.split('_');
        if (parts.length >= 3) {
          setD.add(parts[1]);
        }
      }
    });
    return Array.from(setD).sort();
  }, [absensi, sekolah, selectedBulan]);

  // Print Handler
  const handlePrint = () => {
    if (paperOrientation === 'landscape') {
      document.body.classList.add('print-landscape');
    } else {
      document.body.classList.remove('print-landscape');
    }
    window.focus();
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('print-landscape');
      }, 1000);
    }, 150);
  };

  // 1. Separate Upload Logo Pramuka Handler
  const handleUploadLogoPramuka = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoPramuka(reader.result);
          if (onUpdateSekolah && sekolah) {
            onUpdateSekolah({
              ...sekolah,
              logoPramukaUrl: reader.result,
            });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogoPramuka = () => {
    setLogoPramuka(DEFAULT_LOGO_PRAMUKA);
    if (onUpdateSekolah && sekolah) {
      onUpdateSekolah({
        ...sekolah,
        logoPramukaUrl: DEFAULT_LOGO_PRAMUKA,
      });
    }
  };

  // 2. Separate Upload Logo Pangkalan Handler
  const handleUploadLogoPangkalan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoPangkalan(reader.result);
          if (onUpdateSekolah && sekolah) {
            onUpdateSekolah({
              ...sekolah,
              logoPangkalanUrl: reader.result,
              logoUrl: reader.result,
            });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogoPangkalan = () => {
    setLogoPangkalan('');
    if (onUpdateSekolah && sekolah) {
      onUpdateSekolah({
        ...sekolah,
        logoPangkalanUrl: undefined,
        logoUrl: undefined,
      });
    }
  };

  // Neat & Formatted Excel Exporter
  const handleExportExcelRapi = () => {
    if (!sekolah) return;

    const wb = XLSX.utils.book_new();
    const bulanLabel = formatBulanTahunIndo(selectedBulan).toUpperCase();
    const dateTtdLabel = formatTanggalSaja(tanggalTtd);

    if (jenisLaporan === 'jurnal') {
      const sheetData: any[][] = [
        ['LAPORAN JURNAL KEGIATAN & MATERI LATIHAN PRAMUKA'],
        [`PANGKALAN ${sekolah.nama.toUpperCase()} - GUGUS DEPAN ${sekolah.gudep || '00.000'}`],
        [`BULAN: ${bulanLabel} | ALAMAT: ${sekolah.alamat || '-'} | GOLONGAN: ${sekolah.tingkat}`],
        [],
        ['NO', 'TANGGAL', 'MATERI POKOK / BAHASAN LATIHAN', 'KATEGORI', 'PESERTA HADIR', 'PELATIH BERTUGAS', 'STATUS', 'CATATAN / EVALUASI'],
      ];

      let totalPeserta = 0;
      if (kegiatanBulan.length === 0) {
        sheetData.push(['-', 'Tidak ada catatan latihan pada periode ini', '-', '-', 0, '-', '-', '-']);
      } else {
        kegiatanBulan.forEach((k, idx) => {
          totalPeserta += k.peserta || 0;
          sheetData.push([
            idx + 1,
            formatTanggalSaja(k.tanggal),
            k.materi,
            k.kategoriMateri,
            k.peserta,
            k.pelatih,
            k.statusPelaksanaan,
            k.catatan || k.kendala || '-',
          ]);
        });
      }

      // Summary Total Row
      sheetData.push([]);
      sheetData.push(['', 'TOTAL LATIHAN TERLAKSANA', `${kegiatanBulan.length} Sesi`, '', `TOTAL: ${totalPeserta} Peserta`, '', '', '']);
      sheetData.push([]);

      // Signatures
      sheetData.push(['', '', '', '', '', `${kotaTtd}, ${dateTtdLabel}`]);
      sheetData.push(['Mengetahui,', '', '', '', '', 'Pembina Gugus Depan,']);
      sheetData.push(['Ketua Mabigus / Kepala Sekolah', '', '', '', '', 'Pelatih Bertugas']);
      sheetData.push([]);
      sheetData.push([]);
      sheetData.push([sekolah.kepalaSekolah || '( .............................................. )', '', '', '', '', pembinaTtd]);
      sheetData.push([`NIP. ${sekolah.nipKepsek || '...........................................'}`, '', '', '', '', `Gudep ${sekolah.gudep || ''}`]);

      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      // Merges for header titles
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
      ];

      // Accurate column widths
      ws['!cols'] = [
        { wch: 6 },
        { wch: 18 },
        { wch: 45 },
        { wch: 16 },
        { wch: 16 },
        { wch: 28 },
        { wch: 16 },
        { wch: 40 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Jurnal Latihan');
      XLSX.writeFile(wb, `Laporan_Jurnal_${sekolah.nama.replace(/\s+/g, '_')}_${selectedBulan}.xlsx`);
    } else if (jenisLaporan === 'presensi') {
      const sheetData: any[][] = [
        ['REKAPITULASI PRESENSI / KEHADIRAN ANGGOTA PRAMUKA'],
        [`PANGKALAN ${sekolah.nama.toUpperCase()} - GUGUS DEPAN ${sekolah.gudep || '00.000'}`],
        [`BULAN: ${bulanLabel} | JUMLAH PERTEMUAN BULAN INI: ${allDatesBulan.length} SESI`],
        [],
        ['NO', 'NAMA ANGGOTA PRAMUKA', 'KELAS', 'REGU / BARUNG', 'HADIR (H)', 'IZIN (I)', 'SAKIT (S)', 'ALPA (A)', 'PERSENTASE (%)'],
      ];

      if (siswaSekolah.length === 0) {
        sheetData.push(['-', 'Belum ada data anggota terdaftar', '-', '-', 0, 0, 0, 0, '0%']);
      } else {
        siswaSekolah.forEach((s, idx) => {
          let h = 0;
          let i = 0;
          let sk = 0;
          let a = 0;

          allDatesBulan.forEach((d) => {
            const stat = absensi[`${sekolah.id}_${d}_${s.id}`];
            if (stat === 'H') h++;
            else if (stat === 'I') i++;
            else if (stat === 'S') sk++;
            else if (stat === 'A') a++;
          });

          const totalSesi = allDatesBulan.length;
          const pct = totalSesi > 0 ? Math.round((h / totalSesi) * 100) : 0;

          sheetData.push([idx + 1, s.nama, s.kelas, s.regu || '-', h, i, sk, a, `${pct}%`]);
        });
      }

      sheetData.push([]);
      sheetData.push(['', '', '', '', '', '', `${kotaTtd}, ${dateTtdLabel}`]);
      sheetData.push(['Mengetahui,', '', '', '', '', '', 'Pembina Gugus Depan,']);
      sheetData.push(['Ketua Mabigus / Kepala Sekolah', '', '', '', '', '', 'Pelatih Bertugas']);
      sheetData.push([]);
      sheetData.push([]);
      sheetData.push([sekolah.kepalaSekolah || '( .............................................. )', '', '', '', '', '', pembinaTtd]);
      sheetData.push([`NIP. ${sekolah.nipKepsek || '...........................................'}`, '', '', '', '', '', `Gudep ${sekolah.gudep || ''}`]);

      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
      ];

      ws['!cols'] = [
        { wch: 6 },
        { wch: 30 },
        { wch: 12 },
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 16 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Presensi');
      XLSX.writeFile(wb, `Laporan_Presensi_${sekolah.nama.replace(/\s+/g, '_')}_${selectedBulan}.xlsx`);
    } else if (jenisLaporan === 'honor') {
      let grandTotal = 0;
      const sheetData: any[][] = [
        ['DAFTAR REKAPITULASI HONORARIUM PELATIH PRAMUKA'],
        [`PANGKALAN ${sekolah.nama.toUpperCase()} - GUGUS DEPAN ${sekolah.gudep || '00.000'}`],
        [`BULAN: ${bulanLabel} | TARIF BAKU: ${formatRupiah(sekolah.honorPerPertemuan || 0)} / SESI`],
        [],
        ['NO', 'NAMA PEMBINA / PELATIH', 'JUMLAH SESI', 'TARIF / SESI (RP)', 'TOTAL HONOR (RP)', 'STATUS BAYAR', 'TANGGAL BAYAR', 'CATATAN'],
      ];

      if (honorBulan.length === 0) {
        sheetData.push(['-', 'Belum ada data honor pada bulan ini', 0, 0, 0, '-', '-', '-']);
      } else {
        honorBulan.forEach((h, idx) => {
          grandTotal += h.totalHonor;
          sheetData.push([
            idx + 1,
            h.pelatih,
            h.jumlahPertemuan,
            h.tarifPerPertemuan,
            h.totalHonor,
            h.statusBayar,
            h.tanggalBayar ? formatTanggalSaja(h.tanggalBayar) : '-',
            h.catatan || '-',
          ]);
        });
        sheetData.push([]);
        sheetData.push(['', 'TOTAL KESELURUHAN DANA HONOR', '', '', grandTotal, '', '', '']);
      }

      sheetData.push([]);
      sheetData.push(['', '', '', '', '', `${kotaTtd}, ${dateTtdLabel}`]);
      sheetData.push(['Mengetahui,', '', '', '', '', 'Penerima Honor,']);
      sheetData.push(['Ketua Mabigus / Kepala Sekolah', '', '', '', '', 'Pembina / Pelatih']);
      sheetData.push([]);
      sheetData.push([]);
      sheetData.push([sekolah.kepalaSekolah || '( .............................................. )', '', '', '', '', pembinaTtd]);
      sheetData.push([`NIP. ${sekolah.nipKepsek || '...........................................'}`, '', '', '', '', '']);

      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
      ];

      ws['!cols'] = [
        { wch: 6 },
        { wch: 30 },
        { wch: 15 },
        { wch: 22 },
        { wch: 22 },
        { wch: 18 },
        { wch: 18 },
        { wch: 35 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Honor');
      XLSX.writeFile(wb, `Laporan_Honor_${sekolah.nama.replace(/\s+/g, '_')}_${selectedBulan}.xlsx`);
    }
  };

  // 1-Click Copy Formatted Table to Clipboard for instant Paste into Excel / Google Sheets
  const handleCopyTableToClipboard = () => {
    let tsv = '';
    if (jenisLaporan === 'jurnal') {
      tsv += 'No\tTanggal\tMateri Latihan\tKategori\tPeserta Hadir\tPelatih Bertugas\tStatus\tCatatan\n';
      kegiatanBulan.forEach((k, i) => {
        tsv += `${i + 1}\t${formatTanggalSaja(k.tanggal)}\t${k.materi}\t${k.kategoriMateri}\t${k.peserta}\t${k.pelatih}\t${k.statusPelaksanaan}\t${k.catatan || k.kendala || '-'}\n`;
      });
    } else if (jenisLaporan === 'presensi') {
      tsv += 'No\tNama Anggota\tKelas\tRegu\tHadir (H)\tIzin (I)\tSakit (S)\tAlpa (A)\tKehadiran (%)\n';
      siswaSekolah.forEach((s, i) => {
        let h = 0, iz = 0, sk = 0, a = 0;
        allDatesBulan.forEach((d) => {
          const stat = absensi[`${sekolah.id}_${d}_${s.id}`];
          if (stat === 'H') h++;
          else if (stat === 'I') iz++;
          else if (stat === 'S') sk++;
          else if (stat === 'A') a++;
        });
        const pct = allDatesBulan.length > 0 ? Math.round((h / allDatesBulan.length) * 100) : 0;
        tsv += `${i + 1}\t${s.nama}\t${s.kelas}\t${s.regu || '-'}\t${h}\t${iz}\t${sk}\t${a}\t${pct}%\n`;
      });
    } else if (jenisLaporan === 'honor') {
      tsv += 'No\tNama Pelatih\tJumlah Sesi\tTarif / Sesi\tTotal Honor\tStatus\tTanggal Bayar\tCatatan\n';
      honorBulan.forEach((h, i) => {
        tsv += `${i + 1}\t${h.pelatih}\t${h.jumlahPertemuan}\t${h.tarifPerPertemuan}\t${h.totalHonor}\t${h.statusBayar}\t${h.tanggalBayar || '-'}\t${h.catatan || '-'}\n`;
      });
    }

    navigator.clipboard.writeText(tsv).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 3000);
    });
  };

  // Word Document (.doc) Exporter
  const handleExportWordDoc = () => {
    if (!sekolah) return;
    if (jenisLaporan === 'jurnal') {
      exportJurnalToWord(sekolah, kegiatanBulan, selectedBulan, kotaTtd, tanggalTtd, pembinaTtd);
    } else if (jenisLaporan === 'presensi') {
      exportPresensiToWord(
        sekolah,
        siswaSekolah,
        absensi,
        allDatesBulan,
        selectedBulan,
        kotaTtd,
        tanggalTtd,
        pembinaTtd
      );
    } else if (jenisLaporan === 'honor') {
      exportHonorToWord(sekolah, honorBulan, selectedBulan, kotaTtd, tanggalTtd, pembinaTtd);
    }
  };

  // Direct PDF Exporter (Saves instantly as .pdf file)
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleDirectExportPdf = async () => {
    if (!sekolah) return;
    const reportEl = document.getElementById('printable-report');
    if (!reportEl) return;

    setIsExportingPdf(true);
    try {
      const namaBersih = sekolah.nama.replace(/\s+/g, '_');
      const filename = `Laporan_${jenisLaporan.toUpperCase()}_${namaBersih}_${selectedBulan}.pdf`;
      await exportElementToPdf(reportEl, {
        filename,
        orientation: paperOrientation,
        marginMm: 8,
        qualityScale: 2,
      });
    } catch (err) {
      console.error('Gagal export PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Utama Modul Laporan Resmi A4 (Red) */}
      <div className="no-print">
        <MainModuleHeader
          tabId="laporan"
          customBadges={[
            { label: 'Format Standar A4 Resmi', icon: FileText },
            { label: 'Kop Pangkalan & Tanda Tangan Mabigus', icon: Shield },
            { label: 'Ekspor PDF, Word, & Excel', icon: Download },
          ]}
          rightAction={
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDirectExportPdf}
                disabled={isExportingPdf}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-md border border-white/20 cursor-pointer transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-rose-200" />
                <span>{isExportingPdf ? 'Mengekspor...' : 'Cetak PDF'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-950 bg-rose-200 hover:bg-rose-100 rounded-xl shadow-md cursor-pointer transition-all border border-rose-300"
              >
                <Printer className="w-4 h-4 text-rose-900" />
                <span>Print Laporan</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Controls Bar (Hidden during print) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 no-print space-y-4 shadow-2xs text-slate-800 dark:text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Cetak & Ekspor Laporan Resmi</h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded border border-emerald-200 dark:border-emerald-800">
                PDF · Word · Excel · A4
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simpan langsung dalam bentuk PDF (.pdf), ekspor ke Microsoft Word (.doc), atau unduh Microsoft Excel (.xlsx) dengan tabel rapi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* DIRECT PDF DOWNLOAD BUTTON */}
            <button
              onClick={handleDirectExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-2xs cursor-pointer transition-all disabled:opacity-50"
              title="Cetak langsung tersimpan dalam format berkas PDF (.pdf) tanpa perlu buka dialog printer"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'Menyimpan PDF...' : 'Simpan PDF (.pdf)'}</span>
            </button>

            {/* WORD EXPORT BUTTON */}
            <button
              onClick={handleExportWordDoc}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-300 dark:border-blue-800 rounded-lg shadow-2xs cursor-pointer transition-all"
              title="Unduh berkas dokumen Microsoft Word (.doc) yang dapat langsung diedit di MS Word / WPS / Google Docs"
            >
              <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>Ekspor Word (.doc)</span>
            </button>

            {/* COPY TO CLIPBOARD FOR EXCEL */}
            <button
              onClick={handleCopyTableToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer transition-all"
              title="Salin tabel agar bisa langsung di-Paste (Ctrl+V) ke Excel atau Google Sheets"
            >
              {copyFeedback ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copyFeedback ? 'Tersalin ke Clipboard!' : 'Salin ke Excel'}</span>
            </button>

            {/* EXCEL EXPORT BUTTON RAPI */}
            <button
              onClick={handleExportExcelRapi}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-100/80 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-lg shadow-2xs cursor-pointer transition-all"
              title="Unduh laporan rapi berformat Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>

            {/* A4 PRINT BUTTON */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg shadow-sm cursor-pointer transition-all"
              title="Cetak dokumen resmi ke format kertas A4 (Print / Simpan ke PDF)"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak A4 (Print)</span>
            </button>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Pangkalan Sekolah</label>
            <select
              value={sekolahAktifId}
              onChange={(e) => {
                onSelectSekolahAktif(e.target.value);
                setSelectedPembinaTtd('');
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
            >
              {daftarSekolah.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.tingkat})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Jenis Dokumen Laporan</label>
            <select
              value={jenisLaporan}
              onChange={(e) => setJenisLaporan(e.target.value as any)}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-white"
            >
              <option value="jurnal">1. Jurnal Latihan & Materi</option>
              <option value="presensi">2. Rekapitulasi Presensi Siswa</option>
              <option value="honor">3. Rekapitulasi Honorarium Pelatih</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Periode Bulan</label>
            <input
              type="month"
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Pembina Penandatangan</label>
            <select
              value={selectedPembinaTtd || pembinaTtd}
              onChange={(e) => setSelectedPembinaTtd(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
            >
              {listPembinaSekolah.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2 SEPARATE LOGO UPLOAD SECTIONS (LOGO PRAMUKA & LOGO PANGKALAN) */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs space-y-3">
          <div className="font-semibold text-slate-800 flex items-center justify-between border-b border-slate-200 pb-2">
            <span>Pengaturan & Upload Logo Kop Surat (Terpisah)</span>
            <span className="text-[11px] font-normal text-slate-500">Logo otomatis tersimpan untuk pangkalan ini</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LOGO 1: LOGO GERAKAN PRAMUKA (KIRI) */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-3 shadow-2xs">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-slate-900 block">1. Logo Pramuka (Sisi Kiri)</label>
                  <label className="inline-flex items-center gap-1 cursor-pointer text-[11px] text-slate-600">
                    <input
                      type="checkbox"
                      checked={showLogoPramuka}
                      onChange={(e) => setShowLogoPramuka(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-700"
                    />
                    <span>Aktif</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  Lambang resmi Tunas Kelapa Gerakan Pramuka. Anda dapat mengganti dengan logo kontingen/kwartir kustom.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="file"
                    ref={logoPramukaInputRef}
                    accept="image/*"
                    onChange={handleUploadLogoPramuka}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoPramukaInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md cursor-pointer transition-colors"
                  >
                    <Upload className="w-3 h-3 text-slate-600" />
                    <span>Upload Logo Pramuka</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetLogoPramuka}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer"
                    title="Kembalikan ke lambang Tunas Kelapa standar"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Preview Logo Pramuka */}
              <div className="w-14 h-14 rounded border border-slate-200 p-1 bg-white flex items-center justify-center shrink-0">
                {logoPramuka ? (
                  <img src={logoPramuka} alt="Preview Logo Pramuka" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] text-slate-400">Kosong</span>
                )}
              </div>
            </div>

            {/* LOGO 2: LOGO PANGKALAN / SEKOLAH (KANAN) */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-3 shadow-2xs">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-slate-900 block">2. Logo Pangkalan (Sisi Kanan)</label>
                  <label className="inline-flex items-center gap-1 cursor-pointer text-[11px] text-slate-600">
                    <input
                      type="checkbox"
                      checked={showLogoPangkalan}
                      onChange={(e) => setShowLogoPangkalan(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-700"
                    />
                    <span>Aktif</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  Logo resmi sekolah atau pangkalan gudep Anda (atau lambang WOSM sedunia jika belum diunggah).
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="file"
                    ref={logoPangkalanInputRef}
                    accept="image/*"
                    onChange={handleUploadLogoPangkalan}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoPangkalanInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md cursor-pointer transition-colors"
                  >
                    <Upload className="w-3 h-3 text-slate-600" />
                    <span>{logoPangkalan ? 'Ganti Logo Pangkalan' : 'Upload Logo Pangkalan'}</span>
                  </button>
                  {logoPangkalan && (
                    <button
                      type="button"
                      onClick={handleRemoveLogoPangkalan}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                      title="Hapus logo pangkalan"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Logo Pangkalan */}
              <div className="w-14 h-14 rounded border border-slate-200 p-1 bg-white flex items-center justify-center shrink-0">
                {logoPangkalan ? (
                  <img src={logoPangkalan} alt="Preview Logo Pangkalan" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full rounded-full bg-indigo-950 text-white flex items-center justify-center text-[9px] font-bold">
                    WOSM
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* View Mode & A4 Paper Orientation Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs items-center">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Mode:</span>
            <div className="inline-flex p-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('dokumen')}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer ${
                  viewMode === 'dokumen'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                📄 Dokumen Kop A4
              </button>
              <button
                type="button"
                onClick={() => setViewMode('excel_grid')}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer ${
                  viewMode === 'excel_grid'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                📊 Tabel Excel
              </button>
            </div>
          </div>

          {/* Paper Orientation Toggle */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Arah Kertas:</span>
            <div className="inline-flex p-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setPaperOrientation('portrait')}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer ${
                  paperOrientation === 'portrait'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                A4 Portrait (Tegak)
              </button>
              <button
                type="button"
                onClick={() => setPaperOrientation('landscape')}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer ${
                  paperOrientation === 'landscape'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                A4 Landscape (Mendatar)
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700 dark:text-slate-300">Kota Dokumen</label>
            <input
              type="text"
              value={kotaTtd}
              onChange={(e) => setKotaTtd(e.target.value)}
              placeholder="Contoh: Jakarta"
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700 dark:text-slate-300">Tanggal Pengesahan</label>
            <input
              type="date"
              value={tanggalTtd}
              onChange={(e) => setTanggalTtd(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: DOKUMEN RESMI KOP A4 DENGAN DUA LOGO TERPISAH          */}
      {/* ============================================================== */}
      {viewMode === 'dokumen' && (
        <div className="space-y-3">
          {/* A4 Paper Badge Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs no-print text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-semibold text-[11px]">
                📄 Ukuran Kertas Cetak: A4 ({paperOrientation === 'portrait' ? '210 × 297 mm · Tegak' : '297 × 210 mm · Mendatar'})
              </span>
              <span className="hidden sm:inline">· Standar Surat Resmi Gugus Depan Pramuka</span>
            </div>
            <span className="text-[11px] text-slate-500">Margin Cetak: 12mm · Format Tinta Hitam Resmi</span>
          </div>

          {/* Desktop Preview Desk Area */}
          <div className="p-2 sm:p-6 bg-slate-200/60 dark:bg-slate-950/70 rounded-2xl border border-slate-300 dark:border-slate-800/80 flex justify-center shadow-inner">
            <div
              id="printable-report"
              className={`bg-white rounded-xl border border-slate-300 p-6 sm:p-12 shadow-xl text-slate-900 print-clean transition-all ${
                paperOrientation === 'landscape' ? 'w-full max-w-[297mm]' : 'w-full max-w-[210mm]'
              }`}
            >
          {/* KOP SURAT RESMI: LOGO PRAMUKA (KIRI), TEKS (TENGAH), LOGO PANGKALAN (KANAN) */}
          <div className="border-b-4 border-double border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              {/* SISI KIRI: LOGO PRAMUKA */}
              {showLogoPramuka ? (
                <div className="shrink-0 flex flex-col items-center justify-center w-20 sm:w-24 text-center">
                  <img
                    src={logoPramuka || DEFAULT_LOGO_PRAMUKA}
                    alt="Logo Gerakan Pramuka"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-md"
                  />
                  <span className="text-[9px] font-bold text-slate-800 tracking-tighter uppercase mt-1">
                    Gerakan Pramuka
                  </span>
                </div>
              ) : (
                <div className="w-16 h-16 shrink-0" />
              )}

              {/* BAGIAN TENGAH: TEKS KOP SURAT */}
              <div className="text-center flex-1 px-2">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-800">
                  GERAKAN PRAMUKA GUGUS DEPAN {sekolah?.gudep || '00.000'}
                </h4>
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-slate-950 mt-0.5">
                  PANGKALAN {sekolah?.nama?.toUpperCase()}
                </h2>
                <p className="text-xs text-slate-700 mt-1 font-medium">
                  {sekolah?.alamat || 'Jalan Pendidikan Indonesia'}
                </p>
                {/* TULISAN 'HARI' TELAH DIHAPUS */}
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Waktu Latihan: <strong>{sekolah?.jamLatihan || '-'}</strong> · Golongan:{' '}
                  <strong>
                    {sekolah?.tingkat === 'SD' ? 'Siaga' : sekolah?.tingkat === 'SMP' ? 'Penggalang' : 'Penegak'}
                  </strong>
                </p>
              </div>

              {/* SISI KANAN: LOGO PANGKALAN / SEKOLAH */}
              {showLogoPangkalan ? (
                <div className="shrink-0 flex flex-col items-center justify-center w-20 sm:w-24 text-center">
                  {logoPangkalan ? (
                    <>
                      <img
                        src={logoPangkalan}
                        alt="Logo Pangkalan Sekolah"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-md"
                      />
                      <span className="text-[9px] font-bold text-slate-800 tracking-tighter uppercase mt-1">
                        Pangkalan
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-900 text-white flex items-center justify-center shadow-xs p-2">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="currentColor">
                          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="6 3" />
                          <path
                            d="M50 14 C48 28 42 38 32 44 C26 47 22 52 24 58 C26 64 34 65 38 60 C42 56 46 50 50 42 C54 50 58 56 62 60 C66 65 74 64 76 58 C78 52 74 47 68 44 C58 38 52 28 50 14 Z"
                            fill="currentColor"
                          />
                          <path
                            d="M50 44 L50 82 M40 68 L60 68"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                          <circle cx="34" cy="52" r="3" fill="#fbbf24" />
                          <circle cx="66" cy="52" r="3" fill="#fbbf24" />
                        </svg>
                      </div>
                      <span className="text-[9px] font-bold text-slate-800 tracking-tighter uppercase mt-1">
                        WOSM Scout
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-16 h-16 shrink-0" />
              )}
            </div>
          </div>

          {/* JUDUL LAPORAN RESMI */}
          <div className="text-center my-5">
            <h3 className="text-base sm:text-lg font-bold underline uppercase tracking-wide text-slate-950">
              {jenisLaporan === 'jurnal' && 'LAPORAN JURNAL KEGIATAN & MATERI LATIHAN PRAMUKA'}
              {jenisLaporan === 'presensi' && 'REKAPITULASI PRESENSI / KEHADIRAN ANGGOTA PRAMUKA'}
              {jenisLaporan === 'honor' && 'DAFTAR REKAPITULASI HONORARIUM PELATIH PRAMUKA'}
            </h3>
            <p className="text-xs text-slate-700 mt-1 font-semibold">
              BULAN: {formatBulanTahunIndo(selectedBulan).toUpperCase()}
            </p>
          </div>

          {/* KONTEN JURNAL LATIHAN */}
          {jenisLaporan === 'jurnal' && (
            <div className="my-5 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs border border-slate-900">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900 font-bold text-center text-slate-900">
                    <th className="p-2 border-r border-slate-900 w-10">No</th>
                    <th className="p-2 border-r border-slate-900 w-28">Tanggal</th>
                    <th className="p-2 border-r border-slate-900">Materi Pokok / Bahasan Latihan</th>
                    <th className="p-2 border-r border-slate-900 w-24">Kategori</th>
                    <th className="p-2 border-r border-slate-900 w-16">Peserta</th>
                    <th className="p-2 border-r border-slate-900 w-36">Pelatih Bertugas</th>
                    <th className="p-2">Evaluasi / Capaian</th>
                  </tr>
                </thead>
                <tbody>
                  {kegiatanBulan.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                        Tidak ada catatan latihan pramuka pada bulan {formatBulanTahunIndo(selectedBulan)}.
                      </td>
                    </tr>
                  ) : (
                    kegiatanBulan.map((k, idx) => (
                      <tr key={k.id} className="border-b border-slate-400">
                        <td className="p-2 border-r border-slate-900 text-center font-mono">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-900 text-slate-900 font-medium whitespace-nowrap">
                          {formatTanggalSaja(k.tanggal)}
                        </td>
                        <td className="p-2 border-r border-slate-900 font-semibold text-slate-950">{k.materi}</td>
                        <td className="p-2 border-r border-slate-900 text-center">{k.kategoriMateri}</td>
                        <td className="p-2 border-r border-slate-900 text-center font-bold tabular-nums">
                          {k.peserta} org
                        </td>
                        <td className="p-2 border-r border-slate-900 font-medium">{k.pelatih}</td>
                        <td className="p-2 text-slate-800">
                          {k.catatan || k.kendala || k.statusPelaksanaan}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* KONTEN PRESENSI SISWA */}
          {jenisLaporan === 'presensi' && (
            <div className="my-5 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs border border-slate-900">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900 font-bold text-center text-slate-900">
                    <th className="p-2 border-r border-slate-900 w-10">No</th>
                    <th className="p-2 border-r border-slate-900 text-left">Nama Anggota</th>
                    <th className="p-2 border-r border-slate-900 w-16">Kelas</th>
                    <th className="p-2 border-r border-slate-900 w-28">Regu / Barung</th>
                    <th className="p-2 border-r border-slate-900 w-12">H</th>
                    <th className="p-2 border-r border-slate-900 w-12">I</th>
                    <th className="p-2 border-r border-slate-900 w-12">S</th>
                    <th className="p-2 border-r border-slate-900 w-12">A</th>
                    <th className="p-2 w-24">Kehadiran (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {siswaSekolah.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-500 italic">
                        Belum ada data anggota terdaftar.
                      </td>
                    </tr>
                  ) : (
                    siswaSekolah.map((s, idx) => {
                      let h = 0;
                      let i = 0;
                      let sk = 0;
                      let a = 0;

                      allDatesBulan.forEach((d) => {
                        const stat = absensi[`${sekolah.id}_${d}_${s.id}`];
                        if (stat === 'H') h++;
                        else if (stat === 'I') i++;
                        else if (stat === 'S') sk++;
                        else if (stat === 'A') a++;
                      });

                      const totalSesi = allDatesBulan.length;
                      const pct = totalSesi > 0 ? Math.round((h / totalSesi) * 100) : 0;

                      return (
                        <tr key={s.id} className="border-b border-slate-400">
                          <td className="p-2 border-r border-slate-900 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-900 font-semibold text-slate-950">{s.nama}</td>
                          <td className="p-2 border-r border-slate-900 text-center">{s.kelas}</td>
                          <td className="p-2 border-r border-slate-900">{s.regu || '-'}</td>
                          <td className="p-2 border-r border-slate-900 text-center font-bold">{h}</td>
                          <td className="p-2 border-r border-slate-900 text-center">{i}</td>
                          <td className="p-2 border-r border-slate-900 text-center">{sk}</td>
                          <td className="p-2 border-r border-slate-900 text-center">{a}</td>
                          <td className="p-2 text-right font-bold tabular-nums">{pct}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* KONTEN HONORARIUM */}
          {jenisLaporan === 'honor' && (
            <div className="my-5 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs border border-slate-900">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900 font-bold text-center text-slate-900">
                    <th className="p-2 border-r border-slate-900 w-10">No</th>
                    <th className="p-2 border-r border-slate-900 text-left">Nama Pembina / Pelatih</th>
                    <th className="p-2 border-r border-slate-900 w-24">Jumlah Sesi</th>
                    <th className="p-2 border-r border-slate-900 text-right w-32">Tarif / Sesi</th>
                    <th className="p-2 border-r border-slate-900 text-right w-36">Jumlah Diterima</th>
                    <th className="p-2 border-r border-slate-900 w-24">Status</th>
                    <th className="p-2 w-36">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody>
                  {honorBulan.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                        Belum ada data honor yang dicatat pada bulan {formatBulanTahunIndo(selectedBulan)}.
                      </td>
                    </tr>
                  ) : (
                    honorBulan.map((h, idx) => (
                      <tr key={h.id} className="border-b border-slate-400">
                        <td className="p-2.5 border-r border-slate-900 text-center font-mono">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-900 font-semibold text-slate-950">{h.pelatih}</td>
                        <td className="p-2.5 border-r border-slate-900 text-center font-bold tabular-nums">
                          {h.jumlahPertemuan} Sesi
                        </td>
                        <td className="p-2.5 border-r border-slate-900 text-right tabular-nums">
                          {formatRupiah(h.tarifPerPertemuan)}
                        </td>
                        <td className="p-2.5 border-r border-slate-900 text-right font-bold tabular-nums">
                          {formatRupiah(h.totalHonor)}
                        </td>
                        <td className="p-2.5 border-r border-slate-900 text-center font-medium">
                          {h.statusBayar}
                        </td>
                        <td className="p-2.5 text-center text-slate-400">........................</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TANDA TANGAN RESMI PENGESAHAN */}
          <div className="mt-12 pt-6 text-xs text-slate-900 print-break-inside-avoid">
            <div className="flex justify-end mb-2">
              <p className="font-medium text-slate-800">
                {kotaTtd}, {formatTanggalSaja(tanggalTtd)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-center mt-4">
              <div>
                <p className="font-semibold text-slate-800">Mengetahui,</p>
                <p className="font-bold text-slate-950">Ketua Mabigus / Kepala Sekolah</p>
                <div className="h-20" />
                <p className="font-bold text-slate-950 underline uppercase text-sm">
                  {sekolah?.kepalaSekolah || '( .............................................. )'}
                </p>
                <p className="text-[11px] text-slate-700 mt-0.5">
                  NIP. {sekolah?.nipKepsek || '...........................................'}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-800">Pembina Gugus Depan,</p>
                <p className="font-bold text-slate-950">Pelatih / Pembina yang Bertugas</p>
                <div className="h-20" />
                <p className="font-bold text-slate-950 underline uppercase text-sm">
                  {pembinaTtd}
                </p>
                <p className="text-[11px] text-slate-700 mt-0.5">Pembina Gudep {sekolah?.gudep}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: PRATINJAU FORMAT LEMBAR EXCEL (GRID SPREADSHEET RAPI)  */}
      {/* ============================================================== */}
      {viewMode === 'excel_grid' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 p-6 shadow-sm overflow-x-auto text-xs font-mono text-slate-800 dark:text-slate-100">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Pratinjau Tata Letak Format Excel (.xlsx)
              </h3>
            </div>
            <button
              onClick={handleExportExcelRapi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg cursor-pointer font-sans"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Unduh Berkas Excel (.xlsx) Ini</span>
            </button>
          </div>

          <div className="border border-slate-300 bg-slate-50 p-4 rounded-lg space-y-4 text-slate-800">
            {/* Header Title Excel */}
            <div className="text-center font-bold text-sm bg-emerald-50/80 p-2 border border-emerald-200 rounded">
              {jenisLaporan === 'jurnal' && 'LAPORAN JURNAL KEGIATAN & MATERI LATIHAN PRAMUKA'}
              {jenisLaporan === 'presensi' && 'REKAPITULASI PRESENSI / KEHADIRAN ANGGOTA PRAMUKA'}
              {jenisLaporan === 'honor' && 'DAFTAR REKAPITULASI HONORARIUM PELATIH PRAMUKA'}
              <div className="text-xs font-normal text-slate-600 mt-1">
                Pangkalan: {sekolah?.nama} | Gudep: {sekolah?.gudep} | Bulan: {formatBulanTahunIndo(selectedBulan)}
              </div>
            </div>

            {/* Grid Table Preview */}
            <div className="overflow-x-auto bg-white border border-slate-300">
              {jenisLaporan === 'jurnal' && (
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-emerald-800 text-white font-semibold">
                      <th className="p-2 border border-slate-400 text-center w-10">NO</th>
                      <th className="p-2 border border-slate-400 w-28">TANGGAL</th>
                      <th className="p-2 border border-slate-400">MATERI LATIHAN</th>
                      <th className="p-2 border border-slate-400 w-20">KATEGORI</th>
                      <th className="p-2 border border-slate-400 text-center w-24">PESERTA</th>
                      <th className="p-2 border border-slate-400 w-32">PELATIH</th>
                      <th className="p-2 border border-slate-400 w-20">STATUS</th>
                      <th className="p-2 border border-slate-400">CATATAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kegiatanBulan.map((k, i) => (
                      <tr key={k.id} className="hover:bg-slate-50">
                        <td className="p-2 border border-slate-300 text-center">{i + 1}</td>
                        <td className="p-2 border border-slate-300">{formatTanggalSaja(k.tanggal)}</td>
                        <td className="p-2 border border-slate-300 font-sans font-medium">{k.materi}</td>
                        <td className="p-2 border border-slate-300 text-center">{k.kategoriMateri}</td>
                        <td className="p-2 border border-slate-300 text-center tabular-nums">{k.peserta} Orang</td>
                        <td className="p-2 border border-slate-300 font-sans">{k.pelatih}</td>
                        <td className="p-2 border border-slate-300 text-center">{k.statusPelaksanaan}</td>
                        <td className="p-2 border border-slate-300 text-slate-600">{k.catatan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {jenisLaporan === 'presensi' && (
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-emerald-800 text-white font-semibold">
                      <th className="p-2 border border-slate-400 text-center w-10">NO</th>
                      <th className="p-2 border border-slate-400">NAMA ANGGOTA</th>
                      <th className="p-2 border border-slate-400 w-16">KELAS</th>
                      <th className="p-2 border border-slate-400 w-24">REGU</th>
                      <th className="p-2 border border-slate-400 text-center w-12">H</th>
                      <th className="p-2 border border-slate-400 text-center w-12">I</th>
                      <th className="p-2 border border-slate-400 text-center w-12">S</th>
                      <th className="p-2 border border-slate-400 text-center w-12">A</th>
                      <th className="p-2 border border-slate-400 text-right w-20">PERSEN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siswaSekolah.map((s, i) => {
                      let h = 0, iz = 0, sk = 0, a = 0;
                      allDatesBulan.forEach((d) => {
                        const stat = absensi[`${sekolah.id}_${d}_${s.id}`];
                        if (stat === 'H') h++;
                        else if (stat === 'I') iz++;
                        else if (stat === 'S') sk++;
                        else if (stat === 'A') a++;
                      });
                      const pct = allDatesBulan.length > 0 ? Math.round((h / allDatesBulan.length) * 100) : 0;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="p-2 border border-slate-300 text-center">{i + 1}</td>
                          <td className="p-2 border border-slate-300 font-sans font-medium">{s.nama}</td>
                          <td className="p-2 border border-slate-300">{s.kelas}</td>
                          <td className="p-2 border border-slate-300">{s.regu || '-'}</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-emerald-700">{h}</td>
                          <td className="p-2 border border-slate-300 text-center text-blue-700">{iz}</td>
                          <td className="p-2 border border-slate-300 text-center text-amber-700">{sk}</td>
                          <td className="p-2 border border-slate-300 text-center text-rose-700">{a}</td>
                          <td className="p-2 border border-slate-300 text-right font-bold">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {jenisLaporan === 'honor' && (
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-emerald-800 text-white font-semibold">
                      <th className="p-2 border border-slate-400 text-center w-10">NO</th>
                      <th className="p-2 border border-slate-400">NAMA PEMBINA / PELATIH</th>
                      <th className="p-2 border border-slate-400 text-center w-20">SESI</th>
                      <th className="p-2 border border-slate-400 text-right w-28">TARIF / SESI</th>
                      <th className="p-2 border border-slate-400 text-right w-32">TOTAL HONOR</th>
                      <th className="p-2 border border-slate-400 text-center w-24">STATUS</th>
                      <th className="p-2 border border-slate-400 w-28">TGL BAYAR</th>
                      <th className="p-2 border border-slate-400">CATATAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {honorBulan.map((h, i) => (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="p-2 border border-slate-300 text-center">{i + 1}</td>
                        <td className="p-2 border border-slate-300 font-sans font-medium">{h.pelatih}</td>
                        <td className="p-2 border border-slate-300 text-center font-bold">{h.jumlahPertemuan} Sesi</td>
                        <td className="p-2 border border-slate-300 text-right">{formatRupiah(h.tarifPerPertemuan)}</td>
                        <td className="p-2 border border-slate-300 text-right font-bold text-emerald-800">{formatRupiah(h.totalHonor)}</td>
                        <td className="p-2 border border-slate-300 text-center">{h.statusBayar}</td>
                        <td className="p-2 border border-slate-300">{h.tanggalBayar ? formatTanggalSaja(h.tanggalBayar) : '-'}</td>
                        <td className="p-2 border border-slate-300 text-slate-600">{h.catatan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
