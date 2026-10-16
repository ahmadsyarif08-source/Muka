export type TingkatSiaga = 'Mula' | 'Bantu' | 'Tata';
export type AreaPengembanganSiaga = 'Spiritual' | 'Emosional' | 'Sosial' | 'Intelektual' | 'Fisik';

export interface LangkahLatihanSiaga {
  tahap: 'Pendahuluan' | 'Inti' | 'Penutup';
  waktu: string;
  kegiatan: string;
}

export interface ButirSkuSiaga {
  id: string;
  nomor: number;
  tingkat: TingkatSiaga;
  area: AreaPengembanganSiaga;
  bunyiSku: string;
  judulMateri: string;
  uraianMateri: string[];
  panduanPengujian: string;
  indikatorPencapaian: string;
  aktivitasPermainan: string;
  alatBahan: string[];
  durasiMenit?: number;
  langkah?: LangkahLatihanSiaga[];
}
