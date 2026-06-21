"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Award, Flame, Star, Crown, Heart, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

// Mock Data for UI
const LEADERBOARD = [
  { id: 1, name: "Sarah Jenkins", xp: 12450, level: 24, streak: 145, avatar: "SJ", rank: 1, isMe: false },
  { id: 2, name: "Alex Chen", xp: 11200, level: 21, streak: 89, avatar: "AC", rank: 2, isMe: true },
  { id: 3, name: "Maria Garcia", xp: 10800, level: 20, streak: 67, avatar: "MG", rank: 3, isMe: false },
  { id: 4, name: "David Kim", xp: 9500, level: 18, streak: 42, avatar: "DK", rank: 4, isMe: false },
  { id: 5, name: "Emma Wilson", xp: 8200, level: 15, streak: 21, avatar: "EW", rank: 5, isMe: false },
];

const FEED = [
  { id: 1, user: "Sarah Jenkins", action: "completed the Vegan Week Challenge!", time: "2h ago", likes: 24, comments: 5, type: "challenge" },
  { id: 2, user: "Maria Garcia", action: "reached a 60-day logging streak 🔥", time: "4h ago", likes: 18, comments: 2, type: "streak" },
  { id: 3, user: "David Kim", action: "unlocked the 'Zero Waste Master' badge 🏆", time: "6h ago", likes: 32, comments: 8, type: "badge" },
  { id: 4, user: "Emma Wilson", action: "reduced weekly footprint by 15%", time: "1d ago", likes: 12, comments: 1, type: "milestone" },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"feed" | "leaderboard" | "badges">("leaderboard");

  return (
    <div className="flex-1 p-6 md:p-12 max-w-[1440px] mx-auto w-full">
      
      {/* ── Background Gradients ── */}
      <div className="fixed top-0 right-0 w-[50vw] h-[50vw] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 left-0 w-[50vw] h-[50vw] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-400" />
            Global Community
          </h1>
          <p className="text-slate-400 mt-2">Compete, share, and inspire others on the path to zero emissions.</p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white/[0.02] border border-white/[0.05] rounded-xl backdrop-blur-xl shrink-0">
          {(["feed", "leaderboard", "badges"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-medium transition-all relative z-10",
                activeTab === tab ? "text-white" : "text-slate-400 hover:text-slate-200"
              )}
            >
              {activeTab === tab && (
                <motion.div layoutId="communityTab" className="absolute inset-0 bg-white/[0.08] rounded-lg -z-10" />
              )}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "leaderboard" && (
          <motion.div 
            key="leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Top 3 Podium (Visual) */}
            <div className="lg:col-span-3 glass-card rounded-3xl p-8 border border-white/5 bg-white/[0.01] flex items-end justify-center gap-4 md:gap-8 h-[300px]">
              {/* 2nd Place */}
              <motion.div initial={{ height: 0 }} animate={{ height: "60%" }} className="w-24 md:w-32 bg-slate-800/50 rounded-t-2xl border-t border-x border-slate-700/50 relative flex flex-col items-center justify-end pb-4">
                <div className="absolute -top-16 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-400 flex items-center justify-center text-white font-bold mb-2 shadow-[0_0_15px_rgba(148,163,184,0.3)]">AC</div>
                  <span className="text-xs font-semibold text-white">Alex C.</span>
                </div>
                <span className="text-3xl font-bold text-slate-500 mb-1">2</span>
                <span className="text-xs text-slate-400">{LEADERBOARD[1].xp} XP</span>
              </motion.div>

              {/* 1st Place */}
              <motion.div initial={{ height: 0 }} animate={{ height: "85%" }} className="w-28 md:w-36 bg-indigo-900/30 rounded-t-2xl border-t border-x border-indigo-500/50 relative flex flex-col items-center justify-end pb-4 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                <div className="absolute -top-20 flex flex-col items-center">
                  <Crown className="w-6 h-6 text-amber-400 mb-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  <div className="w-14 h-14 rounded-full bg-indigo-600 border-2 border-amber-400 flex items-center justify-center text-white font-bold mb-2 shadow-[0_0_20px_rgba(251,191,36,0.3)]">SJ</div>
                  <span className="text-sm font-bold text-white">Sarah J.</span>
                </div>
                <span className="text-4xl font-black text-indigo-400 mb-1">1</span>
                <span className="text-xs font-medium text-indigo-200">{LEADERBOARD[0].xp} XP</span>
              </motion.div>

              {/* 3rd Place */}
              <motion.div initial={{ height: 0 }} animate={{ height: "45%" }} className="w-24 md:w-32 bg-amber-900/20 rounded-t-2xl border-t border-x border-amber-700/50 relative flex flex-col items-center justify-end pb-4">
                <div className="absolute -top-16 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-amber-900/50 border-2 border-amber-600 flex items-center justify-center text-white font-bold mb-2 shadow-[0_0_15px_rgba(217,119,6,0.3)]">MG</div>
                  <span className="text-xs font-semibold text-white">Maria G.</span>
                </div>
                <span className="text-3xl font-bold text-amber-600/50 mb-1">3</span>
                <span className="text-xs text-amber-500/70">{LEADERBOARD[2].xp} XP</span>
              </motion.div>
            </div>

            {/* List */}
            <div className="lg:col-span-3 glass-card rounded-3xl p-6 md:p-8 border border-white/5 bg-white/[0.02]">
              <div className="space-y-3">
                {LEADERBOARD.map((user) => (
                  <div 
                    key={user.id} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl transition-colors",
                      user.isMe ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center font-bold text-slate-500">{user.rank}</div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white text-sm font-bold border border-white/10">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          {user.name} {user.isMe && <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-indigo-500/20 text-indigo-400">You</span>}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> Lvl {user.level}</span>
                          <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-rose-400" /> {user.streak} days</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-indigo-400">{user.xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "feed" && (
          <motion.div 
            key="feed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            {FEED.map((post, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={post.id} 
                className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.02]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border border-white/10 shrink-0">
                    {post.user.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] text-slate-300">
                      <strong className="text-white">{post.user}</strong> {post.action}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 mb-4">{post.time}</div>
                    
                    <div className="flex items-center gap-6 pt-4 border-t border-white/[0.04]">
                      <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-rose-400 transition-colors group">
                        <Heart className="w-4 h-4 group-hover:fill-rose-400" />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </button>
                      <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors ml-auto">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "badges" && (
          <motion.div 
            key="badges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <EmptyState 
              icon={Award}
              title="Your Trophy Cabinet"
              description="Complete challenges and maintain streaks to unlock exclusive community badges."
              iconColor="text-amber-400"
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
