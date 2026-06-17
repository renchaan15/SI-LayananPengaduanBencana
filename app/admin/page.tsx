"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, doc, getDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { LaporanBencana } from "@/types/disaster";
import Link from "next/link";
import { 
  LayoutDashboard, Map as MapIcon, Users, Settings, LogOut,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Printer, ShieldCheck,
  Search, Calendar, Download, Activity, RadioTower, Server, Database,
  ChevronLeft, ChevronRight, Filter, Bell, RefreshCw, Wifi, 
  BarChart3, Zap, ArrowUpRight, X, User, Phone, MapPin, Trash2, Globe
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Dynamic import peta
const DynamicMap = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-slate-50 flex flex-col items-center justify-center gap-3 border border-slate-200 rounded-xl">
      <div className="relative">
        <Activity className="w-7 h-7 text-indigo-600 animate-pulse" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></span>
      </div>
      <p className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">Memuat Modul GIS...</p>
    </div>
  )
});

// ── Komponen KPI Card ──
function KpiCard({ 
  label, value, icon: Icon, color, subLabel, trend 
}: { 
  label: string; value: number; icon: React.ElementType; 
  color: "slate" | "red" | "amber" | "emerald"; subLabel?: string; trend?: string; 
}) {
  const [display, setDisplay] = useState(0);
  const colors = {
    slate:   { bg: "bg-white",          border: "border-slate-200",     icon: "bg-slate-100 text-slate-600",   val: "text-slate-800",       badge: "bg-slate-100 text-slate-500" },
    red:     { bg: "bg-red-50",         border: "border-red-100",       icon: "bg-red-100 text-red-600",       val: "text-red-700",         badge: "bg-red-100 text-red-600" },
    amber:   { bg: "bg-amber-50",       border: "border-amber-100",     icon: "bg-amber-100 text-amber-600",   val: "text-amber-700",       badge: "bg-amber-100 text-amber-600" },
    emerald: { bg: "bg-emerald-50",     border: "border-emerald-100",   icon: "bg-emerald-100 text-emerald-600",val: "text-emerald-700",   badge: "bg-emerald-100 text-emerald-600" },
  };
  const c = colors[color];

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`${c.bg} ${c.border} border rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] group shadow-sm`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-indigo-500/[0.02] to-transparent pointer-events-none"></div>
      <div className={`${c.icon} w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 truncate">{label}</p>
        <p className={`text-2xl font-black ${c.val} leading-none tabular-nums`}>{display}</p>
        {subLabel && <p className="text-[10px] text-slate-500 mt-1">{subLabel}</p>}
      </div>
      {trend && (
        <div className={`ml-auto ${c.badge} text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shrink-0`}>
          <ArrowUpRight className="w-3 h-3" />{trend}
        </div>
      )}
    </div>
  );
}

// ── Komponen Status Badge ──
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Menunggu:  "bg-red-50 text-red-600 border-red-200",
    Ditangani: "bg-amber-50 text-amber-600 border-amber-200",
    Diproses:  "bg-amber-50 text-amber-600 border-amber-200",
    Selesai:   "bg-emerald-50 text-emerald-600 border-emerald-200",
  };
  const dots: Record<string, string> = {
    Menunggu: "bg-red-500 animate-pulse",
    Ditangani: "bg-amber-500",
    Diproses:  "bg-amber-500",
    Selesai: "bg-emerald-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] ?? "bg-slate-400"}`}></span>
      {status}
    </span>
  );
}

// ── Live Clock ──
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-right">
      <p className="text-[10px] font-semibold text-slate-400 tabular-nums">
        {time.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
      <p className="text-xs font-black text-slate-600 tabular-nums">
        {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
    </div>
  );
}

// ── Halaman Utama Admin ──
export default function AdminDashboard() {
  const router = useRouter();
  const [laporan, setLaporan] = useState<LaporanBencana[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Semua");
  const [periodFilter, setPeriodFilter] = useState<"harian" | "mingguan" | "bulanan" | "tahunan">("harian");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanBencana | null>(null);
  const [namaRelawanMap, setNamaRelawanMap] = useState<Record<string, string>>({});

  const itemsPerPage = 8;

  // ── HELPER: Filter laporan berdasarkan periode ──
  const getDateRangeByPeriod = (period: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case "harian": {
        const start = new Date(today);
        const end = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        return { start, end, label: `Hari ini (${today.toLocaleDateString('id-ID')})` };
      }
      case "mingguan": {
        const dayOfWeek = today.getDay();
        const start = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        return { start, end, label: `Minggu ini (${start.toLocaleDateString('id-ID')} - ${new Date(end.getTime() - 1).toLocaleDateString('id-ID')})` };
      }
      case "bulanan": {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { start, end, label: `Bulan ${start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}` };
      }
      case "tahunan": {
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear() + 1, 0, 1);
        return { start, end, label: `Tahun ${now.getFullYear()}` };
      }
      default:
        return { start: new Date(0), end: new Date(), label: "Semua waktu" };
    }
  };

  const filterLaporanByPeriod = (data: LaporanBencana[]) => {
    const { start, end } = getDateRangeByPeriod(periodFilter);
    return data.filter(l => {
      const date = new Date(l.waktu_kejadian);
      return date >= start && date < end;
    });
  };

  // ── Proteksi Rute (RBAC) ──
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

  // ── Ambil Data Laporan (Real-time) ──
  useEffect(() => {
    if (isLoading) return;
    const q = query(collection(db, "laporan"), orderBy("waktu_kejadian", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLaporan(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LaporanBencana)));
      setLastUpdated(new Date());
    });
    return () => unsubscribe();
  }, [isLoading]);

  // ── Ambil Nama Relawan dari Firestore ──
  useEffect(() => {
    if (!selectedLaporan || !selectedLaporan.relawan_terlibat || selectedLaporan.relawan_terlibat.length === 0) return;

    const ambilNamaRelawan = async () => {
      const petaNamaBaru = { ...namaRelawanMap };
      let adaPerubahan = false;

      for (const uid of selectedLaporan.relawan_terlibat || []) {
        if (!petaNamaBaru[uid]) {
          try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
              petaNamaBaru[uid] = userDoc.data().name || userDoc.data().nama || "Relawan Lapangan";
            } else {
              petaNamaBaru[uid] = `Relawan (${uid.slice(0, 6)})`;
            }
            adaPerubahan = true;
          } catch (err) {
            console.error("Gagal mengambil data relawan:", err);
            petaNamaBaru[uid] = `Relawan (${uid.slice(0, 6)})`;
            adaPerubahan = true;
          }
        }
      }

      if (adaPerubahan) {
        setNamaRelawanMap(petaNamaBaru);
      }
    };

    ambilNamaRelawan();
  }, [selectedLaporan]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const handlePrint = () => {
    window.print();
  };

  // ── FITUR BARU: FUNGSI EKSPOR CSV ──
  const handleExportCSV = () => {
    if (filteredLaporan.length === 0) {
      return alert("Tidak ada data untuk diekspor pada periode ini.");
    }

    // 1. Siapkan Header Kolom Excel
    const headers = ["ID Laporan", "Waktu Kejadian", "Kategori", "Pelapor", "No HP", "Status", "Latitude", "Longitude", "Catatan Lapangan"];

    // 2. Ekstrak dan Format Data
    const rows = filteredLaporan.map(item => {
      const waktu = new Date(item.waktu_kejadian).toLocaleString('id-ID');
      const lat = item.koordinat?.lat || "";
      const lng = item.koordinat?.lng || "";
      
      return [
        item.id,
        `"${waktu}"`, // Kutip ganda agar koma pada waktu tidak merusak kolom
        `"${item.jenis_bencana}"`,
        `"${item.nama_pelapor || 'Warga Anonim'}"`,
        `"${item.telepon_pelapor || '-'}"`,
        item.status,
        lat,
        lng,
        `"${item.catatan_relawan || '-'}"`
      ].join(","); // Pisahkan tiap nilai dengan koma
    });

    // 3. Gabungkan Header dan Data
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");

    // 4. Trigger Download Paksa melalui Browser
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Bencana_${periodFilter}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleHapusLaporan = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const konfirmasi = window.confirm("Apakah Anda yakin ingin menghapus laporan ini secara permanen? Langkah ini berguna untuk membersihkan kapasitas database.");
    if (!konfirmasi) return;

    try {
      await deleteDoc(doc(db, "laporan", id));
      if (selectedLaporan?.id === id) {
        setSelectedLaporan(null); 
      }
    } catch (error) {
      console.error("Gagal menghapus:", error);
      alert("Terjadi kesalahan saat menghapus laporan. Pastikan Anda memiliki koneksi yang stabil.");
    }
  };

  // ── Filter laporan berdasarkan periode ──
  const laporanPeriod = filterLaporanByPeriod(laporan);

  const statMenunggu  = laporanPeriod.filter(l => l.status === "Menunggu").length;
  const statDitangani = laporanPeriod.filter(l => (["Diproses", "Ditangani"] as string[]).includes(l.status as string)).length;
  const statSelesai   = laporanPeriod.filter(l => l.status === "Selesai").length;

  const filteredLaporan = laporanPeriod.filter(l => {
    const matchSearch = l.jenis_bencana.toLowerCase().includes(searchQuery.toLowerCase())
                     || (l.id?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());
    let checkStatus: string = l.status as string;
    if (checkStatus === "Diproses") checkStatus = "Ditangani";
    const matchStatus = filterStatus === "Semua" || checkStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredLaporan.length / itemsPerPage);
  const paginatedLaporan = filteredLaporan.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus]);

  const statusFilters = ["Semua", "Menunggu", "Ditangani", "Selesai"];

  // ── FITUR BARU: DATA UNTUK GRAFIK ANALITIK ──
  const chartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    // Gunakan laporanPeriod agar grafik merespon filter tanggal
    laporanPeriod.forEach(item => {
      const jenis = item.jenis_bencana || "Lainnya";
      dataMap[jenis] = (dataMap[jenis] || 0) + 1;
    });
    // Ubah format agar terbaca oleh Recharts
    return Object.keys(dataMap).map(key => ({
      name: key,
      Total: dataMap[key]
    })).sort((a, b) => b.Total - a.Total); // Urutkan dari yang terbanyak
  }, [laporanPeriod]);

  const CHART_COLORS = ['#4f46e5', '#3b82f6', '#0ea5e9', '#06b6d4', '#0284c7', '#2563eb'];

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <ShieldCheck className="w-10 h-10 text-indigo-600" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-ping"></span>
      </div>
      <p className="text-sm font-bold text-slate-600 tracking-widest uppercase animate-pulse">Memuat Sistem SILASB...</p>
    </div>
  );

  return (
    <div className="h-screen w-full bg-slate-50 flex font-sans overflow-hidden text-slate-800">
      
      {/* ══════════ SIDEBAR ══════════ */}
      <aside className={`${sidebarCollapsed ? "w-16" : "w-64"} print:hidden bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out z-20`}>
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
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            className="ml-auto w-6 h-6 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all shrink-0"
          >
            <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-hidden overflow-y-auto">
          {!sidebarCollapsed && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2 mt-2">Menu Utama</p>}
          
          <Link href="/admin" className="w-full flex items-center gap-3 px-2.5 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl font-semibold text-sm transition-all group">
            <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-600" />
            {!sidebarCollapsed && <span className="text-[13px]">Dasbor Eksekutif</span>}
          </Link>
          <Link href="/admin/peta" className="w-full flex items-center gap-3 px-2.5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl font-medium text-sm transition-all">
            <MapIcon className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="text-[13px]">Peta Spasial (GIS)</span>}
          </Link>
          <Link href="/admin/relawan" className="w-full flex items-center gap-3 px-2.5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl font-medium text-sm transition-all">
            <Users className="w-4 h-4 shrink-0" />
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
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-slate-200 text-slate-600 rounded-xl font-semibold text-xs transition-all"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!sidebarCollapsed && "Keluar Sesi"}
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto print:overflow-visible print:h-auto scrollbar-thin scrollbar-thumb-slate-200">
        
        <div className="hidden print:block p-8 text-center border-b-2 border-slate-800 mb-8">
          <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">Laporan Rekapitulasi Kebencanaan</h1>
          <p className="text-sm font-semibold text-slate-600 mt-1">Sistem Informasi Layanan Sosial Aduan Bencana (SILASB) - Nagari Lolo</p>
          <p className="text-xs text-slate-500 mt-2">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
        </div>

        <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-200 px-5 flex items-center gap-4 shrink-0 print:hidden sticky top-0 z-10">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Cari ID atau jenis bencana..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all"
            />
          </div>

          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1">
            {statusFilters.map(s => (
              <button 
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filterStatus === s ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1">
            {["harian", "mingguan", "bulanan", "tahunan"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriodFilter(p as typeof periodFilter)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all capitalize ${
                  periodFilter === p ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-xl font-semibold text-[11px] transition-all">
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Periode</span>
            </button>
            
            {/* ── TOMBOL BARU: UNDUH CSV ── */}
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[11px] transition-all shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh CSV</span>
            </button>

            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-[11px] transition-all shadow-md active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak PDF / Laporan</span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition-all relative">
              <Bell className="w-3.5 h-3.5" />
              {statMenunggu > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
            </button>
            <LiveClock />
          </div>
        </header>

        <div className="flex-1 p-5 space-y-5 print:p-0 print:space-y-8">
          <div className="flex justify-between items-center print:hidden">
            <h2 className="text-sm font-bold text-slate-700">Rekapitulasi Periode: <span className="text-indigo-600 capitalize">{getDateRangeByPeriod(periodFilter).label}</span></h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4 print:gap-4">
            <KpiCard label="Total Laporan"          value={laporanPeriod.length}    icon={TrendingUp}   color="slate"   subLabel={periodFilter} />
            <KpiCard label="Kritis (Menunggu)"       value={statMenunggu}      icon={AlertTriangle}color="red"     subLabel="Perlu tindakan" trend={statMenunggu > 0 ? "Darurat" : undefined} />
            <KpiCard label="Operasional (Ditangani)" value={statDitangani}     icon={Clock}        color="amber"   subLabel="Sedang ditangani" />
            <KpiCard label="Tuntas (Selesai)"        value={statSelesai}       icon={CheckCircle2} color="emerald" subLabel="Berhasil diselesaikan" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:hidden" style={{ height: "380px" }}>
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-indigo-600" /> Peta Radar Bencana
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </h3>
              </div>
              <div className="flex-1 relative z-0"><DynamicMap data={laporan} /></div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 flex flex-col p-4 gap-3 overflow-hidden">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Aksi Cepat
              </h3>
              <button className="w-full flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 hover:border-indigo-200 hover:bg-indigo-100 text-indigo-900 rounded-xl transition-all text-left group">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  <RadioTower className="w-4 h-4 text-indigo-600 group-hover:animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-900">Broadcast EWS</p>
                  <p className="text-[10px] text-indigo-600/70 mt-0.5">Notifikasi bahaya radius 1km</p>
                </div>
              </button>

              <div className="mt-auto">
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Activity className="w-3 h-3" /> Kesehatan Infrastruktur
                </h4>
                <div className="space-y-2">
                  {[
                    { icon: Server,   label: "Server Next.js",    status: "Optimal",     color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
                    { icon: Database, label: "Firestore DB",       status: "Terhubung",   color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
                    { icon: Wifi,     label: "Sensor BMKG (API)",  status: "Delay 5mnt",  color: "text-amber-700",   bg: "bg-amber-50",   dot: "bg-amber-500 animate-pulse" },
                  ].map(({ icon: I, label, status, color, bg, dot }) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-500"><I className="w-3.5 h-3.5 text-slate-400" /><span className="text-[11px]">{label}</span></span>
                      <span className={`${color} ${bg} flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-current/20`}><span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── SEKSI BARU: GRAFIK ANALITIK ── */}
          <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden p-5 print:border-none print:shadow-none">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Analitik Tren Bencana
            </h3>
            {chartData.length > 0 ? (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="Total" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <BarChart3 className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-semibold">Belum ada data untuk dianalisis pada periode ini</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden print:border-none print:shadow-none">
            
            <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center shrink-0 print:hidden">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-slate-800">Rekapitulasi Laporan</h3>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded-lg">{filteredLaporan.length} data</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse print:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 print:bg-white print:border-b-2 print:border-slate-800">
                    {["ID Resi", "Waktu Kejadian", "Kategori Bencana", "Koordinat", "Status", "Aksi"].map((h, i) => (
                      <th key={h} className={`px-5 py-3 text-[10px] print:text-xs font-bold text-slate-500 uppercase tracking-widest ${i === 5 ? "text-right print:hidden" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-600 divide-y divide-slate-100 print:divide-slate-200">
                  {paginatedLaporan.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12">Tidak ada data ditemukan</td></tr>
                  ) : (
                    paginatedLaporan.map((item, idx) => (
                      <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors group ${idx % 2 === 0 ? "" : "bg-slate-50/20 print:bg-transparent"}`}>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 print:bg-transparent print:border-none print:px-0">
                            {item.id?.slice(0, 8) ?? "—"}...
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-semibold text-slate-700 text-[12px]">{new Date(item.waktu_kejadian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            <p className="text-[10px] text-slate-400">{new Date(item.waktu_kejadian).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><span className="font-bold text-slate-800 text-[12px]">{item.jenis_bencana}</span></td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200/60 block w-fit print:bg-transparent print:border-none print:px-0">
                            {item.koordinat.lat.toFixed(4)}, {item.koordinat.lng.toFixed(4)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={item.status} /></td>
                        
                        <td className="px-5 py-3.5 text-right print:hidden">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.status === 'Selesai' && (
                              <button 
                                onClick={(e) => handleHapusLaporan(item.id as string, e)}
                                title="Hapus Laporan Selesai"
                                className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/50 px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            
                            <button 
                              onClick={() => setSelectedLaporan(item)}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                            >
                              Detail →
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between shrink-0 print:hidden">
                <p className="text-[11px] text-slate-500">Hal. {currentPage} dari {totalPages} — {filteredLaporan.length} total data</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-all"><ChevronLeft className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-all"><ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}
          </div>
          <div className="h-2"></div>
        </div>
      </main>

      {/* ══════════ MODAL DETAIL LAPORAN ══════════ */}
      {selectedLaporan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">Detail Eksekutif</h3>
                  <p className="text-[10px] font-mono text-slate-500">ID: {selectedLaporan.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedLaporan.status === 'Selesai' && (
                  <button 
                    onClick={() => handleHapusLaporan(selectedLaporan.id as string)}
                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border border-red-200 mr-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Permanen
                  </button>
                )}
                <button onClick={() => setSelectedLaporan(null)} className="w-8 h-8 bg-white border border-slate-200 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Foto Kejadian Awal</p>
                  <img src={selectedLaporan.foto_url} alt="Bencana" className="w-full h-48 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                </div>

                {selectedLaporan.status === "Selesai" && selectedLaporan.foto_after_url && (
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Bukti Penanganan</p>
                    <img src={selectedLaporan.foto_after_url} alt="Selesai" className="w-full h-48 object-cover rounded-2xl border border-emerald-200 shadow-sm" />
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori Kejadian</p>
                    <p className="text-xl font-black text-slate-800 mt-1">{selectedLaporan.jenis_bencana}</p>
                  </div>
                  <StatusBadge status={selectedLaporan.status} />
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Identitas Pelapor (Warga)</p>
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{selectedLaporan.nama_pelapor || "Warga Anonim"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-mono text-slate-500">{selectedLaporan.telepon_pelapor || "Tidak dilampirkan"}</span>
                  </div>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Tim Relawan Bertugas
                  </p>
                  {selectedLaporan.relawan_terlibat && selectedLaporan.relawan_terlibat.length > 0 ? (
                    <ul className="space-y-1.5">
                      {selectedLaporan.relawan_terlibat.map((uid, idx) => (
                        <li key={uid} className="text-xs font-bold text-slate-700 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-600 font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <span>{namaRelawanMap[uid] || "Memuat nama..."}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Belum ada relawan yang bergabung.</p>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deskripsi Kondisi</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedLaporan.deskripsi}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Titik Lokasi</p>
                    <p className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">
                            {`${selectedLaporan.koordinat.lat.toFixed(4)}, ${selectedLaporan.koordinat.lng.toFixed(4)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Waktu Lapor</p>
                    <p className="text-xs font-bold text-slate-700">
                      {new Date(selectedLaporan.waktu_kejadian).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>

                {selectedLaporan.catatan_relawan && (
                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Users className="w-3 h-3" /> Catatan Regu Relawan</p>
                    <p className="text-xs text-slate-600 italic bg-amber-50 border-l-2 border-amber-400 p-3 rounded-r-xl">
                      "{selectedLaporan.catatan_relawan}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}