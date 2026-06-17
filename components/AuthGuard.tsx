"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserRole } from "@/types/disaster";

export default function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: UserRole[] }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || user.isAnonymous) {
        router.replace("/login");
        return;
      }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role as UserRole;
        if (!allowedRoles.includes(role)) alert("Unauthorized Access"); // Atau redirect ke 403
        else setLoading(false);
      } else {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router, allowedRoles]);

  if (loading) return <div className="p-10 text-center">Memverifikasi Sesi...</div>;
  return <>{children}</>;
}
