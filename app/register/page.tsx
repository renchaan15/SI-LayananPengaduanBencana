"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Buat akun di Firebase Authentication
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Simpan profil dengan role "menunggu_verifikasi" di Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        nama: nama,
        email: email,
        role: "menunggu_verifikasi"
      });

      alert("Pendaftaran berhasil! Silakan hubungi Admin/Wali Nagari untuk aktivasi akun.");
      router.push("/login"); // Arahkan ke login setelah sukses
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        alert("Email ini sudah terdaftar.");
      } else if (err.code === 'auth/weak-password') {
        alert("Password terlalu lemah, minimal 6 karakter.");
      } else {
        alert("Terjadi kesalahan saat mendaftar.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md space-y-5">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-800">Daftar Relawan</h2>
          <p className="text-sm text-slate-500 mt-1">Sistem Layanan Bencana Nagari Lolo</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
          <input 
            type="text" 
            onChange={(e) => setNama(e.target.value)} 
            placeholder="Sesuai KTP" 
            required 
            className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-600 outline-none transition text-slate-900" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Email Aktif</label>
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
            placeholder="Minimal 6 karakter" 
            required 
            minLength={6}
            className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-600 outline-none transition text-slate-900" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Memproses..." : "Daftar Sekarang"}
        </button>

        <p className="text-center text-sm text-slate-600 mt-4">
          Sudah punya akun? <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Masuk di sini</Link>
        </p>
      </form>
    </div>
  );
}