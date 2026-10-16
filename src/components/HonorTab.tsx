import React, { useState, useMemo } from 'react';
import { Sekolah, Kegiatan, PembayaranHonor } from '../types';
import { formatRupiah, formatBulanTahunIndo, generateUid } from '../utils/storage';
import { MainModuleHeader } from './MainModuleHeader';
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Plus,
  RefreshCw,
  Building2,
  UserCheck,
  Receipt,
  Check,
} from 'lucide-react';

interface HonorTabProps {
  daftarSekolah: Sekolah[];
  sekolahAktifId: string;
  onSelectSekolahAktif: (id: string) => void;
  kegiatanList: Kegiatan[];
  honorList: PembayaranHonor[];
  onAddHonor: (honor: PembayaranHonor) => void;
  onUpdateHonor: (honor: PembayaranHonor) => void;
  onDeleteHonor: (id: string) => void;
}

export const HonorTab: React.FC<HonorTabProps> = ({
  daftarSekolah,
  sekolahAktifId,
  onSelectSekolahAktif,
  kegiatanList,
  honorList,
  onAddHonor,
  onUpdateHonor,
  onDeleteHonor,
}) => {
  const [selectedBulan, setSelectedBulan] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [kwitansiItem, setKwitansiItem] = useState<{
    honor: PembayaranHonor;
    sekolah: Sekolah | undefined;
  } | null>(null);

  // Form State
  const [formSekolahId, setFormSekolahId] = useState<string>(sekolahAktifId);
  const [formPelatih, setFormPelatih] = useState<string>('');
  const [formJumlahPertemuan, setFormJumlahPertemuan] = useState<number>(4);
  const [formTarif, setFormTarif] = useState<number>(80000);
  const [formStatus, setFormStatus] = useState<'Lunas' | 'Belum Lunas'>('Belum Lunas');
  const [formCatatan, setFormCatatan] = useState<string>('');

  // Selected School
  const sekolahAktif = useMemo(() => {
    return daftarSekolah.find((s) => s.id === sekolahAktifId) || daftarSekolah[0];
  }, [daftarSekolah, sekolahAktifId]);

  // Count meetings in this month from Kegiatan
  const kegiatanBulanIni = useMemo(() => {
    return kegiatanList.filter((k) => {
      const matchSekolah = !sekolahAktifId || k.sekolahId === sekolahAktifId;
      const matchBulan = k.tanggal.startsWith(selectedBulan);
      const isSelesai = k.statusPelaksanaan === 'Selesai';
      return matchSekolah && matchBulan && isSelesai;
    });
  }, [kegiatanList, sekolahAktifId, selectedBulan]);

  // Filtered honor records
  const filteredHonor = useMemo(() => {
    return honorList.filter((h) => {
      const matchBulan = h.bulan === selectedBulan;
      const matchSekolah = !sekolahAktifId || h.sekolahId === sekolahAktifId;
      return matchBulan && matchSekolah;
    });
  }, [honorList, selectedBulan, sekolahAktifId]);

  // Overall financial statistics
  const summaryFinance = useMemo(() => {
    let totalNominal = 0;
    let lunasNominal = 0;
    let pendingNominal = 0;

    filteredHonor.forEach((h) => {
      totalNominal += h.totalHonor;
      if (h.statusBayar === 'Lunas') {
        lunasNominal += h.totalHonor;
      } else {
        pendingNominal += h.totalHonor;
      }
    });

    return { totalNominal, lunasNominal, pendingNominal };
  }, [filteredHonor]);

  // Helper to sync from Jurnal
  const handleAutoGenerateFromJurnal = () => {
    if (!sekolahAktif) return;
    const count = kegiatanBulanIni.length;
    const tarif = sekolahAktif.honorPerPertemuan || 80000;
    const pelatihNama = sekolahAktif.pembina || 'Kak Pelatih';

    // Check if record already exists
    const existing = honorList.find(
      (h) => h.sekolahId === sekolahAktif.id && h.bulan === selectedBulan && h.pelatih === pelatihNama
    );

    if (existing) {
      onUpdateHonor({
        ...existing,
        jumlahPertemuan: count,
        tarifPerPertemuan: tarif,
        totalHonor: count * tarif,
        catatan: `Disinkronkan otomatis dari ${count} sesi jurnal latihan ${selectedBulan}`,
      });
    } else {
      const newH: PembayaranHonor = {
        id: generateUid('hn'),
        sekolahId: sekolahAktif.id,
        bulan: selectedBulan,
        pelatih: pelatihNama,
        jumlahPertemuan: count,
        tarifPerPertemuan: tarif,
        totalHonor: count * tarif,
        statusBayar: 'Belum Lunas',
        catatan: `Dihitung otomatis dari ${count} sesi latihan terverifikasi di jurnal.`,
      };
      onAddHonor(newH);
    }
  };

  const handleToggleStatus = (h: PembayaranHonor) => {
    const isNowLunas = h.statusBayar !== 'Lunas';
    onUpdateHonor({
      ...h,
      statusBayar: isNowLunas ? 'Lunas' : 'Belum Lunas',
      tanggalBayar: isNowLunas ? new Date().toISOString().split('T')[0] : undefined,
    });
  };

  const handleOpenAddModal = () => {
    setFormSekolahId(sekolahAktifId);
    setFormPelatih(sekolahAktif?.pembina || '');
    setFormJumlahPertemuan(kegiatanBulanIni.length || 4);
    setFormTarif(sekolahAktif?.honorPerPertemuan || 80000);
    setFormStatus('Belum Lunas');
    setFormCatatan('');
    setShowAddModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSekolahId || !formPelatih.trim()) return;

    const total = (Number(formJumlahPertemuan) || 0) * (Number(formTarif) || 0);
    const newH: PembayaranHonor = {
      id: generateUid('hn'),
      sekolahId: formSekolahId,
      bulan: selectedBulan,
      pelatih: formPelatih.trim(),
      jumlahPertemuan: Number(formJumlahPertemuan) || 0,
      tarifPerPertemuan: Number(formTarif) || 0,
      totalHonor: total,
      statusBayar: formStatus,
      tanggalBayar: formStatus === 'Lunas' ? new Date().toISOString().split('T')[0] : undefined,
      catatan: formCatatan.trim(),
    };
    onAddHonor(newH);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Utama Modul Honor Pelatih (Cyan) */}
      <MainModuleHeader
        tabId="honor"
        customBadges={[
          { label: `Periode: ${formatBulanTahunIndo(selectedBulan)}`, icon: Calendar },
          { label: `Total: ${formatRupiah(summaryFinance.totalNominal)}`, icon: Banknote },
          { label: `Lunas: ${formatRupiah(summaryFinance.lunasNominal)}`, icon: CheckCircle2 },
          ...(summaryFinance.pendingNominal > 0
            ? [{ label: `Belum: ${formatRupiah(summaryFinance.pendingNominal)}`, icon: Clock }]
            : []),
        ]}
        rightAction={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAutoGenerateFromJurnal}
              title="Tarik sesi otomatis dari Jurnal Latihan bulan ini"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-md border border-white/20 cursor-pointer transition-all shadow-xs"
            >
              <RefreshCw className="w-4 h-4 text-cyan-200" />
              <span>Tarik dari Jurnal</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-cyan-950 bg-cyan-200 hover:bg-cyan-100 rounded-xl shadow-md cursor-pointer transition-all border border-cyan-300"
            >
              <Plus className="w-4 h-4 text-cyan-900" />
              <span>+ Buat Rekap Honor</span>
            </button>
          </div>
        }
      />

      {/* Top Banner & Filter Month */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Honor & Rekap Pelatih</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perhitungan insentif pembina berdasarkan kehadiran sesi latihan, slip honor, dan bukti kwitansi resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month input */}
          <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white">
            <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
            <input
              type="month"
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
            />
          </div>

          {/* School Selector */}
          <select
            value={sekolahAktifId}
            onChange={(e) => onSelectSekolahAktif(e.target.value)}
            className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-800"
          >
            {daftarSekolah.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama}
              </option>
            ))}
          </select>

          <button
            onClick={handleAutoGenerateFromJurnal}
            title="Tarik sesi otomatis dari Jurnal Latihan bulan ini"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
            <span>Tarik dari Jurnal</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Rekap Honor</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-slate-500 block text-[11px] mb-1">Periode Rekap</span>
          <span className="text-base font-bold text-slate-900">{formatBulanTahunIndo(selectedBulan)}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {kegiatanBulanIni.length} Sesi Terlaksana di Jurnal
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-slate-500 block text-[11px] mb-1">Total Kewajiban Honor</span>
          <span className="text-base font-bold text-slate-900 tabular-nums">
            {formatRupiah(summaryFinance.totalNominal)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">{filteredHonor.length} Penerima Insentif</span>
        </div>

        <div className="bg-emerald-50/70 rounded-xl border border-emerald-100 p-4">
          <span className="text-emerald-700 block text-[11px] mb-1">Sudah Dibayarkan (Lunas)</span>
          <span className="text-base font-bold text-emerald-800 tabular-nums">
            {formatRupiah(summaryFinance.lunasNominal)}
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block">Dana BOS / Komite Sekolah</span>
        </div>

        <div className="bg-amber-50/70 rounded-xl border border-amber-100 p-4">
          <span className="text-amber-700 block text-[11px] mb-1">Menunggu Pencairan</span>
          <span className="text-base font-bold text-amber-800 tabular-nums">
            {formatRupiah(summaryFinance.pendingNominal)}
          </span>
          <span className="text-[11px] text-amber-600 mt-1 block">Belum Ditransfer / Diserahkan</span>
        </div>
      </div>

      {/* Honor Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Daftar Honor Pelatih — {formatBulanTahunIndo(selectedBulan)}
          </h3>
          <span className="text-xs text-slate-500">Tarif Baku: {formatRupiah(sekolahAktif?.honorPerPertemuan || 0)} / sesi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Nama Pelatih / Pembina</th>
                <th className="py-3 px-4">Pangkalan Sekolah</th>
                <th className="py-3 px-4 text-center">Jumlah Sesi</th>
                <th className="py-3 px-4 text-right">Tarif / Sesi</th>
                <th className="py-3 px-4 text-right">Total Honor</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi & Kwitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHonor.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Belum ada data honor yang tercatat pada bulan {formatBulanTahunIndo(selectedBulan)}.
                    <div className="mt-2">
                      <button
                        onClick={handleAutoGenerateFromJurnal}
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Hitung Otomatis dari Jurnal Latihan
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHonor.map((item) => {
                  const sk = daftarSekolah.find((s) => s.id === item.sekolahId);
                  const isLunas = item.statusBayar === 'Lunas';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.pelatih}</div>
                        {item.catatan && <div className="text-[11px] text-slate-400 mt-0.5">{item.catatan}</div>}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {sk?.nama || '-'}
                        <div className="text-[11px] text-slate-400">{sk?.gudep}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800 tabular-nums">
                        {item.jumlahPertemuan} Pertemuan
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 tabular-nums">
                        {formatRupiah(item.tarifPerPertemuan)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums text-sm">
                        {formatRupiah(item.totalHonor)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                            isLunas
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {isLunas ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {isLunas ? 'Lunas' : 'Belum Lunas'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setKwitansiItem({ honor: item, sekolah: sk })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                          >
                            <Receipt className="w-3 h-3 text-emerald-700" />
                            <span>Slip Kwitansi</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus catatan honor ini?`)) {
                                onDeleteHonor(item.id);
                              }
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                            title="Hapus"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Manual Honor */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Rekap Honor Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Pangkalan Sekolah *</label>
                <select
                  value={formSekolahId}
                  onChange={(e) => {
                    setFormSekolahId(e.target.value);
                    const s = daftarSekolah.find((x) => x.id === e.target.value);
                    if (s) {
                      setFormPelatih(s.pembina || '');
                      setFormTarif(s.honorPerPertemuan || 80000);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                >
                  {daftarSekolah.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Nama Pelatih / Pembina *</label>
                {(() => {
                  const currentSk = daftarSekolah.find((x) => x.id === formSekolahId);
                  const pList = currentSk?.daftarPembina && currentSk.daftarPembina.length > 0
                    ? currentSk.daftarPembina
                    : (currentSk?.pembina ? [currentSk.pembina] : []);
                  return (
                    <div className="space-y-1">
                      {pList.length > 0 && (
                        <select
                          value={formPelatih}
                          onChange={(e) => setFormPelatih(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                        >
                          <option value="">-- Pilih Pembina Terdaftar --</option>
                          {pList.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      )}
                      <input
                        type="text"
                        required
                        value={formPelatih}
                        onChange={(e) => setFormPelatih(e.target.value)}
                        placeholder="Atau ketik nama pelatih..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
                      />
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Jumlah Pertemuan Hadir</label>
                  <input
                    type="number"
                    min="1"
                    value={formJumlahPertemuan}
                    onChange={(e) => setFormJumlahPertemuan(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Tarif per Pertemuan (Rp)</label>
                  <input
                    type="number"
                    step="5000"
                    value={formTarif}
                    onChange={(e) => setFormTarif(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 tabular-nums"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                <span className="text-slate-600">Total Honor:</span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {formatRupiah((formJumlahPertemuan || 0) * (formTarif || 0))}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Status Pembayaran</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                >
                  <option value="Belum Lunas">Belum Lunas (Menunggu Pencairan)</option>
                  <option value="Lunas">Lunas (Sudah Dibayarkan)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Catatan / Keterangan</label>
                <input
                  type="text"
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  placeholder="Sumber dana, no transfer, dsb."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
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
                  Simpan Rekap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kwitansi / Slip Honor Modal (Printable) */}
      {kwitansiItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
              <h3 className="text-base font-semibold text-slate-900">Tanda Terima & Kwitansi Honor</h3>
              <button onClick={() => setKwitansiItem(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>

            {/* Slip Paper Container */}
            <div id="print-slip" className="border-2 border-dashed border-slate-300 p-5 rounded-lg bg-amber-50/20 font-serif text-slate-900">
              <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
                <h4 className="font-bold text-base tracking-wide uppercase">TANDA TERIMA HONORARIUM PELATIH</h4>
                <p className="text-xs text-slate-600 font-sans mt-0.5">
                  EKSTRAKURIKULER GERAKAN PRAMUKA — {kwitansiItem.sekolah?.nama?.toUpperCase()}
                </p>
                <p className="text-[11px] text-slate-500 font-sans">Gugus Depan: {kwitansiItem.sekolah?.gudep}</p>
              </div>

              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Telah Diterima Dari:</span>
                  <span className="font-semibold text-slate-800">{kwitansiItem.sekolah?.nama}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Nama Penerima:</span>
                  <span className="font-semibold text-slate-800">{kwitansiItem.honor.pelatih}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Untuk Pembayaran:</span>
                  <span className="font-semibold text-slate-800">
                    Honor Latihan Periode {formatBulanTahunIndo(kwitansiItem.honor.bulan)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Rincian Pertemuan:</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {kwitansiItem.honor.jumlahPertemuan} Sesi × {formatRupiah(kwitansiItem.honor.tarifPerPertemuan)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b-2 border-slate-800 bg-emerald-50/50 px-2 rounded">
                  <span className="font-bold text-slate-800">JUMLAH DITERIMA:</span>
                  <span className="font-bold text-emerald-900 text-sm tabular-nums">
                    {formatRupiah(kwitansiItem.honor.totalHonor)}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 mt-6 text-center text-xs font-sans">
                <div>
                  <p className="text-slate-500 text-[11px]">Mengetahui,</p>
                  <p className="font-semibold text-slate-800">Ka. Mabigus / Kepala Sekolah</p>
                  <div className="h-14" />
                  <p className="font-bold text-slate-900 underline">
                    {kwitansiItem.sekolah?.kepalaSekolah || '( ................................... )'}
                  </p>
                  <p className="text-[11px] text-slate-500">NIP. {kwitansiItem.sekolah?.nipKepsek || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[11px]">Penerima Honor,</p>
                  <p className="font-semibold text-slate-800">Pembina / Pelatih</p>
                  <div className="h-14" />
                  <p className="font-bold text-slate-900 underline">{kwitansiItem.honor.pelatih}</p>
                  <p className="text-[11px] text-slate-500">Status: {kwitansiItem.honor.statusBayar}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 no-print">
              <button
                onClick={() => setKwitansiItem(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
