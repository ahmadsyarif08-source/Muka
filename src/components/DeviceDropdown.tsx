import React, { useState, useRef, useEffect } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  ChevronDown,
  Check,
  RotateCw,
  Maximize2,
  X,
  Sparkles,
} from 'lucide-react';

export type DeviceType = 'web' | 'tablet' | 'android' | 'iphone';
export type DeviceOrientation = 'portrait' | 'landscape';

export interface DeviceConfig {
  id: DeviceType;
  name: string;
  badge: string;
  description: string;
  width: number;
  height: number;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

export const DEVICE_OPTIONS: DeviceConfig[] = [
  {
    id: 'web',
    name: 'Web (Desktop)',
    badge: '100% Layar',
    description: 'Tampilan penuh desktop & laptop (responsif standar)',
    width: 0, // 100%
    height: 0,
    icon: Monitor,
    accentColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'tablet',
    name: 'Tablet (iPad / Tab)',
    badge: '820 x 1180 px',
    description: 'Simulasi layar iPad & Android Tablet ukuran 10-11 inch',
    width: 820,
    height: 1180,
    icon: Tablet,
    accentColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'android',
    name: 'Android (Galaxy / Pixel)',
    badge: '412 x 915 px',
    description: 'Simulasi smartphone Android (Samsung Galaxy, Google Pixel)',
    width: 412,
    height: 915,
    icon: Smartphone,
    accentColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'iphone',
    name: 'iPhone (iOS)',
    badge: '393 x 852 px',
    description: 'Simulasi smartphone Apple iPhone 15/16 Pro (Dynamic Island)',
    width: 393,
    height: 852,
    icon: Smartphone,
    accentColor: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
  },
];

interface DeviceDropdownProps {
  currentDevice: DeviceType;
  onSelectDevice: (device: DeviceType) => void;
  orientation?: DeviceOrientation;
  onToggleOrientation?: () => void;
  isDark?: boolean;
}

export const DeviceDropdown: React.FC<DeviceDropdownProps> = ({
  currentDevice,
  onSelectDevice,
  orientation = 'portrait',
  onToggleOrientation,
  isDark = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConfig = DEVICE_OPTIONS.find((d) => d.id === currentDevice) || DEVICE_OPTIONS[0];
  const ActiveIcon = activeConfig.icon;

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap border ${
          currentDevice !== 'web'
            ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs hover:bg-emerald-800'
            : isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-200'
        }`}
        title="Pilih Tampilan Perangkat: Web, Tablet, Android, iPhone"
      >
        <ActiveIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Perangkat:</span>
        <span className="font-bold">
          {currentDevice === 'web'
            ? 'Web'
            : currentDevice === 'tablet'
            ? 'Tablet'
            : currentDevice === 'android'
            ? 'Android'
            : 'iPhone'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800 dark:text-slate-100">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Simulasi Tampilan Perangkat
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih ukuran layar untuk menguji responsivitas aplikasi
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Device Options List */}
          <div className="p-2 space-y-1">
            {DEVICE_OPTIONS.map((device) => {
              const Icon = device.icon;
              const isSelected = currentDevice === device.id;

              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => {
                    onSelectDevice(device.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 border ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-2xs'
                      : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg border mt-0.5 shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : device.accentColor
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {device.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {device.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {device.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="shrink-0 self-center text-emerald-600 dark:text-emerald-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Orientation Control in Dropdown if in mobile/tablet mode */}
          {currentDevice !== 'web' && onToggleOrientation && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                Orientasi: <strong>{orientation === 'portrait' ? 'Tegak (Portrait)' : 'Mendatar (Landscape)'}</strong>
              </span>
              <button
                type="button"
                onClick={onToggleOrientation}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 shadow-2xs cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Putar Layar</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
