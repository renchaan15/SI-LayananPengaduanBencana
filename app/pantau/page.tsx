"use client";
import { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, query, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LaporanBencana } from "@/types/disaster";
import BottomNav from "@/components/BottomNav";

type RelawanData = { uid: string; nama: string };
import { Search, Activity, CheckCircle2, AlertTriangle, Clock, Info, X, Loader2, ChevronRight, Users } from "lucide-react";

export default function PantauPage() {
  const [laporanTerbaru, setLaporanTerbaru] = useState<LaporanBencana[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<LaporanBencana & { relawan_data?: RelawanData[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // ── FITUR BARU: Kamus Memori Nama Relawan ──
  const [namaRelawanMap, setNamaRelawanMap] = useState<Record<string, string>>({});
  const fetchedUids = useRef<Set<string>>(new Set());

  // ─── AMBIL FEED AKTIVITAS TERBARU (DENGAN SORTING PINTAR) ───
  useEffect(() => {
    // Kita naikkan limit jadi 30 agar ada cukup data untuk disortir
    const q = query(collection(db, "laporan"), orderBy("waktu_kejadian", "desc"), limit(30));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LaporanBencana));

      // ── LOGIKA SORTING PINTAR: YANG BELUM SELESAI NAIK KE ATAS ──
      data.sort((a, b) => {
        const aSelesai = a.status === 'Selesai';
        const bSelesai = b.status === 'Selesai';

        // Jika A sudah selesai tapi B belum, A dilempar ke bawah
        if (aSelesai && !bSelesai) return 1;
        // Jika B sudah selesai tapi A belum, A ditarik ke atas
        if (!aSelesai && bSelesai) return -1;

        // Jika status mereka berdua sama (sama-sama selesai atau sama-sama belum),
        // urutkan berdasarkan waktu paling baru
        return new Date(b.waktu_kejadian).getTime() - new Date(a.waktu_kejadian).getTime();
      });

      setLaporanTerbaru(data);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // ── FITUR BARU: Ambil Nama Relawan Secara Real-time Saat Modal Dibuka ──
  useEffect(() => {
    if (!searchResult || !searchResult.relawan_terlibat || searchResult.relawan_terlibat.length === 0) return;

    const ambilNamaRelawan = async () => {
      // Saring UID yang belum pernah dicari sebelumnya
      const missingUids = searchResult.relawan_terlibat!.filter(uid => !fetchedUids.current.has(uid));
      if (missingUids.length === 0) return;

      const newNames: Record<string, string> = {};
      
      for (const uid of missingUids) {
        fetchedUids.current.add(uid); // Tandai sedang/sudah dicari
        try {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            newNames[uid] = userDoc.data().name || userDoc.data().nama || "Relawan Lapangan";
          } else {
            newNames[uid] = `Relawan (${uid.slice(0, 6)})`;
          }
        } catch (error) {
          // Fallback jika tidak ada akses baca ke koleksi users untuk publik
          newNames[uid] = `Relawan (${uid.slice(0, 6)})`;
        }
      }

      setNamaRelawanMap(prev => ({ ...prev, ...newNames }));
    };

    ambilNamaRelawan();
  }, [searchResult]);

  // ─── FUNGSI PENCARIAN TIKET ───
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError("");
    setSearchResult(null);
    
    try {
      const docRef = doc(db, "laporan", searchQuery.trim());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSearchResult({ id: docSnap.id, ...docSnap.data() } as LaporanBencana);
      } else {
        setSearchError("Tiket resi tidak ditemukan. Pastikan ID sudah benar.");
      }
    } catch (error) {
      setSearchError("Gagal menghubungi server. Periksa koneksi internet Anda.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans pb-32 flex justify-center">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-100 rounded-full blur-[70px] opacity-60" />
      </div>
      
      <div className="w-full max-w-md mx-auto relative z-10 px-4 pt-8 py-6">
        
        {/* ── HEADER ── */}
        <header className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pantau Laporan</h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Lacak tiket atau pantau aktivitas penanganan.</p>
          </div>
        </header>

        {/* ── KOTAK PENCARIAN RESI ── */}
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Lacak Tiket Anda</label>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan ID Resi..." 
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all font-mono" 
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isSearching}
              className="px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-blue-200 disabled:opacity-70 flex items-center justify-center"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari"}
            </button>
          </form>

          {searchError && (
            <p className="text-xs text-red-500 font-medium mt-3 flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-100">
              <AlertTriangle className="w-3.5 h-3.5" /> {searchError}
            </p>
          )}
        </div>

        {/* ── FEED AKTIVITAS PUBLIK ── */}
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Aktivitas Terbaru</h2>
          <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold border border-indigo-100">Live Updates</span>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin mb-3" />
              <p className="text-xs font-bold text-slate-400">Memuat data lapangan...</p>
            </div>
          ) : laporanTerbaru.length === 0 ? (
            <div className="bg-white p-6 rounded-3xl text-center border border-slate-100 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Belum ada laporan masuk.</p>
            </div>
          ) : (
            laporanTerbaru.map((item) => {
              const isSelesai = item.status === 'Selesai';
              // Pengecekan aman untuk Ditangani atau Diproses
              const isProses = item.status === 'Diproses' || (item.status as string) === 'Ditangani';

              return (
                <div 
                  key={item.id} 
                  onClick={() => setSearchResult(item)} 
                  className={`p-4 rounded-3xl shadow-sm border flex gap-4 items-start transition-all cursor-pointer group ${
                    isSelesai 
                      ? 'bg-slate-50/50 border-slate-100 opacity-75 hover:opacity-100' // Visual sedikit pudar untuk yang selesai
                      : 'bg-white border-blue-100 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.foto_url} alt={item.jenis_bencana} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                      isSelesai ? 'bg-emerald-500 text-white' : isProses ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {isSelesai ? <CheckCircle2 className="w-3 h-3" /> : isProses ? <Clock className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{item.jenis_bencana}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                        isSelesai ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        isProses ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{item.deskripsi}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(item.waktu_kejadian).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Lihat Info <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── MODAL HASIL PENCARIAN & DETAIL FEED ── */}
      {searchResult && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl animate-in slide-in-from-bottom-10 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                <h3 className="font-black text-slate-800">Detail Laporan</h3>
              </div>
              <button onClick={() => setSearchResult(null)} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-y-auto pb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={searchResult.foto_url} alt="Bukti" className="w-full h-48 object-cover bg-slate-100" />

              <div className="p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori Kejadian</p>
                    <p className="text-xl font-black text-slate-800 mt-1">{searchResult.jenis_bencana}</p>
                  </div>
                  
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${
                    searchResult.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    (searchResult.status === 'Diproses' || (searchResult.status as string) === 'Ditangani') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {searchResult.status === 'Selesai' ? <CheckCircle2 className="w-4 h-4" /> : 
                     (searchResult.status === 'Diproses' || (searchResult.status as string) === 'Ditangani') ? <Clock className="w-4 h-4" /> : 
                     <AlertTriangle className="w-4 h-4" />}
                    {searchResult.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deskripsi Kondisi</p>
                    <p className="text-sm font-medium text-slate-900 mt-1.5 leading-relaxed">{searchResult.deskripsi}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu Lapor</p>
                      <p className="text-xs font-bold text-slate-800 mt-1">{`${new Date(searchResult.waktu_kejadian).toLocaleDateString('id-ID', { weekday: 'long' })}, ${new Date(searchResult.waktu_kejadian).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}`}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Tiket (Resi)</p>
                      <p className="text-[10px] font-mono font-bold text-slate-500 mt-1">{searchResult.id}</p>
                    </div>
                  </div>
                </div>

                {/* ── FITUR BARU: TIM RELAWAN YANG MENANGANI ── */}
                {((searchResult.relawan_data && searchResult.relawan_data.length > 0) || (searchResult.relawan_terlibat && searchResult.relawan_terlibat.length > 0)) && (
                  <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Tim Relawan Bertugas
                      </p>
                      <span className="bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {(searchResult.relawan_data?.length || searchResult.relawan_terlibat?.length || 0)} / {searchResult.kebutuhan_relawan || 5}
                      </span>
                    </div>
                    <ul className="space-y-1.5 mt-2">
                      {searchResult.relawan_data ? (
                        searchResult.relawan_data.map((relawan, idx) => (
                          <li key={relawan.uid} className="text-xs font-medium text-indigo-900 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0">{idx + 1}</div>
                            <span className="font-semibold truncate">{relawan.nama}</span>
                          </li>
                        ))
                      ) : (
                        // Fallback untuk laporan lama
                        searchResult.relawan_terlibat?.map((uid, idx) => (
                          <li key={uid} className="text-xs font-medium text-indigo-900 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0">{idx + 1}</div>
                            <span className="font-semibold truncate">
                              {namaRelawanMap[uid] || "Memuat nama..."}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}

                {searchResult.status === 'Selesai' && searchResult.foto_after_url && (
                  <div className="border-t border-dashed border-slate-200 pt-5">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Bukti Penanganan Relawan
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={searchResult.foto_after_url} alt="Selesai" className="w-full h-40 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                    {searchResult.catatan_relawan && (
                      <p className="text-xs text-slate-700 mt-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100 border-l-4 border-l-emerald-500 italic">
                        "{searchResult.catatan_relawan}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}