"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconColor = "text-cyan-400"
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center justify-center text-center w-full min-h-[300px] p-10 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
        <div className="w-32 h-32 rounded-full bg-cyan-500/10 blur-[50px]"></div>
      </div>

      <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-5 shadow-lg">
        <Icon className={`w-8 h-8 ${iconColor.startsWith('text') ? iconColor : ''}`} style={iconColor.startsWith('#') || iconColor.startsWith('var') ? { color: iconColor } : {}} />
      </div>

      <h4 className="relative z-10 text-xl font-bold text-white mb-2 tracking-tight">
        {title}
      </h4>
      
      <p className="relative z-10 text-sm max-w-sm mb-8 text-slate-400 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button 
          onClick={onAction} 
          className="relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
