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
  waktu_kejadian: string; // ISO string
  jenis_bencana: JenisBencana;
  deskripsi: string;
  koordinat: Koordinat;
  foto_url: string;
  status: StatusBencana;
  pelapor_id: string;
  // Optional reporter details
  nama_pelapor?: string;
  telepon_pelapor?: string;
  // Optional volunteer-related fields
  kebutuhan_relawan?: number;
  relawan_terlibat?: string[];
  relawan_data?: Array<{ uid: string; nama: string }>;
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
