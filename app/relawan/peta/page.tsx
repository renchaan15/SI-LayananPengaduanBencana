"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LaporanBencana } from "@/types/disaster";
import BottomNavRelawan from "@/components/BottomNavRelawan";
import { MapPinned, Loader2 } from "lucide-react";

// Import peta dinamis tanpa SSR agar tidak error window object
const DynamicMap = dynamic(() => import("@/components/Map"), { 
  ssr: false, 
  loading: () => (
    <div className="w-full h-[60vh] rounded-3xl bg-slate-100 flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
      <p className="text-xs font-bold text-slate-400">Memuat Modul Spasial...</p>
    </div>
  )
});

export default function PetaRelawanPage() {
  const [laporan, setLaporan] = useState<LaporanBencana[]>([]);

  // ─── AMBIL DATA REAL-TIME DARI FIRESTORE ───
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "laporan"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LaporanBencana));
      setLaporan(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans pb-32">
      <div className="max-w-md mx-auto relative z-10 px-4 py-6">
        
        <header className="flex items-center gap-3 mb-6 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <MapPinned className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Peta Operasional</h1>
            <p className="text-[11px] text-slate-500 font-medium">Distribusi Titik Kejadian</p>
          </div>
        </header>

        {/* ── MENGIRIM DATA KE KOMPONEN MAP ── */}
        <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-[60vh]">
          <DynamicMap data={laporan} /> 
        </div>
        
        {/* ── LEGENDA STATUS ── */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
             <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-200"></div> Menunggu
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
             <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></div> Diproses
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
             <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div> Selesai
           </div>
        </div>

      </div>
      <BottomNavRelawan />
    </main>
  );
}