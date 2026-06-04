"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { LaporanBencana } from "@/types/disaster";
import BottomNavRelawan from "@/components/BottomNavRelawan";
import {
  Map, Navigation, CheckCircle2, Loader2, X, LogOut, Clock,
  ShieldAlert, User, Image as ImageIcon, Check, Info
} from "lucide-react";

export default function RelawanPage() {
  const router = useRouter();
  const [laporan, setLaporan] = useState<LaporanBencana[]>([]);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"menunggu" | "tugas_saya">("menunggu");

  // State Modals
  const [selectedTask, setSelectedTask] = useState<LaporanBencana | null>(null); // Untuk Modal Selesai
  const [detailTask, setDetailTask] = useState<LaporanBencana | null>(null);     // Untuk Modal Detail Informasi

  const [fotoSelesai, setFotoSelesai] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.isAnonymous) router.replace("/login");
      else setUserUid(user.uid);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!userUid) return;
    const q = query(collection(db, "laporan"), where("status", "in", ["Menunggu", "Diproses"]));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LaporanBencana));
      data.sort((a, b) => new Date(b.waktu_kejadian).getTime() - new Date(a.waktu_kejadian).getTime());
      setLaporan(data);
    });
    return () => unsubscribe();
  }, [userUid]);

  const handleAmbilAlih = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah klik menembus ke card pembungkus
    if (!userUid) return;
    try {
      await updateDoc(doc(db, "laporan", id), { status: "Diproses", relawan_id: userUid });
      setActiveTab("tugas_saya");
    } catch (error) {
      alert("Gagal mengambil alih tugas.");
    }
  };

  // ─── FIX: URL Google Maps Direction ───
  const bukaNavigasi = (lat: number, lng: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("Ukuran maksimal 5 MB.");
    setFotoSelesai(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSelesaikanTugas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !selectedTask.id || !fotoSelesai) return;

    setIsSubmitting(true);
    try {
      const foto_after_url = await uploadImageToCloudinary(fotoSelesai);
      await updateDoc(doc(db, "laporan", selectedTask.id), {
        status: "Selesai", catatan_relawan: catatan, foto_after_url, waktu_selesai: new Date().toISOString()
      });
      setSelectedTask(null); setFotoSelesai(null); setFotoPreview(null); setCatatan("");
    } catch (error) {
      alert("Gagal menyelesaikan tugas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const laporanMenunggu = laporan.filter(l => l.status === "Menunggu");
  const tugasSaya = laporan.filter(l => l.status === "Diproses" && l.relawan_id === userUid);

  if (!userUid) return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <main className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans pb-32">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-100 rounded-full blur-[70px] opacity-60" />
      </div>

      <div className="max-w-md mx-auto relative z-10 px-4 py-6">
        <header className="flex justify-between items-center mb-6 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
              <ShieldAlert className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Posko Relawan</h1>
              <p className="text-[11px] text-slate-500 font-medium">Unit Reaksi Cepat</p>
            </div>
          </div>
          <button onClick={() => signOut(auth)} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <div className="flex bg-slate-200/50 p-1 rounded-xl mb-5">
          <button onClick={() => setActiveTab("menunggu")} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex justify-center items-center gap-2 ${activeTab === "menunggu" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>
            <Map className="w-4 h-4" /> Radar Masuk {laporanMenunggu.length > 0 && <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">{laporanMenunggu.length}</span>}
          </button>
          <button onClick={() => setActiveTab("tugas_saya")} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex justify-center items-center gap-2 ${activeTab === "tugas_saya" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>
            <User className="w-4 h-4" /> Tugas Saya {tugasSaya.length > 0 && <span className="bg-indigo-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">{tugasSaya.length}</span>}
          </button>
        </div>

        <div className="space-y-4">
          {(activeTab === "menunggu" ? laporanMenunggu : tugasSaya).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle2 className="w-8 h-8 text-slate-300" /></div>
              <h3 className="text-sm font-bold text-slate-700">Area Aman</h3>
              <p className="text-xs text-slate-400 mt-1">Belum ada tugas.</p>
            </div>
          ) : (
            (activeTab === "menunggu" ? laporanMenunggu : tugasSaya).map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all hover:border-indigo-300">

                {/* Area Konten Utama (Bisa Diklik untuk Detail) */}
                <div onClick={() => setDetailTask(item)} className="p-4 flex gap-4 items-start cursor-pointer group active:bg-slate-50">
                  <div className="w-16 h-16 rounded-xl shrink-0 overflow-hidden bg-slate-100 relative shadow-sm border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.foto_url} alt="Bencana" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{item.jenis_bencana}</h3>
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.waktu_kejadian).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.deskripsi}</p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-indigo-500">
                      Lihat Info Lengkap &rarr;
                    </div>
                  </div>
                </div>

                {/* Baris Tombol Aksi */}
                <div className="bg-slate-50 border-t border-slate-100 p-3 flex gap-2">
                  <button onClick={(e) => bukaNavigasi(item.koordinat.lat, item.koordinat.lng, e)} className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-blue-50 text-slate-700 text-xs font-bold rounded-xl flex justify-center items-center gap-2 transition-colors shadow-sm">
                    <Navigation className="w-4 h-4 text-blue-600" /> Google Maps
                  </button>

                  {activeTab === "menunggu" ? (
                    <button onClick={(e) => handleAmbilAlih(item.id as string, e)} className="flex-[1.5] py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex justify-center items-center gap-2 transition-colors shadow-md shadow-blue-200">
                      <Check className="w-4 h-4" /> Ambil Alih
                    </button>
                  ) : (
                    <button onClick={() => setSelectedTask(item)} className="flex-[1.5] py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex justify-center items-center gap-2 transition-colors shadow-md shadow-emerald-200">
                      <CheckCircle2 className="w-4 h-4" /> Selesaikan Misi
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── MODAL 1: INFORMASI DETAIL MISI ── */}
      {detailTask && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 duration-300 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><Info className="w-4 h-4" /></div>
                <h3 className="font-black text-slate-800">Briefing Misi</h3>
              </div>
              <button onClick={() => setDetailTask(null)} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500"><X className="w-4 h-4" /></button>
            </div>

            <div className="overflow-y-auto pb-6">
              {/* Foto Skala Penuh */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={detailTask.foto_url} alt="Bencana" className="w-full h-48 object-cover bg-slate-100" />

              <div className="p-5 space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kategori Bencana</p>
                  <p className="text-xl font-black text-slate-800">{detailTask.jenis_bencana}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kondisi Lapangan</p>
                  <p className="text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">{detailTask.deskripsi}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Waktu Kejadian</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(detailTask.waktu_kejadian).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${detailTask.status === 'Menunggu' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{detailTask.status}</span>
                  </div>
                </div>

                <button onClick={() => bukaNavigasi(detailTask.koordinat.lat, detailTask.koordinat.lng)} className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                  <Navigation className="w-5 h-5" /> Mulai Navigasi Rute Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: PENYELESAIAN TUGAS (Sama seperti sebelumnya) ── */}
      {selectedTask && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          {/* ... (Isi modal selesaikan tugas tidak berubah) ... */}
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
              <div><h3 className="font-bold text-slate-800">Validasi Selesai</h3><p className="text-[10px] text-slate-500">ID: {selectedTask.id}</p></div>
              <button onClick={() => setSelectedTask(null)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleSelesaikanTugas} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Bukti Penanganan</label>
                  {fotoPreview ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 h-40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fotoPreview} alt="Bukti" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setFotoSelesai(null); setFotoPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer h-40">
                      <ImageIcon className="w-8 h-8 text-slate-400" /><span className="text-xs font-semibold">Ambil Foto Hasil Kerja</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handleFotoChange} className="hidden" required />
                    </label>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Catatan Lapangan Singkat</label>
                  <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} required rows={3} className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 resize-none" />
                </div>
                <button type="submit" disabled={isSubmitting || !fotoSelesai} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all active:scale-95 disabled:opacity-60 flex justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isSubmitting ? "Menyimpan Data..." : "Selesaikan"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <BottomNavRelawan />
    </main>
  );
}