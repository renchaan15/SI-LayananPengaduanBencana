"use client";
import BottomNav from "@/components/BottomNav";
import { PhoneCall, Ambulance, Flame, LifeBuoy, ShieldAlert, Phone } from "lucide-react";

export default function KontakPage() {
  // Mengganti emoji dengan komponen Lucide Icon dan merapikan palet warna
  const contacts = [
    { 
      name: "Ambulans Puskesmas", 
      number: "119", 
      icon: Ambulance, 
      bg: "bg-red-50", border: "border-red-100", text: "text-red-600" 
    },
    { 
      name: "Pemadam Kebakaran", 
      number: "113", 
      icon: Flame, 
      bg: "bg-orange-50", border: "border-orange-100", text: "text-orange-600" 
    },
    { 
      name: "Posko BPBD", 
      number: "0751-123456", 
      icon: LifeBuoy, 
      bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-600" 
    },
    { 
      name: "Polsek Terdekat", 
      number: "110", 
      icon: ShieldAlert, 
      bg: "bg-slate-100", border: "border-slate-200", text: "text-slate-600" 
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans pb-32 flex justify-center">
      
      {/* ── Ambient Background Darurat ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-red-100 rounded-full blur-[80px] opacity-50" />
      </div>

      <div className="w-full max-w-md mx-auto relative z-10 px-4 pt-8 py-6">
        
        {/* ── HEADER (Sesuai Design System) ── */}
        <header className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kontak Darurat</h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Tekan untuk langsung memanggil bantuan.</p>
          </div>
        </header>

        {/* ── DAFTAR KONTAK ── */}
        <div className="grid grid-cols-1 gap-4">
          {contacts.map((c, i) => {
            const Icon = c.icon;
            
            return (
              <a 
                key={i} 
                href={`tel:${c.number}`} 
                className={`flex items-center p-4 rounded-[24px] border ${c.bg} ${c.border} active:scale-95 transition-all shadow-sm hover:shadow-md group`}
              >
                {/* Kotak Ikon Kiri */}
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-white flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`w-7 h-7 ${c.text}`} strokeWidth={1.5} />
                </div>
                
                {/* Informasi Teks */}
                <div className="flex-1">
                  <h3 className={`text-[10px] font-bold uppercase tracking-widest ${c.text} mb-0.5`}>
                    {c.name}
                  </h3>
                  <p className="text-xl font-black text-slate-800 tracking-tight">
                    {c.number}
                  </p>
                </div>
                
                {/* Tombol Panggil Kanan (Animasi Hover) */}
                <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shrink-0">
                  <Phone className="w-5 h-5" fill="currentColor" />
                </div>
              </a>
            );
          })}
        </div>

        {/* Kotak Peringatan */}
        <div className="mt-8 bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
          <p className="text-[11px] text-red-600 font-medium leading-relaxed">
            Gunakan nomor ini hanya untuk keadaan darurat yang mengancam nyawa. Untuk laporan infrastruktur, gunakan menu <b>Lapor</b>.
          </p>
        </div>

      </div>
      <BottomNav />
    </main>
  );
}