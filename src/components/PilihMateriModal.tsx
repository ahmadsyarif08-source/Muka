import React, { useState, useMemo } from 'react';
import { MATERI_BANK, MateriSiapPakai } from '../data/materiBank';
import { SKU_SIAGA_LENGKAP, ButirSkuSiaga } from '../data/skuSiagaData';
import { KategoriMateri } from '../types';
import {
  X,
  Search,
  BookOpen,
  Check,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Award,
} from 'lucide-react';

interface PilihMateriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMateri: (materi: MateriSiapPakai) => void;
}

export const PilihMateriModal: React.FC<PilihMateriModalProps> = ({
  isOpen,
  onClose,
  onSelectMateri,
}) => {
  const [sourceType, setSourceType] = useState<'silabus' | 'sku-siaga'>('silabus');

  // Silabus filters
  const [selectedSemester, setSelectedSemester] = useState<'Semua' | '1' | '2'>('Semua');
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');

  // SKU Siaga filters
  const [selectedTingkatSiaga, setSelectedTingkatSiaga] = useState<string>('Semua');
  const [selectedAreaSiaga, setSelectedAreaSiaga] = useState<string>('Semua');

  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSilabus = useMemo(() => {
    return MATERI_BANK.filter((item) => {
      const matchSemester =
        selectedSemester === 'Semua' || item.semester.toString() === selectedSemester;
      const matchKategori = selectedKategori === 'Semua' || item.kategori === selectedKategori;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.judul.toLowerCase().includes(q) ||
        item.tujuan.toLowerCase().includes(q) ||
        (item.kodeSKU && item.kodeSKU.toLowerCase().includes(q)) ||
        item.bulanEstimasi.toLowerCase().includes(q);
      return matchSemester && matchKategori && matchSearch;
    });
  }, [selectedSemester, selectedKategori, searchQuery]);

  const filteredSkuSiaga = useMemo(() => {
    return SKU_SIAGA_LENGKAP.filter((item) => {
      const matchTingkat =
        selectedTingkatSiaga === 'Semua' || item.tingkat === selectedTingkatSiaga;
      const matchArea = selectedAreaSiaga === 'Semua' || item.area === selectedAreaSiaga;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.bunyiSku.toLowerCase().includes(q) ||
        item.judulMateri.toLowerCase().includes(q) ||
        item.indikatorPencapaian.toLowerCase().includes(q) ||
        item.nomor.toString() === q ||
        `butir ${item.nomor}`.includes(q);
      return matchTingkat && matchArea && matchSearch;
    });
  }, [selectedTingkatSiaga, selectedAreaSiaga, searchQuery]);

  const handleSelectSku = (sku: ButirSkuSiaga) => {
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
            'Upacara pembukaan lingkaran perindukan Siaga, salam, doa bersama, dan pengantar materi ' +
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
    onSelectMateri(materiAdapted);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs no-print">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col text-slate-800 dark:text-slate-100 max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                Pilih dari Bank Materi & SKU Siaga
              </h3>
              <p className="text-xs text-slate-400">
                Pilih silabus 1 tahun atau 100 butir resmi SKU Siaga (Mula, Bantu, Tata) untuk dimasukkan ke Jurnal.
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

        {/* Source Selector Tab */}
        <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setSourceType('silabus')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              sourceType === 'silabus'
                ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Silabus 1 Tahun (36 Pertemuan)</span>
          </button>
          <button
            type="button"
            onClick={() => setSourceType('sku-siaga')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              sourceType === 'sku-siaga'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>SKU Siaga Lengkap (100 Butir)</span>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
          {sourceType === 'silabus' ? (
            <>
              {/* Semester Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Semester:
                </span>
                <div className="inline-flex p-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedSemester('Semua')}
                    className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                      selectedSemester === 'Semua'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Semua
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
                    Semester 1 (Ganjil)
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
                    Semester 2 (Genap)
                  </button>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
                {['Semua', 'Tekpram', 'PBB', 'SKU', 'SKK', 'Outbound', 'Upacara'].map((kat) => (
                  <button
                    key={kat}
                    type="button"
                    onClick={() => setSelectedKategori(kat)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                      selectedKategori === kat
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {kat}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Tingkat Siaga Tabs */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Tingkat:
                </span>
                <div className="inline-flex p-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedTingkatSiaga('Semua')}
                    className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                      selectedTingkatSiaga === 'Semua'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Semua (100)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTingkatSiaga('Mula')}
                    className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                      selectedTingkatSiaga === 'Mula'
                        ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Mula (34)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTingkatSiaga('Bantu')}
                    className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                      selectedTingkatSiaga === 'Bantu'
                        ? 'bg-teal-700 text-white font-bold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Bantu (33)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTingkatSiaga('Tata')}
                    className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                      selectedTingkatSiaga === 'Tata'
                        ? 'bg-green-800 text-white font-bold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Tata (33)
                  </button>
                </div>
              </div>

              {/* Area SESOSIF Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
                {['Semua', 'Spiritual', 'Emosional', 'Sosial', 'Intelektual', 'Fisik'].map(
                  (area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setSelectedAreaSiaga(area)}
                      className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                        selectedAreaSiaga === area
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {area}
                    </button>
                  )
                )}
              </div>
            </>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                sourceType === 'silabus'
                  ? 'Cari judul materi, simpul, sandi, morse, PBB...'
                  : 'Cari nomor butir, bunyi SKU, atau materi pokok Siaga...'
              }
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-emerald-600"
            />
          </div>
        </div>

        {/* List of items */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-xs">
          {sourceType === 'silabus' ? (
            filteredSilabus.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                Tidak ada materi silabus yang sesuai filter.
              </div>
            ) : (
              filteredSilabus.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectMateri(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200">
                        P-{item.pertemuanKe}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                        Sem {item.semester} ({item.bulanEstimasi})
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {item.kategori}
                      </span>
                      <span className="text-[10px] text-slate-400">· {item.tingkat}</span>
                      <span className="text-[10px] text-slate-400">· {item.durasiMenit} Menit</span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {item.judul}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.tujuan}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold text-xs group-hover:bg-emerald-800 shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Pilih</span>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )
          ) : filteredSkuSiaga.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              Tidak ada butir SKU Siaga yang sesuai filter.
            </div>
          ) : (
            filteredSkuSiaga.map((sku) => (
              <div
                key={sku.id}
                onClick={() => handleSelectSku(sku)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-700 text-white">
                      Siaga {sku.tingkat}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200">
                      Butir No. {sku.nomor}
                    </span>
                    <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                      {sku.area}
                    </span>
                    <span className="text-[10px] text-slate-400">· 90 Menit</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {sku.judulMateri}
                  </h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 italic line-clamp-1">
                    "{sku.bunyiSku}"
                  </p>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold text-xs group-hover:bg-emerald-800 shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>Pilih</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            {sourceType === 'silabus'
              ? `${filteredSilabus.length} materi silabus tersedia`
              : `${filteredSkuSiaga.length} butir SKU Siaga tersedia`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
