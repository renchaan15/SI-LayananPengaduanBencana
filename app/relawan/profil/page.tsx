"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import BottomNavRelawan from "@/components/BottomNavRelawan";
import { UserSquare, LogOut, ShieldCheck, Mail, ChevronRight, Activity, Loader2 } from "lucide-react";

export default function ProfilPage() {
  const router = useRouter();
  const [userData, setUserData] = useState({ nama: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUserData({
              nama: userDocSnap.data().nama || "Relawan Tanpa Nama",
              email: user.email || "Email tidak tersedia"
            });
          } else {
            setUserData({
              nama: "Data Profil Tidak Ditemukan",
              email: user.email || "Email tidak tersedia"
            });
          }
        } catch (error) {
          console.error("Gagal mengambil data profil:", error);
        } finally {
          setIsLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    // 1. STRUKTUR UTAMA: Disamakan kembali dengan page Tugas dan Peringkat (bg-slate-50)
    <main className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans pb-32">
      
      {/* 2. AMBIENT BACKGROUND: Mempertahankan blob glow yang konsisten */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-100 rounded-full blur-[70px] opacity-60" />
      </div>

      <div className="max-w-md mx-auto relative z-10 px-4 pt-8 py-6">
        
        {/* 3. HEADER BIRU: Sekarang dikunci di dalam max-w-md agar tidak tumpah di desktop */}
        <div className="absolute top-0 left-0 w-full h-56 bg-gradient-to-b from-indigo-600 to-indigo-900 rounded-b-[40px] -z-10 shadow-lg shadow-indigo-900/20" />

        <div className="text-center mb-16 mt-2">
          <h1 className="text-white text-xl font-black tracking-wide">Profil Bertugas</h1>
          <p className="text-indigo-200 text-[10px] mt-1 font-bold uppercase tracking-widest">Unit Reaksi Cepat</p>
        </div>

        {/* Kartu Profil Utama */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center mb-6 relative min-h-[180px]">
          <div className="w-24 h-24 bg-indigo-50 rounded-full border-4 border-white shadow-md absolute -top-12 flex items-center justify-center text-indigo-500">
            <UserSquare className="w-12 h-12" strokeWidth={1.5} />
          </div>
          
          <div className="mt-14 w-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-4">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-3" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memuat Identitas...</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-black text-slate-800 leading-tight">{userData.nama}</h2>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-500 text-xs font-medium">
                  <Mail className="w-3.5 h-3.5" />
                  {userData.email}
                </div>
                
                <div className="mt-6 flex justify-center gap-2 border-t border-slate-100 pt-5">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Terverifikasi
                  </span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Aktif
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Menu Pengaturan */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6">
          <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100 text-left group">
            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Riwayat Tugas</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100 text-left group">
            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Ubah Kata Sandi</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>
        </div>

        {/* Tombol Logout */}
        <button 
          onClick={handleLogout}
          className="w-full py-4 bg-white hover:bg-red-50 text-red-500 font-bold rounded-2xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-slate-200 hover:border-red-200 shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Keluar dari Sistem
        </button>

      </div>
      <BottomNavRelawan />
    </main>
  );
}