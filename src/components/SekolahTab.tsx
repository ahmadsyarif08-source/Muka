import React, { useState, useRef } from 'react';
import { Sekolah, TingkatSekolah } from '../types';
import { formatRupiah, generateUid } from '../utils/storage';
import { defaultScoutLogo } from '../assets/assetUrls';
import { MainModuleHeader } from './MainModuleHeader';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  UserCheck,
  Shield,
  UserPlus,
  X,
  Upload,
  ImageIcon,
} from 'lucide-react';

interface SekolahTabProps {
  daftarSekolah: Sekolah[];
  sekolahAktifId: string;
  onSelectSekolahAktif: (id: string) => void;
  onAddSekolah: (sekolah: Sekolah) => void;
  onUpdateSekolah: (sekolah: Sekolah) => void;
  onDeleteSekolah: (id: string) => void;
  onAddPembinaToSekolah: (sekolahId: string, namaPembina: string) => void;
  onRemovePembinaFromSekolah: (sekolahId: string, namaPembina: string) => void;
  jumlahSiswaMap: Record<string, number>;
  jumlahKegiatanMap: Record<string, number>;
}

export const SekolahTab: React.FC<SekolahTabProps> = ({
  daftarSekolah,
  sekolahAktifId,
  onSelectSekolahAktif,
  onAddSekolah,
  onUpdateSekolah,
  onDeleteSekolah,
  onAddPembinaToSekolah,
  onRemovePembinaFromSekolah,
  jumlahSiswaMap,
  jumlahKegiatanMap,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Quick add pembina modal state
  const [quickAddSchoolId, setQuickAddSchoolId] = useState<string | null>(null);
  const [quickPembinaName, setQuickPembinaName] = useState('');

  // Form State
  const [nama, setNama] = useState('');
  const [tingkat, setTingkat] = useState<TingkatSekolah>('SD');
  const [alamat, setAlamat] = useState('');
  const [gudep, setGudep] = useState('');
  const [hariLatihan, setHariLatihan] = useState('');
  const [jamLatihan, setJamLatihan] = useState('');
  const [pembina, setPembina] = useState('');
  const [daftarPembina, setDaftarPembina] = useState<string[]>([]);
  const [newPembinaInput, setNewPembinaInput] = useState('');
  const [kepalaSekolah, setKepalaSekolah] = useState('');
  const [nipKepsek, setNipKepsek] = useState('');
  const [honorPerPertemuan, setHonorPerPertemuan] = useState<number>(80000);
  const [logoPramukaUrl, setLogoPramukaUrl] = useState<string>('');
  const [logoPangkalanUrl, setLogoPangkalanUrl] = useState<string>('');

  const logoPramukaRef = useRef<HTMLInputElement>(null);
  const logoPangkalanRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingId(null);
    setNama('');
    setTingkat('SD');
    setAlamat('');
    setGudep('');
    setHariLatihan('Jumat');
    setJamLatihan('14:00 - 16:00 WIB');
    setPembina('');
    setDaftarPembina([]);
    setNewPembinaInput('');
    setKepalaSekolah('');
    setNipKepsek('');
    setHonorPerPertemuan(80000);
    setLogoPramukaUrl(defaultScoutLogo);
    setLogoPangkalanUrl('');
    setShowModal(true);
  };

  const openEditModal = (sk: Sekolah) => {
    setEditingId(sk.id);
    setNama(sk.nama);
    setTingkat(sk.tingkat);
    setAlamat(sk.alamat);
    setGudep(sk.gudep);
    setHariLatihan(sk.hariLatihan);
    setJamLatihan(sk.jamLatihan);
    setPembina(sk.pembina);
    const existingPembina = sk.daftarPembina && sk.daftarPembina.length > 0 
      ? sk.daftarPembina 
      : (sk.pembina ? [sk.pembina] : []);
    setDaftarPembina(existingPembina);
    setNewPembinaInput('');
    setKepalaSekolah(sk.kepalaSekolah);
    setNipKepsek(sk.nipKepsek);
    setHonorPerPertemuan(sk.honorPerPertemuan || 80000);
    setLogoPramukaUrl(sk.logoPramukaUrl || defaultScoutLogo);
    setLogoPangkalanUrl(sk.logoPangkalanUrl || sk.logoUrl || '');
    setShowModal(true);
  };

  const handleAddPembinaToForm = () => {
    if (!newPembinaInput.trim()) return;
    const trimmed = newPembinaInput.trim();
    if (!daftarPembina.includes(trimmed)) {
      setDaftarPembina([...daftarPembina, trimmed]);
      if (!pembina) {
        setPembina(trimmed);
      }
    }
    setNewPembinaInput('');
  };

  const handleRemovePembinaFromForm = (pName: string) => {
    const updated = daftarPembina.filter((p) => p !== pName);
    setDaftarPembina(updated);
    if (pembina === pName) {
      setPembina(updated[0] || '');
    }
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddSchoolId || !quickPembinaName.trim()) return;
    onAddPembinaToSekolah(quickAddSchoolId, quickPembinaName.trim());
    setQuickPembinaName('');
    setQuickAddSchoolId(null);
  };

  const handleUploadLogoPramukaForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoPramukaUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogoPangkalanForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoPangkalanUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    // ensure primary pembina is included in daftarPembina
    let finalDaftarPembina = [...daftarPembina];
    if (pembina.trim() && !finalDaftarPembina.includes(pembina.trim())) {
      finalDaftarPembina.unshift(pembina.trim());
    }
    if (finalDaftarPembina.length > 0 && !pembina.trim()) {
      setPembina(finalDaftarPembina[0]);
    }

    if (editingId) {
      const existing = daftarSekolah.find((s) => s.id === editingId);
      if (existing) {
        onUpdateSekolah({
          ...existing,
          nama: nama.trim(),
          tingkat,
          alamat: alamat.trim(),
          gudep: gudep.trim(),
          hariLatihan: hariLatihan.trim(),
          jamLatihan: jamLatihan.trim(),
          pembina: pembina.trim() || (finalDaftarPembina[0] || ''),
          daftarPembina: finalDaftarPembina,
          kepalaSekolah: kepalaSekolah.trim(),
          nipKepsek: nipKepsek.trim(),
          honorPerPertemuan: Number(honorPerPertemuan) || 0,
          logoPramukaUrl: logoPramukaUrl || undefined,
          logoPangkalanUrl: logoPangkalanUrl || undefined,
          logoUrl: logoPangkalanUrl || undefined,
        });
      }
    } else {
      const newSk: Sekolah = {
        id: generateUid('sk'),
        nama: nama.trim(),
        tingkat,
        alamat: alamat.trim(),
        gudep: gudep.trim(),
        hariLatihan: hariLatihan.trim(),
        jamLatihan: jamLatihan.trim(),
        pembina: pembina.trim() || (finalDaftarPembina[0] || ''),
        daftarPembina: finalDaftarPembina,
        kepalaSekolah: kepalaSekolah.trim(),
        nipKepsek: nipKepsek.trim(),
        honorPerPertemuan: Number(honorPerPertemuan) || 0,
        logoPramukaUrl: logoPramukaUrl || undefined,
        logoPangkalanUrl: logoPangkalanUrl || undefined,
        logoUrl: logoPangkalanUrl || undefined,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddSekolah(newSk);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Utama Modul Sekolah (Indigo) */}
      <MainModuleHeader
        tabId="sekolah"
        customBadges={[
          { label: `${daftarSekolah.length} Pangkalan Terdaftar`, icon: Building2 },
          {
            label: `Pangkalan Aktif: ${daftarSekolah.find((s) => s.id === sekolahAktifId)?.nama || '-'}`,
            icon: Shield,
          },
        ]}
        rightAction={
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0 border border-indigo-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pangkalan Baru</span>
          </button>
        }
      />

      {/* List of Schools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {daftarSekolah.map((sk) => {
          const isAktif = sk.id === sekolahAktifId;
          const totalSiswa = jumlahSiswaMap[sk.id] || 0;
          const totalKegiatan = jumlahKegiatanMap[sk.id] || 0;
          const listPembina = sk.daftarPembina && sk.daftarPembina.length > 0 
            ? sk.daftarPembina 
            : (sk.pembina ? [sk.pembina] : []);

          return (
            <div
              key={sk.id}
              className={`bg-white rounded-xl border p-5 transition-all flex flex-col justify-between ${
                isAktif
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {sk.logoPangkalanUrl || sk.logoUrl ? (
                      <img
                        src={sk.logoPangkalanUrl || sk.logoUrl}
                        alt="Logo Pangkalan"
                        className="w-10 h-10 object-contain rounded-md border border-slate-200 p-0.5 bg-white shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold shrink-0 text-xs">
                        {sk.tingkat}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
                        {sk.tingkat === 'SD'
                          ? 'Siaga · SD'
                          : sk.tingkat === 'SMP'
                          ? 'Penggalang · SMP'
                          : sk.tingkat === 'SMA'
                          ? 'Penegak · SMA'
                          : 'Pandega · SMK'}
                      </span>
                      <h3 className="text-base font-semibold text-slate-900 mt-0.5 leading-snug">{sk.nama}</h3>
                    </div>
                  </div>

                  {isAktif ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Aktif
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectSekolahAktif(sk.id)}
                      className="text-xs text-slate-500 hover:text-emerald-700 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer shrink-0"
                    >
                      Pilih
                    </button>
                  )}
                </div>

                {/* Details list */}
                <div className="mt-4 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Gudep: <strong className="text-slate-700 font-medium">{sk.gudep || '-'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Latihan: <strong className="text-slate-700 font-medium">{sk.hariLatihan || '-'}</strong></span>
                    <span className="text-slate-300">·</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{sk.jamLatihan || '-'}</span>
                  </div>

                  {/* Pembina Section */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pembina / Pelatih ({listPembina.length}):</span>
                      </div>
                      <button
                        onClick={() => {
                          setQuickAddSchoolId(sk.id);
                          setQuickPembinaName('');
                        }}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-0.5 font-medium cursor-pointer"
                        title="Tambah Pembina ke Sekolah Ini"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>+ Tambah</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {listPembina.length === 0 ? (
                        <span className="text-slate-400 italic text-[11px]">Belum ada pembina</span>
                      ) : (
                        listPembina.map((pName) => (
                          <span
                            key={pName}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] border border-slate-200"
                          >
                            <span>{pName}</span>
                            {pName === sk.pembina && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-semibold">
                                Utama
                              </span>
                            )}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {sk.kepalaSekolah && (
                    <div className="text-slate-500 pt-1 text-[11px] border-t border-slate-50">
                      Kamabigus: <strong className="text-slate-700">{sk.kepalaSekolah}</strong> {sk.nipKepsek ? `(NIP: ${sk.nipKepsek})` : ''}
                    </div>
                  )}
                  {sk.alamat && (
                    <p className="text-slate-500 line-clamp-1 text-[11px]">
                      {sk.alamat}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer: Metrics & Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>{totalSiswa} Siswa Terdaftar</span>
                  <span>{totalKegiatan} Jurnal Latihan</span>
                  <span className="font-medium text-slate-700 tabular-nums">{formatRupiah(sk.honorPerPertemuan || 0)}/sesi</span>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(sk)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus pangkalan "${sk.nama}"? Data siswa dan absensi terkait akan ikut terhapus.`)) {
                        onDeleteSekolah(sk.id);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {daftarSekolah.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-800">Belum ada data pangkalan</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Tambahkan sekolah pertama Anda untuk mulai mengelola siswa, absensi, dan jurnal latihan pramuka.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pangkalan Sekarang</span>
          </button>
        </div>
      )}

      {/* Quick Add Pembina Modal */}
      {quickAddSchoolId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-700" />
                <span>Tambah Pembina / Pelatih</span>
              </h3>
              <button
                onClick={() => setQuickAddSchoolId(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickAddSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Nama Lengkap Pembina / Pelatih *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={quickPembinaName}
                  onChange={(e) => setQuickPembinaName(e.target.value)}
                  placeholder="Contoh: Kak Dedy Gunawan, S.Pd"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickAddSchoolId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
                >
                  Simpan Pembina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Sekolah */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingId ? 'Edit Data Pangkalan' : 'Tambah Pangkalan Baru'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Isi identitas pangkalan, logo, pembina, dan jadwal latihan.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Nama Pangkalan / Sekolah *</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: SDN Percobaan 01"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>

              {/* FITUR UPLOAD DUA LOGO TERPISAH (LOGO PRAMUKA & LOGO PANGKALAN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Upload Logo Pramuka */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="text-xs font-semibold text-slate-800 block">Logo Gerakan Pramuka (Kiri)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={logoPramukaRef}
                      accept="image/*"
                      onChange={handleUploadLogoPramukaForm}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoPramukaRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer transition-colors shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>Upload Logo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoPramukaUrl(defaultScoutLogo)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                  {logoPramukaUrl && (
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={logoPramukaUrl}
                        alt="Logo Pramuka"
                        className="w-10 h-10 object-contain rounded border border-slate-300 bg-white p-0.5"
                      />
                      <span className="text-[10px] text-slate-500">Tampil di sisi kiri kop surat</span>
                    </div>
                  )}
                </div>

                {/* 2. Upload Logo Pangkalan */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="text-xs font-semibold text-slate-800 block">Logo Pangkalan / Sekolah (Kanan)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={logoPangkalanRef}
                      accept="image/*"
                      onChange={handleUploadLogoPangkalanForm}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoPangkalanRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer transition-colors shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>{logoPangkalanUrl ? 'Ganti Logo' : 'Upload Logo'}</span>
                    </button>
                    {logoPangkalanUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoPangkalanUrl('')}
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  {logoPangkalanUrl && (
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={logoPangkalanUrl}
                        alt="Logo Pangkalan"
                        className="w-10 h-10 object-contain rounded border border-slate-300 bg-white p-0.5"
                      />
                      <span className="text-[10px] text-slate-500">Tampil di sisi kanan kop surat</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Tingkat Golongan</label>
                  <select
                    value={tingkat}
                    onChange={(e) => setTingkat(e.target.value as TingkatSekolah)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 focus:border-emerald-600 bg-white"
                  >
                    <option value="SD">Siaga (SD)</option>
                    <option value="SMP">Penggalang (SMP)</option>
                    <option value="SMA">Penegak (SMA)</option>
                    <option value="SMK">Penegak (SMK)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Nomor Gudep</label>
                  <input
                    type="text"
                    value={gudep}
                    onChange={(e) => setGudep(e.target.value)}
                    placeholder="Misal: 04.081 - 04.082"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Hari Latihan</label>
                  <input
                    type="text"
                    value={hariLatihan}
                    onChange={(e) => setHariLatihan(e.target.value)}
                    placeholder="Contoh: Jumat"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 focus:border-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Jam Latihan</label>
                  <input
                    type="text"
                    value={jamLatihan}
                    onChange={(e) => setJamLatihan(e.target.value)}
                    placeholder="Contoh: 14:00 - 16:00"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* FITUR MULTI-PEMBINA & TAMBAH PEMBINA */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span>Daftar Pembina & Pelatih Gudep</span>
                  </label>
                  <span className="text-[11px] text-slate-500">{daftarPembina.length} Pembina Terdaftar</span>
                </div>

                {/* Input Add Pembina to this school */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPembinaInput}
                    onChange={(e) => setNewPembinaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPembinaToForm();
                      }
                    }}
                    placeholder="Nama Pembina / Pelatih Baru (e.g. Kak Nurul Hidayati)"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddPembinaToForm}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer shrink-0"
                  >
                    + Tambah
                  </button>
                </div>

                {/* Chips of added pembina */}
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {daftarPembina.map((pName) => (
                    <span
                      key={pName}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-medium shadow-2xs"
                    >
                      <span>{pName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePembinaFromForm(pName)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Hapus pembina dari daftar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {daftarPembina.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">Belum ada pembina yang ditambahkan.</p>
                  )}
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-200">
                  <label className="text-[11px] font-medium text-slate-600">Pembina Utama (Ditampilkan di Kartu / TTD Utama)</label>
                  <select
                    value={pembina}
                    onChange={(e) => setPembina(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                  >
                    <option value="">-- Pilih Pembina Utama --</option>
                    {daftarPembina.map((pName) => (
                      <option key={pName} value={pName}>
                        {pName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Nama Kepala Sekolah (Ka Mabigus)</label>
                  <input
                    type="text"
                    value={kepalaSekolah}
                    onChange={(e) => setKepalaSekolah(e.target.value)}
                    placeholder="Nama Lengkap & Gelar"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 focus:border-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={nipKepsek}
                    onChange={(e) => setNipKepsek(e.target.value)}
                    placeholder="NIP: 1974..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Tarif Honor Pelatih per Sesi / Pertemuan (Rp)</label>
                <input
                  type="number"
                  step="5000"
                  value={honorPerPertemuan}
                  onChange={(e) => setHonorPerPertemuan(Number(e.target.value))}
                  placeholder="80000"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 focus:border-emerald-600 tabular-nums"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Alamat Pangkalan</label>
                <textarea
                  rows={2}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Alamat sekolah, jalan, kecamatan, kota..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {editingId ? 'Simpan Perubahan' : 'Simpan Pangkalan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
