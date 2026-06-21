"use client";

import { motion } from "framer-motion";
import { Target, Zap, CheckCircle2, Flame, Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const DAILY_MISSIONS = [
  { id: 1, title: "Log a Transport Activity", xp: 50, progress: 1, target: 1, completed: true },
  { id: 2, title: "Eat a plant-based meal", xp: 100, progress: 0, target: 1, completed: false },
  { id: 3, title: "Keep emissions below 15kg", xp: 150, progress: 12, target: 15, completed: false, isNegative: true },
];

export default function ChallengesPage() {
  return (
    <div className="flex-1 p-6 md:p-12 max-w-[1200px] mx-auto w-full">
      
      {/* ── Background Gradients ── */}
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-amber-400" />
            Challenges
          </h1>
          <p className="text-slate-400 mt-2">Complete daily missions to earn XP and level up.</p>
        </div>

        {/* User Stats Card */}
        <div className="flex items-center gap-6 px-6 py-4 rounded-2xl glass-card bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Total XP</div>
              <div className="text-xl font-bold text-white leading-none">12,450</div>
            </div>
          </div>
          <div className="w-[1px] h-10 bg-white/10"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Streak</div>
              <div className="text-xl font-bold text-white leading-none">15</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Missions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Daily Missions</h2>
          
          <div className="space-y-4">
            {DAILY_MISSIONS.map((mission, i) => {
              const progressPercentage = Math.min(100, Math.max(0, (mission.progress / mission.target) * 100));
              
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={mission.id} 
                  className={cn(
                    "glass-card p-6 rounded-3xl border flex items-center gap-6 relative overflow-hidden transition-all",
                    mission.completed ? "bg-amber-500/5 border-amber-500/20" : "bg-white/[0.02] border-white/5"
                  )}
                >
                  {mission.completed && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] -z-10 rounded-full"></div>
                  )}
                  
                  {/* Circular Progress */}
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="stroke-white/10" strokeWidth="8" fill="none" />
                      <motion.circle 
                        initial={{ strokeDashoffset: 251 }}
                        animate={{ strokeDashoffset: 251 - (251 * progressPercentage) / 100 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.5 + i * 0.1 }}
                        cx="50" cy="50" r="40" 
                        className={cn("stroke-amber-400", mission.completed && "stroke-emerald-400")} 
                        strokeWidth="8" fill="none" 
                        strokeDasharray="251"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {mission.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <span className="text-sm font-bold text-white">{mission.progress}/{mission.target}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className={cn("text-lg font-bold mb-1", mission.completed ? "text-white" : "text-slate-200")}>{mission.title}</h3>
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
                      <Zap className="w-4 h-4 fill-amber-400" />
                      +{mission.xp} XP
                    </div>
                  </div>

                  {mission.completed && (
                    <div className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold shrink-0">
                      Claimed
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Path / Level Progression */}
        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col items-center relative overflow-hidden">
          <h2 className="text-xl font-bold text-white tracking-tight w-full text-center mb-10">Journey</h2>
          
          <div className="relative flex flex-col items-center gap-8 w-full">
            {/* Connecting Line */}
            <div className="absolute top-10 bottom-10 w-2 bg-white/5 rounded-full z-0"></div>
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: "50%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute top-10 w-2 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full z-0"
            ></motion.div>

            {/* Level Nodes */}
            {[
              { id: 1, level: 23, status: "completed", icon: Trophy },
              { id: 2, level: 24, status: "current", icon: Zap },
              { id: 3, level: 25, status: "locked", icon: Lock },
              { id: 4, level: 26, status: "locked", icon: Lock },
            ].map((node, i) => (
              <div key={node.id} className="relative z-10 w-full flex justify-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className={cn(
                    "w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-xl transition-transform hover:scale-110 cursor-pointer",
                    node.status === "completed" ? "bg-amber-500 border-amber-300 text-amber-900" :
                    node.status === "current" ? "bg-slate-900 border-amber-400 text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)]" :
                    "bg-slate-900 border-white/10 text-slate-500"
                  )}
                >
                  {node.status === "current" ? (
                    <div className="text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-80">Lvl</div>
                      <div className="text-2xl font-black leading-none">{node.level}</div>
                    </div>
                  ) : (
                    <node.icon className={cn("w-8 h-8", node.status === "completed" ? "fill-amber-900/50" : "")} />
                  )}
                </motion.div>
                
                {/* Milestone Label */}
                {node.status === "locked" && node.level === 25 && (
                  <div className="absolute left-1/2 ml-14 top-1/2 -translate-y-1/2 glass-card px-4 py-2 rounded-xl border border-white/10 whitespace-nowrap">
                    <p className="text-sm font-bold text-white">Unlock Diamond League</p>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
