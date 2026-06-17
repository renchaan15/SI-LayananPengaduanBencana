"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { signInAnonymously } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { LaporanBencana, JenisBencana } from "@/types/disaster";
import {
  MapPin,
  Camera,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ChevronDown,
  Shield,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";

type KoordinatType = { lat: number; lng: number; akurasi: number } | null;
type StatusKirim = "idle" | "loading" | "sukses" | "gagal";

export default function WargaPage() {
  const [koordinat, setKoordinat] = useState<KoordinatType>(null);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [statusKirim, setStatusKirim] = useState<StatusKirim>("idle");
  const [pesanError, setPesanError] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [idResi, setIdResi] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // ─── Otentikasi Anonim di Background ────────────────────────────────────────
  useEffect(() => {
    signInAnonymously(auth)
      .then((cred) => setUid(cred.user.uid))
      .catch((err) => console.error("Auth error:", err));
  }, []);

  // ─── Ambil lokasi GPS ───────────────────────────────────────────────────────
  const getLokasi = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung geolokasi.");
      return;
    }
    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setKoordinat({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          akurasi: Math.round(pos.coords.accuracy),
        });
        setLoadingGeo(false);
      },
      (err) => {
        console.error("Gagal mendapatkan lokasi:", err);
        alert("Gagal mengambil lokasi. Pastikan izin lokasi (GPS) sudah aktif.");
        setLoadingGeo(false);
      },
      { timeout: 15000, enableHighAccuracy: true }
    );
  };

  // ─── Handle pilih & hapus foto ──────────────────────────────────────────────
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5 MB.");
      return;
    }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const hapusFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Copy ID Resi ────────────────────────────────────────────────────────────
  const copyResi = () => {
    navigator.clipboard.writeText(idResi).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ─── Submit laporan ke Firebase & Cloudinary ────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPesanError("");

    if (!koordinat) return setPesanError("Harap deteksi titik lokasi terlebih dahulu.");
    if (!fotoFile) return setPesanError("Harap unggah bukti foto kejadian.");
    if (!uid) return setPesanError("Sistem sedang menyiapkan sesi Anda, mohon tunggu sebentar lalu coba lagi.");

    setStatusKirim("loading");

    try {
      const foto_url = await uploadImageToCloudinary(fotoFile);

      if (!formRef.current) throw new Error("Form tidak ditemukan");
      const formData = new FormData(formRef.current);
<<<<<<< HEAD
      
=======
>>>>>>> 69617d2e67bb988dafe96d979059a5b1d7ff53d8
      const payload: LaporanBencana = {
        waktu_kejadian: new Date().toISOString(),
        jenis_bencana: formData.get("jenis") as JenisBencana,
        deskripsi: formData.get("deskripsi") as string,
        koordinat,
        foto_url,
        status: "Menunggu",
        pelapor_id: uid,
<<<<<<< HEAD
        
        // ── FITUR BARU: Data Pelapor & Default Kuantitas Relawan ──
        nama_pelapor: formData.get("nama_pelapor") as string || "Warga Anonim",
        telepon_pelapor: formData.get("telepon_pelapor") as string || "-",
        kebutuhan_relawan: 5, // Asumsi default: butuh 5 relawan per kejadian
        relawan_terlibat: [], // Array kosong saat laporan pertama kali dibuat
=======
>>>>>>> 69617d2e67bb988dafe96d979059a5b1d7ff53d8
      };

      const docRef = await addDoc(collection(db, "laporan"), payload);

      setIdResi(docRef.id);
      setStatusKirim("sukses");
      formRef.current?.reset();
      setKoordinat(null);
      hapusFoto();
    } catch (err) {
      console.error(err);
      setStatusKirim("gagal");
      setPesanError("Terjadi kesalahan sistem. Pastikan koneksi internet Anda stabil.");
    }
  };

  // ─── Render UI Layar Sukses ─────────────────────────────────────────────────
  if (statusKirim === "sukses") {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col relative font-sans pb-28 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-100 rounded-full blur-[80px] opacity-60" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-green-100 rounded-full blur-[60px] opacity-50" />
        </div>

        <div className="flex-1 flex items-center justify-center px-5 relative z-10">
          <div className="max-w-sm w-full flex flex-col items-center text-center">
            {/* Success Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-200 border border-emerald-300 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border border-emerald-300 animate-ping opacity-25" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Laporan Terkirim!</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs">
              Tim nagari akan segera merespons. Simpan nomor tiket di bawah untuk melacak status penanganan.
            </p>

            {/* Ticket ID Card */}
            <div className="mt-7 w-full p-5 bg-white border border-slate-200 rounded-2xl relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl" />
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.15em] mb-2">
                Nomor Tiket Resi
              </p>
              <p className="text-lg font-mono font-bold text-emerald-700 tracking-wider break-all leading-snug">
                {idResi}
              </p>
              <button
                onClick={copyResi}
                className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-600">Tersalin!</span></>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /><span>Salin nomor tiket</span></>
                )}
              </button>
            </div>

            <button
              onClick={() => { setStatusKirim("idle"); setIdResi(""); }}
              className="mt-5 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
            >
              Kembali ke Beranda
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <BottomNav />
      </main>
    );
  }

  // ─── Render UI Form Utama ───────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans pb-28">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-red-100 rounded-full blur-[70px] opacity-70" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-orange-100 rounded-full blur-[80px] opacity-60" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-rose-100 rounded-full blur-[60px] opacity-50" />
      </div>

      <div className="max-w-md mx-auto min-h-screen flex flex-col relative z-10 px-4 py-6">

        {/* ── HEADER ── */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-200">
              <Shield className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                Lapor!
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                Siaga Nagari Lolo
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all active:scale-95 shadow-sm"
          >
            Portal Petugas
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </header>

        {/* ── HERO TEXT ── */}
        <div className="mb-5 px-1">
          <h2 className="text-[28px] font-bold text-slate-900 leading-tight tracking-tight">
            Ada Kejadian<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
              Darurat?
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Laporan Anda akan langsung diterima oleh Wali Nagari dan relawan lapangan.
          </p>
        </div>

        {/* ── FORM CARD ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden relative flex-1 shadow-sm">

          {/* Loading Overlay */}
          {statusKirim === "loading" && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800">Mengirim Laporan…</p>
                <p className="text-xs text-slate-400 mt-1">Mengenkripsi & mengunggah data</p>
              </div>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-5">

            {/* Jenis Bencana */}
            <div className="space-y-2">
              <label htmlFor="jenis" className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
                Jenis Bencana
              </label>
              <div className="relative">
                <select
                  id="jenis"
                  name="jenis"
                  required
                  defaultValue=""
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Pilih jenis bencana…</option>
                  <option value="Longsor">🌄 Longsor</option>
                  <option value="Banjir">🌊 Banjir</option>
                  <option value="Pohon Tumbang">🌳 Pohon Tumbang</option>
                  <option value="Kebakaran">🔥 Kebakaran</option>
                  <option value="Lainnya">⚠️ Lainnya</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Detail Singkat */}
            <div className="space-y-2">
              <label htmlFor="deskripsi" className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
                Detail Singkat
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                placeholder="Contoh: Pohon beringin tumbang menutupi akses jalan raya…"
                required
                minLength={10}
                rows={3}
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all placeholder:text-slate-300 resize-none text-slate-700"
              />
            </div>

<<<<<<< HEAD
            {/* ── FITUR BARU: Kontak Darurat (Nama & Telepon Pelapor) ── */}
            <div className="space-y-3 bg-blue-50/40 border border-blue-100 p-4 rounded-xl">
              <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                Kontak Darurat (Opsional / Rahasia)
              </label>
              <input
                type="text"
                name="nama_pelapor"
                placeholder="Nama Lengkap"
                className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-700 placeholder:text-slate-400 transition-all"
              />
              <input
                type="tel"
                name="telepon_pelapor"
                placeholder="Nomor HP / WhatsApp"
                className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-700 placeholder:text-slate-400 transition-all"
              />
            </div>

=======
>>>>>>> 69617d2e67bb988dafe96d979059a5b1d7ff53d8
            {/* Lokasi & Foto */}
            <div className="grid grid-cols-2 gap-3">
              {/* Tombol Lokasi GPS */}
              <button
                type="button"
                onClick={getLokasi}
                disabled={loadingGeo}
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border-2 border-dashed transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed min-h-[110px] ${
                  koordinat
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${koordinat ? "bg-emerald-100" : "bg-slate-200"}`}>
                  {loadingGeo ? (
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                  ) : (
                    <MapPin className={`w-5 h-5 ${koordinat ? "text-emerald-600" : "text-slate-500"}`} strokeWidth={1.75} />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold leading-tight">
                    {loadingGeo ? "Melacak…" : koordinat ? `±${koordinat.akurasi}m` : "Titik Lokasi"}
                  </p>
                  {koordinat && (
                    <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Terdeteksi ✓</p>
                  )}
                </div>
              </button>

              {/* Upload Foto */}
              {fotoPreview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-slate-200 min-h-[110px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fotoPreview} alt="Pratinjau foto" className="w-full h-full object-cover absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <button
                    type="button"
                    onClick={hapusFoto}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all shadow-md"
                    aria-label="Hapus foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border-2 border-dashed bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100 transition-all cursor-pointer active:scale-95 min-h-[110px]">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-slate-500" strokeWidth={1.75} />
                  </div>
                  <p className="text-xs font-semibold text-center">Upload Foto</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Pesan Error */}
            {pesanError && (
              <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-sm text-red-700 leading-snug">{pesanError}</p>
              </div>
            )}

            {/* Tombol Kirim */}
            <button
              type="submit"
              disabled={statusKirim === "loading"}
              className="w-full mt-1 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg shadow-red-200"
            >
              <Send className="w-4 h-4" strokeWidth={2} />
              Kirim Laporan Darurat
            </button>

          </form>
        </div>

        {/* ── FOOTER ── */}
        <p className="text-center text-[11px] text-slate-400 mt-6 font-medium">
          Sistem Informasi Layanan Bencana &copy; {new Date().getFullYear()}
        </p>

      </div>

      <BottomNav />
    </main>
  );
}