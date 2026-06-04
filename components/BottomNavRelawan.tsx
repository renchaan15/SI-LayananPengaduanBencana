"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, MapPinned, Trophy, UserSquare } from "lucide-react";

export default function BottomNavRelawan() {
  const pathname = usePathname();

  const navItems = [
    { name: "Tugas", path: "/relawan", icon: ClipboardList },
    { name: "Peta", path: "/relawan/peta", icon: MapPinned },
    { name: "Peringkat", path: "/relawan/peringkat", icon: Trophy },
    { name: "Profil", path: "/relawan/profil", icon: UserSquare },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      {/* Fade blur backdrop */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-8px_32px_rgba(0,0,0,0.06)]" />

      <nav className="relative flex justify-between items-center px-4 py-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.path}
              className="flex flex-col items-center justify-center gap-1 group relative w-16 py-1"
            >
              {/* Active pill background */}
              <div
                className={`relative flex items-center justify-center w-11 h-9 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 shadow-md shadow-indigo-200"
                    : "group-hover:bg-slate-100"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />

                {/* Active dot */}
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-400 rounded-full border-2 border-white" />
                )}
              </div>

              <span
                className={`text-[10px] font-semibold tracking-wide transition-colors duration-200 ${
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}