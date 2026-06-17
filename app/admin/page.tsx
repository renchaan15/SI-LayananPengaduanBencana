"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { LaporanBencana } from "@/types/disaster";
import Link from "next/link";
import { 
  LayoutDashboard, Map as MapIcon, Users, Settings, LogOut,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Printer, ShieldCheck,
  Search, Calendar, Download, Activity, RadioTower, Server, Database,
  ChevronLeft, ChevronRight, Filter, Bell, RefreshCw, Wifi, WifiOff,
  BarChart3, Zap, ArrowUpRight
} from "lucide-react";

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

// ── Komponen KPI Card dengan animasi count-up ──
function KpiCard({ 
  label, value, icon: Icon, color, subLabel, trend 
}: { 
  label: string; value: number; icon: React.ElementType; 
  color: "slate" | "red" | "amber" | "emerald"; subLabel?: string; trend?: string; 
}) {
  const [display, setDisplay] = useState(0);
  const colors = {
<<<<<<< HEAD
    slate:   { bg: "bg-white",          border: "border-slate-200",     icon: "bg-slate-100 text-slate-600",   val: "text-slate-800",      badge: "bg-slate-100 text-slate-500" },
    red:     { bg: "bg-red-50",         border: "border-red-100",       icon: "bg-red-100 text-red-600",       val: "text-red-700",        badge: "bg-red-100 text-red-600" },
    amber:   { bg: "bg-amber-50",       border: "border-amber-100",     icon: "bg-amber-100 text-amber-600",   val: "text-amber-700",      badge: "bg-amber-100 text-amber-600" },
=======
    slate:   { bg: "bg-white",          border: "border-slate-200",     icon: "bg-slate-100 text-slate-600",   val: "text-slate-800",       badge: "bg-slate-100 text-slate-500" },
    red:     { bg: "bg-red-50",         border: "border-red-100",       icon: "bg-red-100 text-red-600",       val: "text-red-700",         badge: "bg-red-100 text-red-600" },
    amber:   { bg: "bg-amber-50",       border: "border-amber-100",     icon: "bg-amber-100 text-amber-600",   val: "text-amber-700",       badge: "bg-amber-100 text-amber-600" },
>>>>>>> 69617d2e67bb988dafe96d979059a5b1d7ff53d8
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
<<<<<<< HEAD
    Diproses:  "bg-amber-50 text-amber-600 border-amber-200",
=======
>>>>>>> 69617d2e67bb988dafe96d979059a5b1d7ff53d8
    Selesai:   "bg-emerald-50 text-emerald-600 border-emerald-200",
  };
  const dots: Record<string, string> = {
    Menunggu: "bg-red-500 animate-pulse",
    Ditangani: "bg-amber-500",
<<<<<<< HEAD
    Diproses:  "bg-amber-500",
=======
>>>>>>> 69617d2e67bb988dafe96d979059a5b1d7ff53d8
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

// ── Halaman Utama ──
export default function AdminDashboard() {
  const router = useRouter();
  const [laporan, setLaporan] = useState<LaporanBencana[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const itemsPerPage = 8;

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

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

<<<<<<< HEAD
  // ── FIX: TypeScript Error Handling ──
  // Menambahkan casting (as string) agar TypeScript tidak protes pada properti status
  const statMenunggu  = laporan.filter(l => l.status === "Menunggu").length;
  const statDitangani = laporan.filter(l => l.status === "Diproses" || (l.status as string) === "Ditangani").length;
=======
  // ── Statistik ──
  const statMenunggu  = laporan.filter(l => l.status === "Menunggu").length;
  const statDitangani = laporan.filter(l => l.status === "Diproses").length;
>>>>>>> 69617d2e67bb988dafe96d979059a5b1d7ff53d8
  const statSelesai   = laporan.filter(l => l.status === "Selesai").length;

  // ── Filter & Search ──
  const filteredLaporan = laporan.filter(l => {
    const matchSearch = l.jenis_bencana.toLowerCase().includes(searchQuery.toLowerCase()) 
<<<<<<< HEAD
                      || (l.id?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());
    
    // FIX: Mendeklarasikan checkStatus sebagai tipe string umum
    let checkStatus: string = l.status;
    if (checkStatus === "Diproses") checkStatus = "Ditangani";

    const matchStatus = filterStatus === "Semua" || checkStatus === filterStatus;
=======
                     || (l.id?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "Semua" || l.status === filterStatus;
>>>>>>> 69617d2e67bb988dafe96d979059a5b1d7ff53d8
    return matchSearch && matchStatus;
  });

  // ── Pagination ──
  const totalPages = Math.ceil(filteredLaporan.length / itemsPerPage);
  const paginatedLaporan = filteredLaporan.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Reset ke halaman 1 jika filter berubah
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus]);

  const statusFilters = ["Semua", "Menunggu", "Ditangani", "Selesai"];

  // ── Loading Screen ──
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
      <aside className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out`}>
        
        {/* Logo */}
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

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-hidden">
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
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-200 space-y-2">
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* ── TOP HEADER BAR ── */}
        <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-200 px-5 flex items-center gap-4 shrink-0">
          
          {/* Search */}
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

          {/* Filter Status Pills */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1">
            {statusFilters.map(s => (
              <button 
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filterStatus === s 
                    ? "bg-white text-indigo-700 shadow-sm" 
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-xl font-semibold text-[11px] transition-all">
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filter Tanggal</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-xl font-semibold text-[11px] transition-all">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-[11px] transition-all shadow-md">
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak PDF</span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition-all relative">
              <Bell className="w-3.5 h-3.5" />
              {statMenunggu > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <LiveClock />
          </div>
        </header>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

          {/* ── Seksi 1: KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard label="Total Laporan"          value={laporan.length}    icon={TrendingUp}   color="slate"   subLabel="Semua waktu" />
            <KpiCard label="Kritis (Menunggu)"       value={statMenunggu}      icon={AlertTriangle}color="red"     subLabel="Perlu tindakan" trend={statMenunggu > 0 ? "Darurat" : undefined} />
            <KpiCard label="Operasional (Ditangani)" value={statDitangani}     icon={Clock}        color="amber"   subLabel="Sedang ditangani" />
            <KpiCard label="Tuntas (Selesai)"        value={statSelesai}       icon={CheckCircle2} color="emerald" subLabel="Berhasil diselesaikan" />
          </div>

          {/* ── Seksi 2: Peta + Panel Sistem ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: "380px" }}>
            
            {/* Peta GIS */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-indigo-600" /> 
                  Peta Radar Bencana
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Menunggu</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Ditangani</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Selesai</span>
                </div>
              </div>
              <div className="flex-1 relative z-0">
                <DynamicMap data={laporan} />
              </div>
            </div>

            {/* Panel Aksi & Status Sistem */}
            <div className="bg-white rounded-2xl border border-slate-200 flex flex-col p-4 gap-3 overflow-hidden">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Aksi Cepat
              </h3>
              
              {/* EWS Button */}
              <button className="w-full flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 hover:border-indigo-200 hover:bg-indigo-100 text-indigo-900 rounded-xl transition-all text-left group">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  <RadioTower className="w-4 h-4 text-indigo-600 group-hover:animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-900">Broadcast EWS</p>
                  <p className="text-[10px] text-indigo-600/70 mt-0.5">Notifikasi bahaya radius 1km</p>
                </div>
              </button>

              {/* Infrastruktur */}
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
                      <span className="flex items-center gap-2 text-slate-500">
                        <I className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px]">{label}</span>
                      </span>
                      <span className={`${color} ${bg} flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-current/20`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last Updated */}
              {lastUpdated && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  <RefreshCw className="w-3 h-3" />
                  Update: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              )}
            </div>
          </div>

          {/* ── Seksi 3: Tabel Data ── */}
          <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
            
            {/* Tabel Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-slate-800">Rekapitulasi Laporan</h3>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                  {filteredLaporan.length} data
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Filter className="w-3 h-3" />
                {filterStatus !== "Semua" && (
                  <button onClick={() => setFilterStatus("Semua")} className="text-indigo-600 hover:text-indigo-800 font-semibold">
                    ✕ Hapus Filter
                  </button>
                )}
              </div>
            </div>
            
            {/* Tabel */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["ID Resi", "Waktu Kejadian", "Kategori Bencana", "Koordinat", "Status", "Aksi"].map((h, i) => (
                      <th key={h} className={`px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 ${i === 5 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                  {paginatedLaporan.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Search className="w-6 h-6" />
                          <p className="font-semibold text-sm">Tidak ada data ditemukan</p>
                          <p className="text-[11px]">Coba ubah kata kunci atau filter</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedLaporan.map((item, idx) => (
                      <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors group ${idx % 2 === 0 ? "" : "bg-slate-50/20"}`}>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                            {item.id?.slice(0, 8) ?? "—"}...
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-semibold text-slate-700 text-[12px]">
                              {new Date(item.waktu_kejadian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(item.waktu_kejadian).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-800 text-[12px]">{item.jenis_bencana}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200/60 block w-fit">
                            {item.koordinat.lat.toFixed(4)}, {item.koordinat.lng.toFixed(4)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button className="opacity-0 group-hover:opacity-100 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 px-3 py-1 rounded-lg transition-all">
                            Detail →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                <p className="text-[11px] text-slate-500">
                  Hal. {currentPage} dari {totalPages} — {filteredLaporan.length} total data
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all ${
                          page === currentPage 
                            ? "bg-indigo-600 text-white" 
                            : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Bottom spacer */}
          <div className="h-2"></div>
        </div>
      </main>
    </div>
  );
}