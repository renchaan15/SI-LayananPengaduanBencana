"use client";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import BottomNavRelawan from "@/components/BottomNavRelawan";
import { Trophy, Medal, Star, Flame, Loader2 } from "lucide-react";

// Struktur data untuk Papan Peringkat
interface LeaderboardItem {
  id: string;
  nama: string;
  tugas: number;
  poin: number;
}

export default function PeringkatPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ─── MESIN KALKULASI POIN REAL-TIME ───
  useEffect(() => {
    // 1. Ambil data semua pengguna yang memiliki role "relawan"
    const qUsers = query(collection(db, "users"), where("role", "==", "relawan"));
    
    const unsubUsers = onSnapshot(qUsers, (userSnap) => {
      const usersData = userSnap.docs.map(doc => ({ 
        uid: doc.id, 
        nama: doc.data().nama || "Relawan Tanpa Nama" 
      }));

      // 2. Ambil semua laporan yang sudah "Selesai"
      const qLaporan = query(collection(db, "laporan"), where("status", "==", "Selesai"));
      
      const unsubLaporan = onSnapshot(qLaporan, (laporanSnap) => {
        const laporanData = laporanSnap.docs.map(doc => doc.data());

        // 3. Hitung tugas dan poin untuk masing-masing relawan
        const boardData: LeaderboardItem[] = usersData.map(user => {
          // Cari berapa laporan yang dikerjakan oleh UID relawan ini
          const tasksCompleted = laporanData.filter(l => l.relawan_id === user.uid).length;
          
          return {
            id: user.uid,
            nama: user.nama,
            tugas: tasksCompleted,
            poin: tasksCompleted * 50 // Bobot: 50 Poin per 1 Tugas Selesai
          };
        })
        // (Opsional) Hanya tampilkan yang sudah mengerjakan minimal 1 tugas
        .filter(user => user.tugas > 0)
        // 4. Urutkan dari poin tertinggi ke terendah
        .sort((a, b) => b.poin - a.poin);

        setLeaderboard(boardData);
        setIsLoading(false);
      });

      return () => unsubLaporan();
    });

    return () => unsubUsers();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans pb-32">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 bg-amber-100 rounded-full blur-[70px] opacity-60" />
      </div>

      <div className="max-w-md mx-auto relative z-10 px-4 py-6">
        <header className="flex items-center gap-3 mb-8 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
            <Trophy className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Papan Peringkat</h1>
            <p className="text-[11px] text-slate-500 font-medium">Relawan Paling Aktif Bulan Ini</p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-400">Menghitung akumulasi poin...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Belum Ada Juara</h3>
            <p className="text-xs text-slate-400 mt-1">Selesaikan misi darurat pertamamu untuk masuk ke papan peringkat!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((user, index) => {
              const rank = index + 1; // Peringkat otomatis berdasarkan urutan array

              return (
                <div key={user.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
                  
                  {/* Indikator Garis Samping */}
                  {rank === 1 && <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-amber-600" />}
                  {rank === 2 && <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-slate-300 to-slate-400" />}
                  {rank === 3 && <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-700 to-orange-800" />}
                  
                  {/* Ikon Peringkat */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-inner shrink-0 ${
                    rank === 1 ? "bg-amber-100 text-amber-600" :
                    rank === 2 ? "bg-slate-100 text-slate-500" :
                    rank === 3 ? "bg-orange-100 text-orange-700" :
                    "bg-slate-50 text-slate-400"
                  }`}>
                    {rank === 1 ? <Trophy className="w-6 h-6" /> : 
                     rank === 2 ? <Medal className="w-6 h-6" /> : 
                     rank === 3 ? <Star className="w-6 h-6" /> : 
                     rank}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      {user.nama}
                      {rank === 1 && <Flame className="w-4 h-4 text-amber-500 drop-shadow-sm" fill="currentColor" />}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{user.tugas} Tugas Diselesaikan</p>
                  </div>

                  <div className="text-right bg-slate-50 p-2 rounded-xl border border-slate-100 min-w-[60px] shrink-0">
                    <p className="font-black text-indigo-600 text-lg leading-none">{user.poin}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Poin</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNavRelawan />
    </main>
  );
}