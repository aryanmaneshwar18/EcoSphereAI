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
  TreePine,
  Lightbulb,
  Droplets,
  Package,
  Activity,
  Sparkles,
  ArrowRight,
  Target
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
  Cell
} from "recharts";
import { cn, formatCO2e } from "@/lib/utils";
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const CATEGORY_COLORS: Record<string, string> = {
  transport: "#22D3EE", // Cyan
  energy: "#F59E0B",    // Amber
  food: "#10B981",      // Emerald
  waste: "#F43F5E",     // Rose
  water: "#3B82F6",     // Blue
  shopping: "#8B5CF6",  // Purple
  digital: "#6366F1",   // Indigo
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
      <div className="px-6 py-8 md:px-12 md:py-12 max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <SkeletonCard className="col-span-2 h-[300px]" />
          <SkeletonCard className="h-[300px]" />
        </div>
      </div>
    );
  }

  // Analytics Data
  const weeklyData = data.daily_emissions.slice(0, 7).reverse().map(d => ({
    name: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    actual: Math.round(d.total * 10) / 10,
    baseline: 15,
  }));

  const pieData = Object.entries(data.category_breakdown).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: Math.round(value * 10) / 10,
    color: CATEGORY_COLORS[key] || "#64748B",
  }));

  return (
    <div className="flex-1 p-6 md:p-12 max-w-[1600px] mx-auto w-full font-sans relative">
      
      {/* ── Ambient Background Gradients ── */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-500/5 blur-[150px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none -z-10"></div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-8 relative z-10">
        
        {/* ── Top Section: Hero & Equivalencies ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Hero Impact Card */}
          <motion.section variants={itemVariants} className="xl:col-span-2 glass-card rounded-3xl p-8 md:p-10 flex flex-col justify-between border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                  Good Morning, <span className="text-teal-400">{user?.firstName || "Alex"}</span>
                </h1>
                <p className="text-lg text-slate-400">Your carbon footprint is trending <span className="text-teal-400 font-medium tracking-wide">12% lower</span> than last week.</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-medium text-white">Eco Score: 84</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Today's Footprint</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white tracking-tight">{formatCO2e(data.daily_emissions[0]?.total || 0)}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Budget Used</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white tracking-tight">{data.budget_percentage_used.toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Current Streak</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white tracking-tight">{data.streak}</span>
                  <span className="text-slate-400 font-medium">days</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Weekly Trend</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-500/20 text-teal-400">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-bold text-teal-400">-2.4kg</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Impact Equivalencies Grid */}
          <motion.section variants={itemVariants} className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-3xl p-6 flex flex-col justify-center border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-default">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <TreePine className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">{data.impact_equivalency.trees_saved.toFixed(1)}</span>
              <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Trees Saved</span>
            </div>
            <div className="glass-card rounded-3xl p-6 flex flex-col justify-center border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-default">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">{data.impact_equivalency.km_driven_avoided.toFixed(0)}</span>
              <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Km Avoided</span>
            </div>
            <div className="glass-card rounded-3xl p-6 flex flex-col justify-center border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-default">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Lightbulb className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">{data.impact_equivalency.smartphone_charges.toFixed(0)}</span>
              <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Phone Charges</span>
            </div>
            <div className="glass-card rounded-3xl p-6 flex flex-col justify-center border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-default">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">45</span>
              <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Liters Saved</span>
            </div>
          </motion.section>
        </div>

        {/* ── Middle Section: Analytics & AI Insights ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Area Chart */}
          <motion.section variants={itemVariants} className="xl:col-span-2 glass-card rounded-3xl p-8 border border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-400" />
                Emissions Overview
              </h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_10px_#14B8A6]"></div>
                  <span className="text-xs font-medium text-slate-400">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  <span className="text-xs font-medium text-slate-400">Budget</span>
                </div>
              </div>
            </div>
            
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(3,7,18,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#14B8A6', fontWeight: '600' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Area type="monotone" dataKey="actual" stroke="#14B8A6" strokeWidth={3} fill="url(#colorActual)" activeDot={{ r: 6, fill: '#14B8A6', stroke: '#030712', strokeWidth: 3 }} />
                  <Area type="step" dataKey="baseline" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          {/* AI Insights Sidebar */}
          <motion.section variants={itemVariants} className="flex flex-col gap-4">
            <div className="glass-card rounded-3xl p-8 border border-white/5 bg-white/[0.02] backdrop-blur-xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] -z-10"></div>
              
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                AI Insights
              </h2>
              
              <div className="flex-1 flex flex-col gap-4">
                {/* Insight 1 */}
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <h4 className="text-sm font-semibold text-white mb-1">Transport Efficiency</h4>
                  <p className="text-sm text-cyan-100/70 leading-relaxed">
                    Transport contributes 48% of your footprint. Switching two weekly car trips to cycling could save <strong className="text-cyan-400">18kg CO₂/month</strong>.
                  </p>
                </div>

                {/* Insight 2 */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="text-sm font-semibold text-white mb-1">Food Waste Minimalist</h4>
                  <p className="text-sm text-emerald-100/70 leading-relaxed">
                    Your food emissions are <strong className="text-emerald-400">22% below average</strong>. Keep prioritizing plant-based meals to maintain this streak!
                  </p>
                </div>

                {/* Quick Action Button */}
                <Link href="/coach" className="mt-auto">
                  <button className="w-full py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white text-sm font-medium transition-all flex items-center justify-center gap-2 group">
                    Ask EcoCoach <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </motion.section>
        </div>

        {/* ── Bottom Section: Quick Log & Breakdown ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Quick Actions / Categories */}
          <motion.section variants={itemVariants} className="xl:col-span-2 glass-card rounded-3xl p-8 border border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white tracking-tight mb-6">Log Activity</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: "transport", icon: Car, label: "Transport", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
                { id: "energy", icon: Zap, label: "Energy", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                { id: "food", icon: Utensils, label: "Food", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                { id: "waste", icon: Trash2, label: "Waste", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
              ].map((action) => (
                <Link href={`/activities?category=${action.id}`} key={action.id}>
                  <button className={cn(
                    "w-full rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 group hover:-translate-y-1",
                    action.bg, action.border, "border"
                  )}>
                    <action.icon className={cn("w-8 h-8 transition-transform duration-300 group-hover:scale-110", action.color)} />
                    <span className="text-sm font-medium text-white">{action.label}</span>
                  </button>
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Breakdown Pie Chart */}
          <motion.section variants={itemVariants} className="glass-card rounded-3xl p-8 border border-white/5 bg-white/[0.02] backdrop-blur-xl flex flex-col items-center justify-center relative">
            <h2 className="text-xl font-bold text-white tracking-tight mb-4 w-full text-left">Category Breakdown</h2>
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(3,7,18,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ fontWeight: '600' }}
                  />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

        </div>

      </motion.div>
    </div>
  );
}
