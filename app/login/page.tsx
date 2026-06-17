"use client";
import { useState } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        if (role === "menunggu_verifikasi") {
          await signOut(auth);
          alert("Akun Anda sedang menunggu verifikasi oleh Admin Nagari.");
          setLoading(false);
          return;
        }
        router.push(role === "admin" ? "/admin" : "/relawan");
      } else {
        alert("Data profil tidak ditemukan di sistem.");
      }
    } catch (err) {
      alert("Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 relative">
      
      {/* ── TOMBOL KEMBALI KE PORTAL WARGA ── */}
      <Link 
        href="/" 
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all font-semibold text-xs sm:text-sm active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Kembali ke Portal Warga</span>
        <span className="sm:hidden">Kembali</span>
      </Link>

      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md space-y-5 mt-12 sm:mt-0">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-800">Login Petugas</h2>
          <p className="text-sm text-slate-500 mt-1">Sistem Layanan Bencana Nagari Lolo</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            required
            className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-600 outline-none transition text-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password Anda"
              required
              className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-600 outline-none transition text-slate-900 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-indigo-600 transition"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>

        <p className="text-center text-sm text-slate-600 mt-4">
          Belum punya akun? <Link href="/register" className="text-indigo-600 font-semibold hover:underline">Daftar Relawan Baru</Link>
        </p>
      </form>
    </div>
  );
}