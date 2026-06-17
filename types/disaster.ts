export interface Koordinat {
  lat: number;
  lng: number;
  akurasi: number;
}

export type JenisBencana = "Longsor" | "Banjir" | "Pohon Tumbang" | "Lainnya";
export type StatusBencana = "Menunggu" | "Diproses" | "Selesai";
export type UserRole = "relawan" | "admin" | "menunggu_verifikasi";

export interface LaporanBencana {
  id?: string;
  waktu_kejadian: string;
  jenis_bencana: string;
  deskripsi: string;
  koordinat: { lat: number; lng: number };
  foto_url: string;
  status: "Menunggu" | "Diproses" | "Selesai";
  pelapor_id: string;
  
  nama_pelapor?: string;
  telepon_pelapor?: string;
  kebutuhan_relawan?: number; 
  relawan_terlibat?: string[]; 
  
  // (opsional) properti lama
  relawan_id?: string; 
  catatan_relawan?: string;
  foto_after_url?: string;
  waktu_selesai?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  nama: string;
  role: UserRole;
}
