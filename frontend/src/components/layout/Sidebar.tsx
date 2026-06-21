"use client";

import { motion } from "framer-motion";
import { Leaf, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";

export function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (val: boolean) => void }) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // Linear-style spring
      className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-transparent border-r border-white/[0.04] backdrop-blur-[24px]"
      style={{
        background: "linear-gradient(180deg, rgba(3, 7, 18, 0.6) 0%, rgba(3, 7, 18, 0.8) 100%)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-white/[0.04] flex-shrink-0">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
          style={{ background: "linear-gradient(135deg, #14B8A6, #22D3EE)" }}
        >
          <Leaf className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base font-bold text-white tracking-tight whitespace-nowrap overflow-hidden"
          >
            EcoSphere
          </motion.span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-all duration-200"
              title={collapsed ? item.label : undefined}
            >
              {/* Hover/Active Background */}
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-white/[0.06] rounded-xl border border-white/[0.08]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-200" />
              )}
              
              <item.icon className={cn(
                "w-4 h-4 flex-shrink-0 relative z-10 transition-colors duration-200",
                isActive ? "text-[#22D3EE]" : "text-slate-400 group-hover:text-slate-200"
              )} />
              
              {!collapsed && (
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap relative z-10 transition-colors duration-200",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                )}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-white/[0.04]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl hover:bg-white/[0.04] transition-colors group"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-slate-500 group-hover:text-slate-300 transition-colors">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </div>
          {!collapsed && <span className="text-sm font-medium text-slate-500 group-hover:text-slate-300 transition-colors">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
