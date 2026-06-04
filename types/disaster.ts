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
  waktu_kejadian: string; // Disimpan sebagai ISO string untuk mempermudah serialisasi
  jenis_bencana: JenisBencana;
  deskripsi: string;
  koordinat: Koordinat;
  foto_url: string;
  status: StatusBencana;
  catatan_relawan?: string;
  pelapor_id: string; // UID dari Anonymous Auth
  relawan_id?: string;
  foto_after_url?: string;
  waktu_selesai?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  nama: string;
  role: UserRole;
}
