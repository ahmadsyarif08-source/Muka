import { AppState } from '../types';
import { INITIAL_STATE } from '../data/initialData';
import { defaultScoutLogo, defaultCampPhoto } from '../assets/assetUrls';

const STORAGE_KEY = 'sipramuka_ekskul_data_v1';

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    if (!parsed.daftarSekolah || !Array.isArray(parsed.daftarSekolah)) {
      return INITIAL_STATE;
    }
    // Backward compatibility & asset URL resolution for production Vercel
    parsed.daftarSekolah = parsed.daftarSekolah.map((s: any) => {
      let logoUrl = s.logoPramukaUrl;
      if (!logoUrl || logoUrl.includes('/src/assets/images/scout_insignia_emblem')) {
        logoUrl = defaultScoutLogo;
      }
      return {
        ...s,
        daftarPembina: s.daftarPembina && s.daftarPembina.length > 0 
          ? s.daftarPembina 
          : (s.pembina ? [s.pembina] : []),
        logoPramukaUrl: logoUrl,
        logoPangkalanUrl: s.logoPangkalanUrl || s.logoUrl || undefined,
      };
    });

    if (Array.isArray(parsed.kegiatan)) {
      parsed.kegiatan = parsed.kegiatan.map((k: any) => {
        if (k.fotoDokumentasi && k.fotoDokumentasi.includes('/src/assets/images/scout_activity_camp')) {
          return { ...k, fotoDokumentasi: defaultCampPhoto };
        }
        return k;
      });
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse localStorage state:', err);
    return INITIAL_STATE;
  }
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

export const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const formatTanggalIndo = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatTanggalSaja = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatBulanTahunIndo = (monthStr: string): string => {
  if (!monthStr) return '-';
  const parts = monthStr.split('-');
  if (parts.length === 2) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(d);
  }
  return monthStr;
};

export const generateUid = (prefix = 'id'): string => {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
};
