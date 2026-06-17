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
<<<<<<< HEAD
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
=======
  waktu_kejadian: string; // Disimpan sebagai ISO string untuk mempermudah serialisasi
  jenis_bencana: JenisBencana;
  deskripsi: string;
  koordinat: Koordinat;
  foto_url: string;
  status: StatusBencana;
  catatan_relawan?: string;
  pelapor_id: string; // UID dari Anonymous Auth
  relawan_id?: string;
>>>>>>> 69617d2e67bb988dafe96d979059a5b1d7ff53d8
  foto_after_url?: string;
  waktu_selesai?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  nama: string;
  role: UserRole;
}
