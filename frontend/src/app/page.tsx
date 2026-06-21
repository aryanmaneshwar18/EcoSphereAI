"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingDown,
  TrendingUp,
  Car,
  Zap,
  Utensils,
  Trash2,
  Flame,
  Target,
  Trophy,
  History,
  Leaf
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn, formatCO2e, formatNumber } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboard-store";
import { SkeletonCard } from "@/components/ui/skeleton";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { dashboardData: data, fetchDashboard, isLoading } = useDashboardStore();
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
    fetchDashboard();
  }, [fetchDashboard]);

  if (!mounted) return null;

  if (isLoading || !data) {
    return (
      <div className="px-4 py-6 md:px-10 md:py-10 max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Mock data for the advanced area chart
  const weeklyData = [
    { name: "Mon", actual: 12, baseline: 15 },
    { name: "Tue", actual: 18, baseline: 15 },
    { name: "Wed", actual: 10, baseline: 15 },
    { name: "Thu", actual: 14, baseline: 15 },
    { name: "Fri", actual: 9, baseline: 15 },
    { name: "Sat", actual: 22, baseline: 15 },
    { name: "Sun", actual: 5, baseline: 15 },
  ];

  return (
    <div className="flex-1 p-4 md:p-10 flex flex-col lg:flex-row gap-8 max-w-[1440px] mx-auto w-full font-sans">
      
      {/* ── Ambient Glows ── */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none z-0"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col gap-8 relative z-10"
      >
        {/* ── Hero Header ── */}
        <motion.section variants={itemVariants} className="glass-card rounded-2xl p-6 md:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10"></div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Good Morning, <span className="text-emerald-400">{user?.firstName || "Alex"}</span>
            </h1>
            <p className="text-lg text-gray-400">Your environmental impact is tracking <span className="text-emerald-400 font-medium">12% better</span> than last month.</p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="6"></circle>
                <circle className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all duration-1000 ease-out" cx="50" cy="50" fill="none" r="45" stroke="#10B981" strokeDasharray="283" strokeDashoffset={283 - (283 * 84) / 100} strokeWidth="6" strokeLinecap="round"></circle>
              </svg>
              <div className="flex flex-col items-center justify-center z-10">
                <span className="text-2xl md:text-3xl font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">84</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Eco-Score</span>
              <span className="text-sm font-medium text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4" /> Top 10%
              </span>
            </div>
          </div>
        </motion.section>

        {/* ── Quick Actions ── */}
        <motion.section variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          {[
            { id: "transport", icon: Car, label: "Transport", color: "text-cyan-400", hoverBg: "group-hover:bg-cyan-500/20" },
            { id: "energy", icon: Zap, label: "Energy", color: "text-amber-400", hoverBg: "group-hover:bg-amber-500/20" },
            { id: "food", icon: Utensils, label: "Food", color: "text-emerald-400", hoverBg: "group-hover:bg-emerald-500/20" },
            { id: "waste", icon: Trash2, label: "Waste", color: "text-rose-400", hoverBg: "group-hover:bg-rose-500/20" },
          ].map((action) => (
            <Link href="/activities" key={action.id}>
              <button className="w-full glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-3 border border-white/5 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] transition-all group active:scale-95 cursor-pointer">
                <div className={cn("w-14 h-14 rounded-full bg-black/40 flex items-center justify-center transition-colors border border-white/5 shadow-inner", action.hoverBg)}>
                  <action.icon className={cn("w-6 h-6 transition-colors", action.color)} />
                </div>
                <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{action.label}</span>
              </button>
            </Link>
          ))}
        </motion.section>

        {/* ── KPI Grid ── */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Carbon Footprint */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-all">
            <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Leaf className="w-24 h-24 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-gray-400 mb-4 z-10">Carbon Footprint</span>
            <div className="flex items-end gap-2 z-10">
              <span className="text-4xl font-bold text-white tracking-tight">{formatCO2e(data.total_co2e_month)}</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-emerald-400 z-10 text-sm font-medium">
              <TrendingDown className="w-4 h-4" />
              <span>-12% vs last month</span>
            </div>
          </div>

          {/* Active Goals */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-all">
            <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-24 h-24 text-cyan-500" />
            </div>
            <span className="text-sm font-medium text-gray-400 mb-4 z-10">Budget Used</span>
            <div className="flex items-center gap-4 z-10">
              <span className="text-4xl font-bold text-white tracking-tight">{data.budget_percentage_used.toFixed(0)}%</span>
              <div className="w-12 h-12 relative">
                <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8"></circle>
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#06b6d4" strokeDasharray="251" strokeDashoffset={251 - (251 * data.budget_percentage_used) / 100} strokeWidth="8" strokeLinecap="round"></circle>
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm font-medium text-gray-400 z-10">
              {formatCO2e(data.carbon_budget_remaining)} remaining
            </div>
          </div>

          {/* Current Streak */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-all">
            <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Flame className="w-24 h-24 text-amber-500" />
            </div>
            <span className="text-sm font-medium text-gray-400 mb-4 z-10">Current Streak</span>
            <div className="flex items-end gap-2 z-10">
              <span className="text-4xl font-bold text-white tracking-tight">{data.streak}</span>
              <span className="text-lg text-gray-400 mb-1 font-medium">Days</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-amber-400 z-10 text-sm font-medium">
              <Flame className="w-4 h-4" />
              <span>Keep it going!</span>
            </div>
          </div>

          {/* Total Emissions Saved */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-all">
            <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-24 h-24 text-rose-500" />
            </div>
            <span className="text-sm font-medium text-gray-400 mb-4 z-10">Total Emissions Saved</span>
            <div className="flex items-end gap-2 z-10">
              <span className="text-4xl font-bold text-white tracking-tight">450</span>
              <span className="text-lg text-gray-400 mb-1 font-medium">kg</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-emerald-400 z-10 text-sm font-medium">
              <TrendingDown className="w-4 h-4" />
              <span>+45kg this week</span>
            </div>
          </div>
        </motion.section>

        {/* ── Emissions Chart Area ── */}
        <motion.section variants={itemVariants} className="glass-card rounded-2xl p-6 md:p-8 flex flex-col min-h-[450px] border border-white/10 bg-white/[0.03] backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Weekly Emissions Trend</h2>
            <div className="flex gap-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_#10B981]"></div>
                Actual
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 text-gray-400 text-xs font-semibold border border-white/10 border-dashed">
                <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                Budget Baseline
              </span>
            </div>
          </div>
          
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)', color: '#fff' }}
                  itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" activeDot={{ r: 6, fill: '#10B981', stroke: '#000', strokeWidth: 2 }} />
                <Area type="step" dataKey="baseline" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </motion.div>

      {/* ── Activity Feed Sidebar ── */}
      <motion.aside 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full lg:w-96 flex flex-col gap-6 relative z-10"
      >
        <div className="glass-card rounded-2xl p-6 border border-white/10 bg-white/[0.03] backdrop-blur-xl h-full shadow-lg">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-500" />
            Recent Activity
          </h3>
          
          <div className="flex flex-col gap-4">
            {/* Feed Item 1 */}
            <div className="bg-black/20 rounded-xl p-4 flex gap-4 items-start relative overflow-hidden border border-white/5 hover:bg-black/40 transition-colors cursor-pointer group">
              <div className="w-1 bg-emerald-500 absolute left-0 top-0 bottom-0 shadow-[0_0_10px_#10B981]"></div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">You saved 5kg CO₂ by cycling</p>
                <span className="text-xs text-gray-500 mt-1 block">2 hours ago</span>
              </div>
            </div>

            {/* Feed Item 2 */}
            <div className="bg-black/20 rounded-xl p-4 flex gap-4 items-start relative overflow-hidden border border-white/5 hover:bg-black/40 transition-colors cursor-pointer group">
              <div className="w-1 bg-cyan-500 absolute left-0 top-0 bottom-0 shadow-[0_0_10px_#06B6D4]"></div>
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="w-full">
                <p className="text-sm font-medium text-white">Community Challenge</p>
                <div className="flex justify-between items-center mt-2 mb-2">
                  <span className="text-xs text-gray-400">50% Complete</span>
                  <span className="text-xs text-cyan-400 font-medium">3 days left</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-1/2 shadow-[0_0_10px_#06B6D4]"></div>
                </div>
              </div>
            </div>

            {/* Feed Item 3 */}
            <div className="bg-black/20 rounded-xl p-4 flex gap-4 items-start relative overflow-hidden border border-white/5 hover:bg-black/40 transition-colors cursor-pointer group">
              <div className="w-1 bg-amber-500 absolute left-0 top-0 bottom-0 shadow-[0_0_10px_#F59E0B]"></div>
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Switched to LED lighting</p>
                <span className="text-xs text-gray-500 mt-1 block">Yesterday</span>
              </div>
            </div>
            
            {/* Feed Item 4 */}
            <div className="bg-black/20 rounded-xl p-4 flex gap-4 items-start relative overflow-hidden border border-white/5 hover:bg-black/40 transition-colors cursor-pointer group">
              <div className="w-1 bg-rose-500 absolute left-0 top-0 bottom-0 shadow-[0_0_10px_#F43F5E]"></div>
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Achieved 'Zero Waste' badge</p>
                <span className="text-xs text-gray-500 mt-1 block">2 days ago</span>
              </div>
            </div>

          </div>
        </div>
      </motion.aside>

    </div>
  );
}
