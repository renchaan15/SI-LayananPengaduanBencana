"use client";
import { useState } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md space-y-5">
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
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password Anda"
            required
            className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-600 outline-none transition text-slate-900"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition disabled:opacity-50 cursor-pointer"
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