"use client";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { BookOpen, ChevronRight, X, HeartPulse, Map as MapIcon, Activity, ShieldCheck, AlertTriangle } from "lucide-react";

// Struktur data artikel (diperluas dengan konten lengkap)
const articles = [
  { 
    id: 1,
    title: "Rute Evakuasi Banjir & Longsor", 
    desc: "Panduan menuju titik kumpul tertinggi di balai nagari dan rute aman.", 
    content: "Saat terjadi curah hujan tinggi yang memicu luapan sungai atau pergerakan tanah, segera jauhi area lereng dan bantaran sungai. Ikuti rambu evakuasi berwarna hijau yang telah dipasang oleh perangkat Nagari. Titik kumpul utama berada di Balai Pemuda dan lapangan SD yang berada di dataran lebih tinggi. Jangan membawa barang bawaan berat, prioritaskan dokumen penting dan keselamatan nyawa.",
    color: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-200",
    icon: MapIcon 
  },
  { 
    id: 2,
    title: "Pertolongan Pertama (P3K)", 
    desc: "Langkah awal P3K saat terjadi cedera akibat reruntuhan atau material.", 
    content: "Jika menemukan korban luka, pastikan area sekitar aman sebelum menolong. Hentikan pendarahan aktif dengan menekan luka menggunakan kain bersih. Jangan memindahkan korban yang dicurigai mengalami patah tulang belakang atau leher kecuali area tersebut sangat mengancam nyawa (seperti api atau longsor susulan). Segera hubungi relawan melalui aplikasi ini.",
    color: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-200",
    icon: HeartPulse 
  },
  { 
    id: 3,
    title: "Mitigasi Gempa Bumi", 
    desc: "Penerapan Aturan Segitiga Kehidupan dan perlindungan kepala.", 
    content: "Saat gempa terjadi, jangan panik. Lakukan teknik 'Drop, Cover, Hold On' (Merunduk, Lindungi Kepala, Berpegangan). Menjauhlah dari lemari kaca atau barang yang mudah jatuh. Jika berada di luar ruangan, jauhi tiang listrik, pohon besar, dan bangunan. Jangan gunakan lift jika sedang berada di gedung bertingkat.",
    color: "from-indigo-500 to-purple-500",
    shadow: "shadow-indigo-200",
    icon: Activity 
  },
  { 
    id: 4,
    title: "Mengenali Tanda Alam", 
    desc: "Deteksi dini sebelum terjadinya bencana hidrometeorologi.", 
    content: "Perhatikan perubahan warna air sungai menjadi keruh kecoklatan dan membawa banyak ranting kayu, ini adalah tanda bahaya banjir bandang (galodo). Untuk tanah longsor, waspadai retakan baru di tanah lereng, pohon atau tiang yang tiba-tiba miring, serta mata air yang tiba-tiba muncul atau keruh.",
    color: "from-orange-500 to-amber-500",
    shadow: "shadow-orange-200",
    icon: AlertTriangle 
  },
];

export default function EdukasiPage() {
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);

  return (
    <main className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans pb-32 flex justify-center">
      
      {/* ── Ambient Background (Konsisten dengan seluruh aplikasi) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-100 rounded-full blur-[80px] opacity-60" />
      </div>

      <div className="w-full max-w-md mx-auto relative z-10 px-4 pt-8 py-6">
        
        {/* ── HEADER ── */}
        <header className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pustaka Siaga</h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Bekali diri dengan pengetahuan mitigasi.</p>
          </div>
        </header>

        {/* ── DAFTAR MODUL EDUKASI ── */}
        <div className="space-y-4">
          {articles.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedArticle(item)}
                className={`p-5 rounded-[24px] bg-gradient-to-br ${item.color} text-white shadow-lg ${item.shadow} active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group`}
              >
                {/* Efek Kaca/Glow di dalam kartu */}
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-28 h-28 bg-white/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-white/30">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1 leading-tight">{item.title}</h3>
                    <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">{item.desc}</p>
                    <div className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/90 group-hover:text-white">
                      Baca Panduan <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informasi Tambahan */}
        <div className="mt-8 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-emerald-800">Kenapa Ini Penting?</h4>
            <p className="text-[11px] text-emerald-600 mt-1 leading-relaxed">Masyarakat yang teredukasi adalah garis pertahanan pertama saat bencana terjadi, sebelum relawan dan tim SAR tiba di lokasi.</p>
          </div>
        </div>

      </div>

      {/* ── MODAL BACA ARTIKEL ── */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl animate-in slide-in-from-bottom-10 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal dengan Gradasi Sesuai Kartu */}
            <div className={`p-6 bg-gradient-to-br ${selectedArticle.color} text-white relative`}>
              <button 
                onClick={() => setSelectedArticle(null)} 
                className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30">
                <selectedArticle.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-black leading-tight mb-2">{selectedArticle.title}</h2>
              <p className="text-xs text-white/80">{selectedArticle.desc}</p>
            </div>
            
            {/* Isi Konten Pembelajaran */}
            <div className="p-6 overflow-y-auto">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                <p className="text-sm text-slate-700 leading-loose">
                  {selectedArticle.content}
                </p>
              </div>
              
              <button 
                onClick={() => setSelectedArticle(null)}
                className="w-full mt-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors active:scale-95"
              >
                Tutup Panduan
              </button>
            </div>

          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}