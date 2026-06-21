"use client";

import { Plus, Bell } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export function TopBar() {
  const { user } = useUser();
  const initials = user?.firstName?.[0] || "E";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-end gap-3 px-6 sm:px-8 py-3 border-b bg-[rgba(3,7,18,0.6)] backdrop-blur-2xl border-white/[0.04]">
      <Link href="/activities">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-sm font-medium transition-all">
          <Plus className="w-4 h-4 text-teal-400" />
          <span className="hidden sm:inline">Log Activity</span>
        </button>
      </Link>
      <button className="relative p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors" aria-label="Notifications">
        <Bell className="w-[18px] h-[18px] text-slate-400" />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-teal-400 rounded-full" />
      </button>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-[0_0_12px_rgba(20,184,166,0.3)]"
        style={{ background: "linear-gradient(135deg, #14B8A6, #22D3EE)" }}
      >
        {initials}
      </div>
    </header>
  );
}
