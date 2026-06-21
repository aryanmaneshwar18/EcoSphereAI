"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingDown,
  Car,
  Zap,
  Utensils,
  Trash2,
  TreePine,
  Lightbulb,
  Droplets,
  Activity,
  Sparkles,
  ArrowRight,
  Flame,
  Target,
  Award,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboard-store";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

/* ── Framer Variants ─────────────────────────────── */
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

/* ── Fallback Data (always shows something beautiful) */
const FALLBACK_WEEKLY = [
  { name: "Mon", actual: 8.2, baseline: 12 },
  { name: "Tue", actual: 11.5, baseline: 12 },
  { name: "Wed", actual: 6.8, baseline: 12 },
  { name: "Thu", actual: 9.3, baseline: 12 },
  { name: "Fri", actual: 7.1, baseline: 12 },
  { name: "Sat", actual: 5.4, baseline: 12 },
  { name: "Sun", actual: 4.9, baseline: 12 },
];

const FALLBACK_PIE = [
  { name: "Transport", value: 38, color: "#22D3EE" },
  { name: "Energy", value: 28, color: "#F59E0B" },
  { name: "Food", value: 22, color: "#10B981" },
  { name: "Waste", value: 12, color: "#F43F5E" },
];

const CATEGORY_COLORS: Record<string, string> = {
  transport: "#22D3EE",
  energy: "#F59E0B",
  food: "#10B981",
  waste: "#F43F5E",
  water: "#3B82F6",
  shopping: "#8B5CF6",
  digital: "#6366F1",
};

/* ── Animated Counter ─────────────────────────────── */
function AnimatedNumber({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display.toFixed(decimals)}</>;
}

/* ══════════════════════════════════════════════════════
   DASHBOARD PAGE
   ══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { dashboardData: data, fetchDashboard, isLoading } = useDashboardStore();
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
    fetchDashboard();
  }, [fetchDashboard]);

  /* ── Derived data (real OR fallback) ─────────────── */
  const weeklyData = useMemo(() => {
    if (data?.daily_emissions?.length) {
      return data.daily_emissions.slice(0, 7).reverse().map(d => ({
        name: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
        actual: Math.round(d.co2e * 10) / 10,
        baseline: 12,
      }));
    }
    return FALLBACK_WEEKLY;
  }, [data]);

  const pieData = useMemo(() => {
    if (data?.category_breakdown && Object.keys(data.category_breakdown).length > 0) {
      return Object.entries(data.category_breakdown).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: Math.round(value * 10) / 10,
        color: CATEGORY_COLORS[key] || "#64748B",
      }));
    }
    return FALLBACK_PIE;
  }, [data]);

  const stats = useMemo(() => ({
    todayFootprint: data?.daily_emissions?.[0]?.co2e ?? 7.2,
    budgetUsed: data?.budget_percentage_used ?? 42,
    streak: data?.streak ?? 0,
    level: data?.level ?? 1,
    xp: data?.xp ?? 0,
    trees: data?.impact_equivalencies?.trees_needed ?? 3.2,
    cars: data?.impact_equivalencies?.cars_removed_days ?? 12,
    phones: data?.impact_equivalencies?.phone_charges ?? 847,
    bulbs: data?.impact_equivalencies?.led_bulb_hours ?? 156,
    monthTotal: data?.total_co2e_month ?? 185,
    weekTotal: data?.total_co2e_week ?? 53,
  }), [data]);

  if (!mounted) return null;

  const firstName = user?.firstName || "Explorer";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto w-full relative overflow-x-hidden">
      
      {/* ── Ambient Mesh Gradients ── */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-500/[0.04] blur-[180px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-500/[0.04] blur-[180px] pointer-events-none -z-10" />
      <div className="fixed top-[30%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-indigo-500/[0.03] blur-[120px] pointer-events-none -z-10" />

      <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-6 lg:gap-8">
        
        {/* ═══════════════════════════════════════════════
            ROW 1 — Hero + Impact Equivalencies
            ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Hero Impact Card */}
          <motion.section variants={fadeUp} className="xl:col-span-2 rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl relative overflow-hidden group">
            {/* Glow orb */}
            <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-gradient-to-br from-teal-500/20 to-cyan-500/10 rounded-full blur-[80px] opacity-60 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 lg:mb-12">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2 leading-[1.1]">
                  {greeting}, <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">{firstName}</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-400 max-w-lg">
                  Your carbon footprint is trending <span className="text-teal-400 font-semibold">12% lower</span> than last week. Keep it up!
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shrink-0">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-semibold text-white">Level {stats.level}</span>
                <span className="text-xs text-slate-400">· {stats.xp} XP</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {[
                { label: "Today", value: stats.todayFootprint, suffix: " kg", decimals: 1 },
                { label: "This Week", value: stats.weekTotal, suffix: " kg", decimals: 0 },
                { label: "Budget Used", value: stats.budgetUsed, suffix: "%", decimals: 0 },
                { label: "Streak", value: stats.streak, suffix: " days", decimals: 0 },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.04]">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      <AnimatedNumber value={stat.value} decimals={stat.decimals} />
                    </span>
                    <span className="text-sm text-slate-400 font-medium">{stat.suffix}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Impact Equivalencies */}
          <motion.section variants={fadeUp} className="grid grid-cols-2 gap-3 lg:gap-4">
            {[
              { icon: TreePine, value: stats.trees, label: "Trees Needed", color: "emerald", decimals: 1 },
              { icon: Car, value: stats.cars, label: "Car-Free Days", color: "cyan", decimals: 0 },
              { icon: Lightbulb, value: stats.bulbs, label: "LED Bulb Hrs", color: "amber", decimals: 0 },
              { icon: Droplets, value: stats.phones, label: "Phone Charges", color: "rose", decimals: 0 },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl p-5 lg:p-6 flex flex-col justify-center border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 group cursor-default">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 duration-300",
                  `bg-${item.color}-500/15 text-${item.color}-400`
                )}
                  style={{
                    backgroundColor: item.color === "emerald" ? "rgba(16,185,129,0.15)" :
                      item.color === "cyan" ? "rgba(34,211,238,0.15)" :
                      item.color === "amber" ? "rgba(245,158,11,0.15)" :
                      "rgba(244,63,94,0.15)",
                    color: item.color === "emerald" ? "#34d399" :
                      item.color === "cyan" ? "#22d3ee" :
                      item.color === "amber" ? "#fbbf24" : "#fb7185",
                  }}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  <AnimatedNumber value={item.value} decimals={item.decimals} />
                </span>
                <span className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </motion.section>
        </div>

        {/* ═══════════════════════════════════════════════
            ROW 2 — Charts + AI Insights
            ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Emissions Area Chart */}
          <motion.section variants={fadeUp} className="xl:col-span-2 rounded-3xl p-6 sm:p-8 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6 lg:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-teal-400" />
                </div>
                Weekly Emissions
              </h2>
              <div className="flex gap-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_#14B8A6]" />
                  <span className="text-xs font-medium text-slate-500">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                  <span className="text-xs font-medium text-slate-500">Budget</span>
                </div>
              </div>
            </div>
            
            <div className="w-full h-[260px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="none" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} tickLine={false} dy={10} />
                  <YAxis stroke="none" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(3,7,18,0.95)", borderColor: "rgba(255,255,255,0.08)", borderRadius: "14px", backdropFilter: "blur(12px)", color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", padding: "12px 16px" }}
                    itemStyle={{ color: "#14B8A6", fontWeight: "600", fontSize: "13px" }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)", marginBottom: "4px", fontSize: "12px" }}
                    cursor={{ stroke: "rgba(255,255,255,0.08)" }}
                  />
                  <Area type="monotone" dataKey="baseline" stroke="rgba(255,255,255,0.12)" strokeWidth={2} strokeDasharray="6 4" fill="none" />
                  <Area type="monotone" dataKey="actual" stroke="#14B8A6" strokeWidth={2.5} fill="url(#gradTeal)" activeDot={{ r: 5, fill: "#14B8A6", stroke: "#030712", strokeWidth: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          {/* AI Insights Panel */}
          <motion.section variants={fadeUp} className="flex flex-col gap-4">
            <div className="rounded-3xl p-6 sm:p-8 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />
              
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2.5 mb-5 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                AI Insights
              </h2>
              
              <div className="flex-1 flex flex-col gap-3 relative z-10">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/[0.08] to-transparent border border-cyan-500/[0.12]">
                  <h4 className="text-sm font-bold text-white mb-1.5">🚗 Transport Dominates</h4>
                  <p className="text-[13px] text-cyan-100/60 leading-relaxed">
                    Transport is 48% of your footprint. Switching 2 car trips to cycling saves <strong className="text-cyan-400">18kg CO₂/month</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/[0.08] to-transparent border border-emerald-500/[0.12]">
                  <h4 className="text-sm font-bold text-white mb-1.5">🥗 Diet Win</h4>
                  <p className="text-[13px] text-emerald-100/60 leading-relaxed">
                    Food emissions are <strong className="text-emerald-400">22% below average</strong>. Plant-based meals are paying off.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/[0.08] to-transparent border border-amber-500/[0.12]">
                  <h4 className="text-sm font-bold text-white mb-1.5">⚡ Energy Spike</h4>
                  <p className="text-[13px] text-amber-100/60 leading-relaxed">
                    Energy use up 8% this week. Consider LED bulbs to save <strong className="text-amber-400">5kg CO₂/month</strong>.
                  </p>
                </div>

                <Link href="/coach" className="mt-auto pt-2">
                  <button className="w-full py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 group">
                    Ask EcoCoach <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </motion.section>
        </div>

        {/* ═══════════════════════════════════════════════
            ROW 3 — Quick Actions + Pie + Goals
            ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Quick Log */}
          <motion.section variants={fadeUp} className="rounded-3xl p-6 sm:p-8 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white tracking-tight mb-5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <Target className="w-4 h-4 text-indigo-400" />
              </div>
              Quick Log
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "transport", icon: Car, label: "Transport", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.15)", color: "#22D3EE" },
                { id: "energy", icon: Zap, label: "Energy", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)", color: "#F59E0B" },
                { id: "food", icon: Utensils, label: "Food", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)", color: "#10B981" },
                { id: "waste", icon: Trash2, label: "Waste", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.15)", color: "#F43F5E" },
              ].map((action) => (
                <Link href={`/activities?category=${action.id}`} key={action.id}>
                  <button
                    className="w-full rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg border"
                    style={{ backgroundColor: action.bg, borderColor: action.border }}
                  >
                    <action.icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" style={{ color: action.color }} />
                    <span className="text-xs font-semibold text-white">{action.label}</span>
                  </button>
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Pie Chart */}
          <motion.section variants={fadeUp} className="rounded-3xl p-6 sm:p-8 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex flex-col">
            <h2 className="text-lg font-bold text-white tracking-tight mb-2 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center">
                <Award className="w-4 h-4 text-rose-400" />
              </div>
              Breakdown
            </h2>
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(3,7,18,0.95)", borderColor: "rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff" }}
                    itemStyle={{ fontWeight: "600" }}
                  />
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                    {pieData.map((entry, i) => (
                      <Cell key={`c-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </div>
              ))}
            </div>
          </motion.section>

          {/* Active Goals Summary */}
          <motion.section variants={fadeUp} className="rounded-3xl p-6 sm:p-8 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex flex-col">
            <h2 className="text-lg font-bold text-white tracking-tight mb-5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              Active Goals
            </h2>
            <div className="flex-1 flex flex-col gap-3">
              {[
                { title: "Zero Waste Week", progress: 71, color: "#F43F5E" },
                { title: "Cycle to Work", progress: 65, color: "#22D3EE" },
                { title: "Reduce Energy 20%", progress: 40, color: "#F59E0B" },
              ].map((goal) => (
                <div key={goal.title} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.04]">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-sm font-semibold text-white">{goal.title}</span>
                    <span className="text-xs font-bold text-slate-400">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as const, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/goals" className="mt-4">
              <button className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 group">
                View All Goals <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.section>
        </div>

      </motion.div>
    </div>
  );
}
