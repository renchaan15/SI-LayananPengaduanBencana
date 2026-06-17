"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/types/disaster";
import Link from "next/link";
import { 
  LayoutDashboard, Map as MapIcon, Users, Settings, LogOut, ShieldCheck,
  CheckCircle, XCircle, Search, UserCheck, UserX, UserPlus, ShieldAlert
} from "lucide-react";

export default function AdminRelawanPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Asumsi RBAC sudah ditangani oleh pembungkus sesi di aplikasi aslimu
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile)));
    });
    return () => unsubscribe();
  }, []);

  // ─── Aksi Approval Relawan ───
  const ubahRole = async (uid: string, roleBaru: string) => {
    if(confirm(`Yakin ingin mengubah status akun ini menjadi ${roleBaru.toUpperCase()}?`)) {
      try {
        await updateDoc(doc(db, "users", uid), { role: roleBaru });
      } catch (error) {
        alert("Gagal memperbarui status relawan.");
      }
    }
  };

  const filteredUsers = users.filter(u => 
    (u.role === "relawan" || u.role === "menunggu_verifikasi") && 
    (u.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-screen w-full bg-slate-50 flex font-sans overflow-hidden text-slate-800">
      
      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 bg-white">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          <h1 className="font-black tracking-wide text-sm uppercase text-slate-800">SILASB Nagari</h1>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-4">Menu Utama</div>
          <Link href="/admin" className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Dasbor Eksekutif
          </Link>
          <Link href="/admin/peta" className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
            <MapIcon className="w-4 h-4" /> Peta Spasial (GIS)
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg font-semibold text-sm transition-colors shadow-sm">
            <Users className="w-4 h-4 text-indigo-600" /> Unit Relawan
          </button>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-6">Konfigurasi</div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
            <Settings className="w-4 h-4" /> Pengaturan Sistem
          </button>
        </nav>
      </aside>

      {/* ── KONTEN UTAMA ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100/50">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="relative w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari nama atau email relawan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent focus:border-indigo-300 focus:bg-white rounded-lg text-sm focus:outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-all shadow-sm">
            <UserPlus className="w-4 h-4" /> Tambah Relawan Internal
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Relawan</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Verifikasi dan kelola akses pasukan reaksi cepat nagari.</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-5 py-4 font-semibold">Nama Relawan</th>
                    <th className="px-5 py-4 font-semibold">Email Kredensial</th>
                    <th className="px-5 py-4 font-semibold">Status Akses</th>
                    <th className="px-5 py-4 font-semibold text-right">Tindakan Otoritas</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-12 text-slate-400 font-medium">Tidak ada data pendaftar relawan.</td></tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-800 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500 text-xs uppercase">
                            {user.nama.substring(0, 2)}
                          </div>
                          {user.nama}
                        </td>
                        <td className="px-5 py-4 font-medium">{user.email}</td>
                        <td className="px-5 py-4">
                          {user.role === "menunggu_verifikasi" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200">
                              <ShieldAlert className="w-3 h-3" /> Menunggu Validasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" /> Aktif Bertugas
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {user.role === "menunggu_verifikasi" ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => ubahRole(user.uid, "relawan")} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">
                                <CheckCircle className="w-3.5 h-3.5" /> Terima
                              </button>
                              <button onClick={() => ubahRole(user.uid, "ditolak")} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-colors">
                                <XCircle className="w-3.5 h-3.5" /> Tolak
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => ubahRole(user.uid, "menunggu_verifikasi")} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold transition-colors ml-auto">
                              <UserX className="w-3.5 h-3.5" /> Cabut Akses
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
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