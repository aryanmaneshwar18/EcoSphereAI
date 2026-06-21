"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, Flame, Award, Heart, MessageSquare } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { SkeletonCard } from "@/components/ui/skeleton";

// Mock constants removed

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"feed" | "leaderboard">("feed");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.getCommunityLeaderboard(),
      apiClient.getCommunityFeed()
    ]).then(([lbRes, feedRes]) => {
      if (mounted) {
        setLeaderboard(lbRes.data || []);
        setFeed(feedRes.data || []);
        setIsLoading(false);
      }
    }).catch(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-6">
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-500" />
          Community
        </h1>
        <p className="text-gray-400 mt-2">
          See what others are doing and climb the ranks.
        </p>
      </div>

      <div className="flex border-b border-white/10 mb-8">
        <button
          onClick={() => setActiveTab("feed")}
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "feed" ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-gray-300"
          )}
        >
          Activity Feed
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "leaderboard" ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-gray-300"
          )}
        >
          Global Leaderboard
        </button>
      </div>

      {activeTab === "feed" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 max-w-2xl"
        >
          {feed.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No recent activity.</p>
          ) : feed.map((item, idx) => {
            const Icon = item.icon || Trophy;
            return (
            <div key={item.id || idx} className="glass-card p-5 border-white/5">
              <div className="flex items-start gap-4">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", item.bg || "bg-emerald-500/10")}>
                  <Icon className={cn("w-5 h-5", item.color || "text-emerald-500")} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-300">
                    <span className="font-semibold text-white">{item.user || item.username}</span> {item.action || item.content} <span className="font-medium text-emerald-400">{item.target}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{item.time || item.timestamp}</p>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-rose-400 transition-colors">
                      <Heart className="w-4 h-4" />
                      {item.likes || 0}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )})}
        </motion.div>
      )}

      {activeTab === "leaderboard" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm text-gray-400">
                  <th className="px-6 py-4 font-medium">Rank</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium text-right">Level</th>
                  <th className="px-6 py-4 font-medium text-right">Streak</th>
                  <th className="px-6 py-4 font-medium text-right">XP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No leaderboard data available</td></tr>
                ) : leaderboard.map((user, index) => (
                  <tr 
                    key={user.rank || index} 
                    className={cn(
                      "border-b border-white/5 transition-all duration-300 hover:bg-white/5 animate-fade-in-up",
                      `stagger-${Math.min(index + 1, 5)}`,
                      user.isCurrentUser ? "bg-blue-500/10 border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden" : ""
                    )}
                  >
                    {user.isCurrentUser && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 animate-pulse-glow" />
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-sm font-bold text-gray-300">
                        {user.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-bold">
                          {user.avatar || (user.username || user.name || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <span className={cn("font-medium", user.isCurrentUser ? "text-blue-400" : "text-white")}>
                          {user.username || user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      {user.level || 1}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-amber-500">
                        <Flame className="w-4 h-4" />
                        {user.streak || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-white">
                      {formatNumber(user.score || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
