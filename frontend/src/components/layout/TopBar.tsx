"use client";

import { Plus, Bell } from "lucide-react";
import { getGreeting } from "@/lib/utils";

export function TopBar() {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b bg-[rgba(10,15,26,0.8)] backdrop-blur-[20px] border-[var(--border-primary)]"
    >
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          {getGreeting()}, <span className="gradient-text">Explorer</span>
        </h1>
        <p className="text-sm mt-0.5 text-[var(--text-tertiary)]">
          Track your impact. Change the world.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-secondary flex items-center gap-2 !py-2 !px-3" aria-label="Log new activity">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Log Activity</span>
        </button>
        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full" />
        </button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #10B981, #3B82F6)" }}
        >
          E
        </div>
      </div>
    </header>
  );
}
