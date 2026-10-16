import React, { useRef } from 'react';
import { AppState } from '../types';
import { INITIAL_STATE } from '../data/initialData';
import { Download, Upload, RotateCcw, ShieldCheck, AlertTriangle } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onRestoreState: (newState: AppState) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  state,
  onRestoreState,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sipramuka_backup_${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.daftarSekolah && Array.isArray(parsed.daftarSekolah)) {
          onRestoreState(parsed);
          alert('Data berhasil dipulihkan dari cadangan file JSON!');
          onClose();
        } else {
          alert('Format file cadangan tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data ke data demo awal? Semua perubahan akan digantikan.')) {
      onRestoreState(INITIAL_STATE);
      alert('Data telah dikembalikan ke contoh awal.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-semibold text-slate-900">Cadangan & Pemulihan Data</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Semua data tersimpan otomatis di browser lokal Anda (Offline & Cepat). Anda dapat mengekspor data ke file
          JSON untuk diarsipkan atau dipindahkan ke komputer lain.
        </p>

        {/* Current Data Summary */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1 text-slate-700">
          <div className="flex justify-between">
            <span>Pangkalan Sekolah:</span>
            <span className="font-semibold text-slate-900">{state.daftarSekolah.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Anggota Siswa:</span>
            <span className="font-semibold text-slate-900">{state.siswa.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Catatan Jurnal Latihan:</span>
            <span className="font-semibold text-slate-900">{state.kegiatan.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Rekap Honor Pelatih:</span>
            <span className="font-semibold text-slate-900">{state.honor.length}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleExportJSON}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Cadangan (Export JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Pulihkan Data (Import JSON)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={handleResetData}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Contoh Data Awal</span>
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
