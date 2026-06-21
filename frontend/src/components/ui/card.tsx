"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLMotionProps<"div"> {
  glowColor?: string;
  interactive?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, interactive = false, glowColor = "rgba(16, 185, 129, 0.15)", ...props }, ref) => {
    
    return (
      <motion.div
        ref={ref}
        whileHover={interactive ? { y: -4, scale: 1.01 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "relative rounded-2xl border border-white/10 bg-[#0A0F1A]/80 backdrop-blur-xl overflow-hidden group",
          interactive && "cursor-pointer hover:border-emerald-500/30",
          className
        )}
        {...props}
      >
        {/* Subtle inner top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Ambient background glow on hover */}
        {interactive && (
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${glowColor}, transparent 70%)`
            }}
          />
        )}
        
        <div className="relative z-10 w-full h-full">
          {children as React.ReactNode}
        </div>
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
