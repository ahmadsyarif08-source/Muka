import React, { useState, useEffect } from 'react';
import { DeviceType, DeviceOrientation, DEVICE_OPTIONS } from './DeviceDropdown';
import {
  RotateCw,
  Maximize2,
  X,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  Battery,
  Signal,
  Check,
} from 'lucide-react';

interface DeviceFrameWrapperProps {
  currentDevice: DeviceType;
  orientation: DeviceOrientation;
  onSelectDevice: (device: DeviceType) => void;
  onToggleOrientation: () => void;
  children: React.ReactNode;
}

export const DeviceFrameWrapper: React.FC<DeviceFrameWrapperProps> = ({
  currentDevice,
  orientation,
  onSelectDevice,
  onToggleOrientation,
  children,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  // Real-time clock for device status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (currentDevice === 'web') {
    return <>{children}</>;
  }

  const deviceConfig = DEVICE_OPTIONS.find((d) => d.id === currentDevice) || DEVICE_OPTIONS[0];

  // Calculate width & height according to orientation
  let baseWidth = deviceConfig.width;
  let baseHeight = deviceConfig.height;

  if (orientation === 'landscape') {
    baseWidth = deviceConfig.height;
    baseHeight = deviceConfig.width;
  }

  return (
    <div className="min-h-screen bg-slate-950/90 text-slate-100 flex flex-col items-center py-4 px-2 sm:px-4 select-none">
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 mb-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold">
            {currentDevice === 'tablet' ? (
              <Tablet className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                Mode Simulasi: {deviceConfig.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold border border-emerald-400/30">
                {baseWidth} × {baseHeight} px
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Orientasi: {orientation === 'portrait' ? 'Tegak (Portrait)' : 'Mendatar (Landscape)'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Rotate Orientation Button */}
          <button
            type="button"
            onClick={onToggleOrientation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold cursor-pointer transition-colors"
            title="Putar Orientasi Layar (Portrait / Landscape)"
          >
            <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Putar Layar</span>
          </button>

          {/* Scale Selector */}
          <div className="inline-flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[11px]">
            <button
              type="button"
              onClick={() => setScale(0.85)}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                scale === 0.85 ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              85%
            </button>
            <button
              type="button"
              onClick={() => setScale(1)}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                scale === 1 ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              100%
            </button>
          </div>

          {/* Reset to Web Button */}
          <button
            type="button"
            onClick={() => onSelectDevice('web')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer transition-colors"
            title="Keluar dari simulasi dan kembali ke tampilan Web Penuh"
          >
            <X className="w-3.5 h-3.5" />
            <span>Kembali ke Web</span>
          </button>
        </div>
      </div>

      {/* Realistic Device Hardware Frame Container */}
      <div
        className="transition-transform duration-200 origin-top flex justify-center w-full"
        style={{ transform: `scale(${scale})` }}
      >
        <div
          className={`relative bg-slate-900 shadow-2xl transition-all duration-300 flex flex-col overflow-hidden border-[10px] ${
            currentDevice === 'iphone'
              ? 'border-slate-800 rounded-[50px] ring-1 ring-slate-700'
              : currentDevice === 'android'
              ? 'border-slate-800 rounded-[38px] ring-1 ring-slate-700'
              : 'border-slate-800 rounded-[32px] ring-1 ring-slate-700'
          }`}
          style={{
            width: `${baseWidth}px`,
            maxWidth: '100%',
            height: `${baseHeight}px`,
          }}
        >
          {/* HARDWARE STATUS BAR (iOS / Android / Tablet) */}
          <div className="h-10 bg-slate-900 text-slate-100 flex items-center justify-between px-6 shrink-0 relative z-30 select-none">
            {/* Left: Clock */}
            <div className="font-semibold text-xs font-mono tracking-tight">{currentTime}</div>

            {/* Center Hardware Feature: Dynamic Island (iPhone) or Punch Hole (Android) or Tablet Dot */}
            {currentDevice === 'iphone' ? (
              <div className="absolute left-1/2 -translate-x-1/2 top-2 w-28 h-6 bg-black rounded-full flex items-center justify-end pr-2 gap-1.5 shadow-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            ) : currentDevice === 'android' ? (
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 bg-black rounded-full border border-slate-800 shadow-inner" />
            ) : (
              <div className="absolute left-1/2 -translate-x-1/2 top-2 w-2.5 h-2.5 bg-slate-800 rounded-full" />
            )}

            {/* Right: Signal, Wifi, Battery */}
            <div className="flex items-center gap-2 text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span>98%</span>
              </div>
            </div>
          </div>

          {/* APPLICATION INNER SCREEN (Scrollable content) */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden bg-white dark:bg-slate-950 relative select-text">
            {children}
          </div>

          {/* HARDWARE BOTTOM BAR: Home Indicator (iOS) or Nav Pill (Android) */}
          <div className="h-5 bg-slate-900 flex items-center justify-center shrink-0 z-30 select-none">
            {currentDevice === 'iphone' ? (
              <div className="w-32 h-1 bg-slate-400/80 rounded-full" />
            ) : currentDevice === 'android' ? (
              <div className="w-20 h-1 bg-slate-500/80 rounded-full" />
            ) : (
              <div className="w-24 h-1 bg-slate-600 rounded-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
