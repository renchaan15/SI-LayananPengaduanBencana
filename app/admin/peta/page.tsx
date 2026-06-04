"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LaporanBencana } from "@/types/disaster";
import Link from "next/link";
import { 
  LayoutDashboard, Map as MapIcon, Users, Settings, ShieldCheck, Activity, Layers, Crosshair
} from "lucide-react";

const DynamicMap = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center">
      <Activity className="w-10 h-10 text-indigo-400 animate-pulse mb-4" />
      <p className="text-sm font-bold text-slate-500">Inisialisasi Leaflet Spasial...</p>
    </div>
  )
});

export default function AdminPetaPage() {
  const [laporan, setLaporan] = useState<LaporanBencana[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "laporan"), (snapshot) => {
      setLaporan(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LaporanBencana)));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="h-screen w-full bg-slate-50 flex font-sans overflow-hidden text-slate-800">
      
      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 relative">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 bg-white">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          <h1 className="font-black tracking-wide text-sm uppercase text-slate-800">SILASB Nagari</h1>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-4">Menu Utama</div>
          <Link href="/admin" className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Dasbor Eksekutif
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg font-semibold text-sm transition-colors shadow-sm">
            <MapIcon className="w-4 h-4 text-indigo-600" /> Peta Spasial (GIS)
          </button>
          <Link href="/admin/relawan" className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
            <Users className="w-4 h-4" /> Unit Relawan
          </Link>
        </nav>
      </aside>

      {/* ── KONTEN PETA FULL SCREEN ── */}
      <main className="flex-1 relative bg-slate-200 h-screen overflow-hidden">
        
        {/* Panel Alat Melayang (Floating Toolbar) */}
        <div className="absolute top-6 left-6 z-[400] flex flex-col gap-3">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50 w-80">
            <h2 className="text-lg font-black text-slate-800 mb-1">Analisis GIS Terpadu</h2>
            <p className="text-xs font-medium text-slate-500 mb-4">Pemantauan titik koordinat darurat.</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-indigo-500" /> Layer Poligon (Opsional)</span>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-500">Nonaktif</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                <span className="flex items-center gap-2"><Crosshair className="w-3.5 h-3.5 text-red-500" /> Total Titik Insiden</span>
                <span className="text-sm font-black text-slate-900">{laporan.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kontainer Peta Leaflet */}
        <div className="w-full h-full">
          {/* Komponen <DynamicMap /> diatur agar mengisi 100% tinggi dan lebar induknya */}
          <DynamicMap data={laporan} />
        </div>

      </main>
    </div>
  );
}