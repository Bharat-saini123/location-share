"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { MapPin, LogOut } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-blue-400" />
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">
          Friend Tracker
        </span>
      </div>

      {/* User */}
      {session?.user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || ""}
                width={28}
                height={28}
                className="rounded-full border border-slate-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 font-medium">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span className="text-slate-300 text-sm hidden sm:block">
              {session.user.name?.split(" ")[0]}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
