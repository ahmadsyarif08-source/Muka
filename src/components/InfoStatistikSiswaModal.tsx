import React from 'react';
import { Sekolah, Siswa, AbsensiMap } from '../types';
import {
  X,
  Users,
  Shield,
  PieChart,
  BarChart2,
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface InfoStatistikSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  sekolah: Sekolah | undefined;
  siswaList: Siswa[];
  absensi: AbsensiMap;
}

export const InfoStatistikSiswaModal: React.FC<InfoStatistikSiswaModalProps> = ({
  isOpen,
  onClose,
  sekolah,
  siswaList,
  absensi,
}) => {
  if (!isOpen || !sekolah) return null;

  const total = siswaList.length;
  const lakiCount = siswaList.filter((s) => s.jenisKelamin === 'L').length;
  const perempCount = siswaList.filter((s) => s.jenisKelamin === 'P').length;

  const lakiPct = total > 0 ? Math.round((lakiCount / total) * 100) : 0;
  const perempPct = total > 0 ? Math.round((perempCount / total) * 100) : 0;

  // Breakdown by Class
  const kelasMap: Record<string, number> = {};
  siswaList.forEach((s) => {
    const k = s.kelas || 'Lainnya';
    kelasMap[k] = (kelasMap[k] || 0) + 1;
  });

  // Breakdown by Regu
  const reguMap: Record<string, number> = {};
  siswaList.forEach((s) => {
    const r = s.regu || 'Belum Ber-regu';
    reguMap[r] = (reguMap[r] || 0) + 1;
  });

  // Overall attendance calculation
  let totalHadir = 0;
  let totalEntry = 0;
  const prefix = `${sekolah.id}_`;
  Object.entries(absensi).forEach(([key, status]) => {
    if (key.startsWith(prefix)) {
      totalEntry++;
      if (status === 'H') totalHadir++;
    }
  });
  const avgAttendance = totalEntry > 0 ? Math.round((totalHadir / totalEntry) * 100) : 0;

  // Golongan guide
  const golonganGuide =
    sekolah.tingkat === 'SD'
      ? {
          golongan: 'Pramuka Siaga (Usia 7–10 Tahun)',
          satuan: 'Barung (5–10 orang)',
          induk: 'Perindukan Siaga (3–4 Barung)',
          sku: ['Siaga Mula', 'Siaga Bantu', 'Siaga Tata'],
          kodeKehormatan: 'Dwisatya & Dwidarma',
          warna: 'Hijau Daun (Perisai Hijau)',
        }
      : sekolah.tingkat === 'SMP'
      ? {
          golongan: 'Pramuka Penggalang (Usia 11–15 Tahun)',
          satuan: 'Regu (6–8 orang)',
          induk: 'Pasukan Penggalang (3–4 Regu)',
          sku: ['Penggalang Ramu', 'Penggalang Rakit', 'Penggalang Terap'],
          kodeKehormatan: 'Trisatya & Dasadarma',
          warna: 'Merah (Lencana Merah)',
        }
      : {
          golongan: 'Pramuka Penegak (Usia 16–20 Tahun)',
          satuan: 'Sangga (4–8 orang)',
          induk: 'Ambalan Penegak',
          sku: ['Penegak Bantara', 'Penegak Laksana'],
          kodeKehormatan: 'Trisatya & Dasadarma',
          warna: 'Kuning Emas',
        };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs no-print">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col text-slate-800 dark:text-slate-100 max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 font-bold">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">Info & Statistik Anggota Pramuka</h3>
              <p className="text-xs text-slate-400">
                Pangkalan: <span className="text-white font-medium">{sekolah.nama}</span> (Gudep {sekolah.gudep || '-'})
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
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Total Anggota</span>
              <strong className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">{total}</strong>
              <span className="text-[10px] text-slate-400">Siswa Terdaftar</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Laki-laki</span>
              <strong className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5 block">{lakiCount}</strong>
              <span className="text-[10px] text-slate-400">{lakiPct}% Proporsi</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Perempuan</span>
              <strong className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5 block">{perempCount}</strong>
              <span className="text-[10px] text-slate-400">{perempPct}% Proporsi</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Keaktifan Rata-rata</span>
              <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{avgAttendance}%</strong>
              <span className="text-[10px] text-slate-400">Tingkat Hadir</span>
            </div>
          </div>

          {/* Gender Ratio Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-blue-700 dark:text-blue-400">Laki-laki: {lakiCount} ({lakiPct}%)</span>
              <span className="text-rose-700 dark:text-rose-400">Perempuan: {perempCount} ({perempPct}%)</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700 shadow-inner">
              <div style={{ width: `${lakiPct}%` }} className="bg-blue-600 h-full" />
              <div style={{ width: `${perempPct}%` }} className="bg-rose-500 h-full" />
            </div>
          </div>

          {/* Breakdown Regu & Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Breakdown Regu / Barung */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                Persebaran Regu / Barung
              </h4>
              <div className="space-y-1.5 pt-1">
                {Object.entries(reguMap).map(([reguNama, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={reguNama} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                        {reguNama}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                          <div style={{ width: `${pct}%` }} className="bg-emerald-600 h-full rounded-full" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                          {count} siswa
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Breakdown Kelas */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                Persebaran per Kelas
              </h4>
              <div className="space-y-1.5 pt-1">
                {Object.entries(kelasMap).map(([kelasNama, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={kelasNama} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Kelas {kelasNama}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                          <div style={{ width: `${pct}%` }} className="bg-blue-600 h-full rounded-full" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                          {count} siswa
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Panduan Golongan Kepramukaan */}
          <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-4 rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              Informasi Golongan: {golonganGuide.golongan}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-900 dark:text-amber-300">
              <div>
                <span>Satuan Kecil:</span> <strong>{golonganGuide.satuan}</strong>
              </div>
              <div>
                <span>Satuan Lengkap:</span> <strong>{golonganGuide.induk}</strong>
              </div>
              <div>
                <span>Tingkatan SKU:</span> <strong>{golonganGuide.sku.join(' ➔ ')}</strong>
              </div>
              <div>
                <span>Kode Kehormatan:</span> <strong>{golonganGuide.kodeKehormatan}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Pangkalan {sekolah.nama} · Latihan {sekolah.hariLatihan || '-'} ({sekolah.jamLatihan || '-'})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
