import React, { useState } from 'react';
import { Sekolah, Siswa, AbsensiMap } from '../types';
import { formatTanggalIndo } from '../utils/storage';
import {
  X,
  User,
  Shield,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  Printer,
  QrCode,
  Users,
  PieChart,
  School,
  FileText,
  BadgeCheck,
} from 'lucide-react';

interface InfoSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswa: Siswa | null;
  sekolah: Sekolah | undefined;
  absensi: AbsensiMap;
}

export const InfoSiswaModal: React.FC<InfoSiswaModalProps> = ({
  isOpen,
  onClose,
  siswa,
  sekolah,
  absensi,
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'kta' | 'presensi'>('profil');

  if (!isOpen || !siswa) return null;

  // Calculate attendance records for this student
  let hadirCount = 0;
  let izinCount = 0;
  let sakitCount = 0;
  let alpaCount = 0;
  const historyList: { tanggal: string; status: 'H' | 'I' | 'S' | 'A' }[] = [];

  const prefix = `${siswa.sekolahId}_`;
  const suffix = `_${siswa.id}`;

  Object.entries(absensi).forEach(([key, status]) => {
    if (key.startsWith(prefix) && key.endsWith(suffix)) {
      const parts = key.split('_');
      if (parts.length >= 3) {
        const tgl = parts[1];
        historyList.push({ tanggal: tgl, status: status as any });
        if (status === 'H') hadirCount++;
        else if (status === 'I') izinCount++;
        else if (status === 'S') sakitCount++;
        else if (status === 'A') alpaCount++;
      }
    }
  });

  // Sort history by date descending
  historyList.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const totalRecorded = hadirCount + izinCount + sakitCount + alpaCount;
  const attendanceRate = totalRecorded > 0 ? Math.round((hadirCount / totalRecorded) * 100) : 0;

  // Golongan and SKU badge helper
  const golonganInfo =
    sekolah?.tingkat === 'SD'
      ? { nama: 'Pramuka Siaga', tingkatan: ['Mula', 'Bantu', 'Tata'], warna: 'border-emerald-600 text-emerald-800 bg-emerald-50' }
      : sekolah?.tingkat === 'SMP'
      ? { nama: 'Pramuka Penggalang', tingkatan: ['Ramu', 'Rakit', 'Terap'], warna: 'border-rose-600 text-rose-800 bg-rose-50' }
      : { nama: 'Pramuka Penegak', tingkatan: ['Bantara', 'Laksana'], warna: 'border-amber-600 text-amber-800 bg-amber-50' };

  const handlePrintKTA = () => {
    window.focus();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs no-print">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col text-slate-800 dark:text-slate-100 max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold">
              <span className="text-lg">⚜</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                <span>{siswa.nama}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300 font-normal">
                  {siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pangkalan: <span className="text-slate-200">{sekolah?.nama || '-'}</span> · Kelas: {siswa.kelas}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-3 bg-slate-50 dark:bg-slate-950/40 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('profil')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profil'
                ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400 dark:border-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Profil Lengkap
          </button>
          <button
            onClick={() => setActiveTab('kta')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'kta'
                ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400 dark:border-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Kartu Tanda Anggota (KTA)
          </button>
          <button
            onClick={() => setActiveTab('presensi')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'presensi'
                ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400 dark:border-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Riwayat Kehadiran ({historyList.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* TAB 1: PROFIL LENGKAP */}
          {activeTab === 'profil' && (
            <div className="space-y-4">
              {/* Quick Badge Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Tingkat Pramuka</span>
                  <strong className="text-slate-900 dark:text-white text-sm mt-0.5 block">{golonganInfo.nama}</strong>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Regu / Barung</span>
                  <strong className="text-slate-900 dark:text-white text-sm mt-0.5 block">{siswa.regu || '-'}</strong>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Jabatan Regu</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 text-sm mt-0.5 block">{siswa.jabatan || 'Anggota'}</strong>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Kehadiran</span>
                  <strong className="text-slate-900 dark:text-white text-sm mt-0.5 block">{attendanceRate}%</strong>
                </div>
              </div>

              {/* Data Detail Card */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  Biodata Anggota
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Nama Lengkap:</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm font-semibold">{siswa.nama}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Nomor Induk Siswa (NIS / NTA):</span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200 text-sm">{siswa.nis || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Kelas / Rombel:</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm">{siswa.kelas}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Jenis Kelamin:</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm">{siswa.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Pangkalan Gudep:</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm">{sekolah?.nama} (Gudep {sekolah?.gudep})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Pembina Pembimbing:</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm">{sekolah?.pembina || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* Attendance Progress Bar */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Ringkasan Keaktifan Latihan</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{attendanceRate}% Hadir</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                  <div style={{ width: `${attendanceRate}%` }} className="bg-emerald-600 h-full" title={`Hadir: ${hadirCount}`} />
                  <div style={{ width: `${totalRecorded > 0 ? (izinCount / totalRecorded) * 100 : 0}%` }} className="bg-blue-500 h-full" title={`Izin: ${izinCount}`} />
                  <div style={{ width: `${totalRecorded > 0 ? (sakitCount / totalRecorded) * 100 : 0}%` }} className="bg-amber-500 h-full" title={`Sakit: ${sakitCount}`} />
                  <div style={{ width: `${totalRecorded > 0 ? (alpaCount / totalRecorded) * 100 : 0}%` }} className="bg-rose-500 h-full" title={`Alpa: ${alpaCount}`} />
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /> Hadir: {hadirCount}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Izin: {izinCount}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Sakit: {sakitCount}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Alpa: {alpaCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KTA PRAMUKA DIGITAL */}
          {activeTab === 'kta' && (
            <div className="space-y-4">
              <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                Kartu Tanda Anggota (KTA) resmi Gerakan Pramuka Gugus Depan pangkalan sekolah.
              </div>

              {/* CARD PREVIEW CONTAINER */}
              <div className="max-w-md mx-auto bg-gradient-to-br from-amber-900 via-[#5c3a21] to-[#3b2010] text-white rounded-2xl p-5 shadow-2xl border-2 border-amber-400/40 relative overflow-hidden">
                {/* Background Insignia Watermark */}
                <div className="absolute -right-8 -bottom-8 opacity-10 text-[140px] pointer-events-none select-none">
                  ⚜
                </div>

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-amber-400/30 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-bold text-sm shadow-xs">
                      <span>⚜</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs tracking-wider uppercase text-amber-200">
                        GERAKAN PRAMUKA
                      </h4>
                      <p className="text-[10px] text-amber-100/80">KARTU TANDA ANGGOTA (KTA)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase">
                      {sekolah?.tingkat === 'SD' ? 'SIAGA' : sekolah?.tingkat === 'SMP' ? 'PENGGALANG' : 'PENEGAK'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="py-4 flex gap-4 items-center">
                  {/* Photo / Avatar Placeholder */}
                  <div className="w-20 h-24 rounded-lg bg-amber-100/10 border border-amber-300/30 flex flex-col items-center justify-center text-amber-300 shrink-0 shadow-inner">
                    <User className="w-8 h-8 opacity-80" />
                    <span className="text-[9px] uppercase font-bold mt-1 tracking-tighter">FOTO</span>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-1 flex-1 text-xs">
                    <div>
                      <span className="text-[10px] text-amber-200/70 block">NAMA LENGKAP</span>
                      <strong className="text-sm font-bold text-white block uppercase tracking-wide">
                        {siswa.nama}
                      </strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <div>
                        <span className="text-[9px] text-amber-200/70 block">NIS / NTA</span>
                        <span className="font-mono text-amber-100 font-semibold">{siswa.nis || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-amber-200/70 block">KELAS</span>
                        <span className="text-amber-100 font-semibold">{siswa.kelas}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-amber-200/70 block">REGU / BARUNG</span>
                        <span className="text-amber-100 font-semibold">{siswa.regu || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-amber-200/70 block">JABATAN</span>
                        <span className="text-amber-300 font-bold">{siswa.jabatan || 'Anggota'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="border-t border-amber-400/30 pt-2.5 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="text-amber-200/70 block text-[9px]">PANGKALAN SEKOLAH</span>
                    <strong className="text-amber-100 font-semibold">{sekolah?.nama}</strong>
                    <span className="text-amber-300/80 block text-[9px]">Gudep: {sekolah?.gudep || '00.000'}</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[9px] text-amber-200/70">PEMBINA GUDEP</span>
                    <span className="text-[10px] font-semibold text-white underline">{sekolah?.pembina || 'Pembina'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RIWAYAT KEHADIRAN */}
          {activeTab === 'presensi' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Total latihan yang tercatat: <strong>{historyList.length}</strong> pertemuan
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {hadirCount} Hadir ({attendanceRate}%)
                </span>
              </div>

              {historyList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Calendar className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <p>Belum ada rekaman presensi harian untuk anggota ini.</p>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Tanggal Latihan</th>
                        <th className="py-2 px-3">Hari</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {historyList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                            {formatTanggalIndo(item.tanggal)}
                          </td>
                          <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                            {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long' })}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {item.status === 'H' ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Hadir (H)
                              </span>
                            ) : item.status === 'I' ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                Izin (I)
                              </span>
                            ) : item.status === 'S' ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                Sakit (S)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                Alpa (A)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Terdaftar di Gudep {sekolah?.gudep || '-'}
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
