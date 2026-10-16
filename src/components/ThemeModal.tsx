import React from 'react';
import { AppTheme, AppThemeId, APP_THEMES } from '../utils/theme';
import { Palette, Check, X, Sparkles } from 'lucide-react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: AppThemeId;
  onSelectTheme: (theme: AppTheme) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs no-print">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Tema Tampilan Menu Aplikasi</h3>
              <p className="text-xs text-slate-400">Pilih palet nuansa kepramukaan dan institusi pendidikan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Grid */}
        <div className="p-5 space-y-3 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {APP_THEMES.map((theme) => {
              const isSelected = theme.id === currentThemeId;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme);
                  }}
                  className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-2 border-emerald-600 dark:border-amber-400 bg-emerald-50/50 dark:bg-slate-800 ring-2 ring-emerald-500/20 dark:ring-amber-400/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* Swatch */}
                      <div
                        className="w-7 h-7 rounded-lg shadow-inner flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: theme.previewColor }}
                      >
                        <span className="opacity-90">⚜</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          {theme.name}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-emerald-700 dark:bg-amber-400 text-white dark:text-slate-950 shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {theme.subtitle}
                  </p>

                  {/* Sample mini preview bar */}
                  <div className="flex items-center gap-1 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block shadow-2xs"
                      style={{ backgroundColor: theme.previewColor }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block shadow-2xs"
                      style={{ backgroundColor: theme.secondaryColor }}
                    />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                      {theme.isDark ? 'Tema Malam' : 'Tema Terang'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Pilihan tema akan otomatis tersimpan di peramban ini.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
