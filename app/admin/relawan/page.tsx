"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, query, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";
import { 
  LayoutDashboard, Map as MapIcon, Users, Settings, LogOut,
  ShieldCheck, Search, Globe, BarChart3, ChevronLeft, 
  CheckCircle2, XCircle, UserCheck, UserX, UserPlus, Loader2, Trash2
} from "lucide-react";

// Tipe Data untuk User/Relawan
interface UserData {
  id: string;
  nama?: string;
  name?: string;
  email: string;
  telepon?: string;
  phone?: string;
  role: string;
}

export default function ManajemenRelawanPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("Semua");

  // ── Proteksi Rute (Hanya Admin) ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.replace("/login");
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        setIsLoading(false);
      } else {
        await signOut(auth);
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ── Ambil Data User (Real-time) ──
  useEffect(() => {
    if (isLoading) return;
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allUsers = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserData));
      // Hanya tampilkan yang role-nya relawan atau menunggu_verifikasi
      const filteredRoles = allUsers.filter(u => u.role === "relawan" || u.role === "menunggu_verifikasi");
      setUsers(filteredRoles);
    });
    return () => unsubscribe();
  }, [isLoading]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  // ── FUNGSI AKSI ADMIN ──
  const handleTerima = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: "relawan" });
    } catch (error) {
      alert("Gagal memverifikasi relawan. Periksa koneksi Anda.");
    }
  };

  const handleTolakAtauHapus = async (userId: string, isRevoke = false) => {
    const pesan = isRevoke 
      ? "Apakah Anda yakin ingin mencabut akses dan menghapus relawan ini secara permanen?" 
      : "Apakah Anda yakin ingin menolak pendaftar ini?";
    
    if (!window.confirm(pesan)) return;

    try {
      // Kita menghapus dokumen user agar database tetap bersih dari akun yang ditolak
      await deleteDoc(doc(db, "users", userId));
    } catch (error) {
      alert("Gagal menghapus data. Pastikan Anda memiliki akses Admin.");
    }
  };

  // ── STATISTIK & FILTER ──
  const statMenunggu = users.filter(u => u.role === "menunggu_verifikasi").length;
  const statAktif = users.filter(u => u.role === "relawan").length;

  const filteredUsers = users.filter(u => {
    const nama = (u.nama || u.name || "").toLowerCase();
    const email = u.email.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    
    const matchSearch = nama.includes(searchLower) || email.includes(searchLower);
    const matchStatus = filterStatus === "Semua" 
                     || (filterStatus === "Menunggu" && u.role === "menunggu_verifikasi")
                     || (filterStatus === "Aktif" && u.role === "relawan");
    
    return matchSearch && matchStatus;
  });

  // ── LOADING SCREEN ──
  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="text-sm font-bold text-slate-600 tracking-widest uppercase">Memverifikasi Akses Admin...</p>
    </div>
  );

  return (
    <div className="h-screen w-full bg-slate-50 flex font-sans overflow-hidden text-slate-800">
      
      {/* ══════════ SIDEBAR ══════════ */}
      <aside className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out z-20`}>
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-black tracking-wide text-[11px] uppercase text-slate-800 leading-tight">SILASB Nagari</h1>
              <p className="text-[9px] text-indigo-600 font-semibold">Sistem Laporan Bencana</p>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="ml-auto w-6 h-6 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all shrink-0">
            <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-hidden overflow-y-auto">
          {!sidebarCollapsed && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2 mt-2">Menu Utama</p>}
          
          <Link href="/admin" className="w-full flex items-center gap-3 px-2.5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl font-medium text-sm transition-all group">
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="text-[13px]">Dasbor Eksekutif</span>}
          </Link>
          <Link href="/admin/peta" className="w-full flex items-center gap-3 px-2.5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl font-medium text-sm transition-all">
            <MapIcon className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="text-[13px]">Peta Spasial (GIS)</span>}
          </Link>
          <Link href="/admin/relawan" className="w-full flex items-center gap-3 px-2.5 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl font-semibold text-sm transition-all">
            <Users className="w-4 h-4 shrink-0 text-indigo-600" />
            {!sidebarCollapsed && <span className="text-[13px]">Unit Relawan</span>}
          </Link>

          {!sidebarCollapsed && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2 mt-5">Konfigurasi</p>}
          {sidebarCollapsed && <div className="my-3 h-px bg-slate-200 mx-2"></div>}
          <button className="w-full flex items-center gap-3 px-2.5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl font-medium text-sm transition-all">
            <Settings className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="text-[13px]">Pengaturan Sistem</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-2.5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl font-medium text-sm transition-all">
            <BarChart3 className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="text-[13px]">Laporan Analitik</span>}
          </button>

          {!sidebarCollapsed && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2 mt-5">Akses Publik</p>}
          {sidebarCollapsed && <div className="my-3 h-px bg-slate-200 mx-2"></div>}
          <Link href="/" className="w-full flex items-center gap-3 px-2.5 py-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-medium text-sm transition-all">
            <Globe className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="text-[13px]">Portal Warga</span>}
          </Link>
        </nav>

        <div className="p-3 border-t border-slate-200 space-y-2 shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shrink-0">WN</div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-slate-700 truncate">Wali Nagari</p>
                <p className="text-[9px] text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-slate-200 text-slate-600 rounded-xl font-semibold text-xs transition-all">
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!sidebarCollapsed && "Keluar Sesi"}
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* ── TOP HEADER BAR ── */}
        <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-200 px-5 flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="font-bold text-slate-800 text-sm hidden sm:block">Manajemen Unit Relawan</h2>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all"
            />
          </div>
        </header>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 p-5 space-y-5 overflow-y-auto">

          {/* ── KPI Cards Relawan ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm relative overflow-hidden">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 z-10">
                <UserPlus className="w-6 h-6" />
              </div>
              <div className="z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Menunggu Verifikasi</p>
                <p className="text-3xl font-black text-amber-700 leading-none">{statMenunggu}</p>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-amber-50 to-transparent pointer-events-none"></div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm relative overflow-hidden">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 z-10">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Relawan Aktif</p>
                <p className="text-3xl font-black text-emerald-700 leading-none">{statAktif}</p>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-emerald-50 to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* ── Tabel Manajemen ── */}
          <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
            
            {/* Header & Tabs */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800">Daftar Akun Relawan</h3>
              <div className="flex bg-slate-200/50 p-1 rounded-xl">
                {["Semua", "Menunggu", "Aktif"].map(s => (
                  <button 
                    key={s} onClick={() => setFilterStatus(s)} 
                    className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${filterStatus === s ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Area Tabel */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identitas Profil</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kontak</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Akses</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16 text-slate-500">
                        <Users className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                        <p className="font-semibold text-sm">Tidak ada data relawan ditemukan</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isMenunggu = u.role === "menunggu_verifikasi";
                      
                      return (
                        <tr key={u.id} className={`hover:bg-slate-50/50 transition-colors ${isMenunggu ? "bg-amber-50/20" : ""}`}>
                          {/* Nama & UID */}
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-800">{u.nama || u.name || "Anonim"}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">UID: {u.id.slice(0,10)}...</p>
                          </td>
                          
                          {/* Kontak */}
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-600 text-xs">{u.email}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{u.telepon || u.phone || "Tidak ada no. HP"}</p>
                          </td>
                          
                          {/* Status */}
                          <td className="px-5 py-4">
                            {isMenunggu ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Verifikasi
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Relawan Aktif
                              </span>
                            )}
                          </td>
                          
                          {/* Aksi */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {isMenunggu ? (
                                <>
                                  <button 
                                    onClick={() => handleTolakAtauHapus(u.id, false)}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded-lg border border-red-200 transition-colors flex items-center gap-1.5"
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> Tolak
                                  </button>
                                  <button 
                                    onClick={() => handleTerima(u.id)}
                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Terima
                                  </button>
                                </>
                              ) : (
                                <button 
                                  onClick={() => handleTolakAtauHapus(u.id, true)}
                                  className="px-3 py-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 text-[11px] font-bold rounded-lg border border-slate-200 hover:border-red-200 transition-colors flex items-center gap-1.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Cabut Akses
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}