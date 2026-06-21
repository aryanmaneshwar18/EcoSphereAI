"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Leaf,
  LayoutDashboard,
  Activity,
  Target,
  Sparkles,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Bell,
  Search,
  Moon,
  TrendingDown,
  Flame,
  Trophy,
  Zap,
  Car,
  Utensils,
  Droplets,
  Trash2,
  ShoppingBag,
  Monitor,
  TreePine,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
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
} from "recharts";
import { cn, formatCO2e, formatNumber } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboard-store";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// MOCK_DASHBOARD removed in favor of real API data

// Constants imported from @/lib/constants
// ── Stagger Animation Variants ───────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { dashboardData: data, fetchDashboard, isLoading } = useDashboardStore();

  useEffect(() => {
    setMounted(true);
    fetchDashboard();
  }, [fetchDashboard]);

  if (!mounted) return null;

  if (isLoading || !data) {
    return (
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const pieData = Object.entries(data.category_breakdown).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: Math.round(value * 10) / 10,
    color: CATEGORY_CONFIG[key]?.color || "#6B7280",
  }));

  return (
    <div className="px-8 py-6">
      <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* ── Stat Cards Row ──────────────────────────────── */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Monthly CO₂e */}
              <GlassCard interactive className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    This Month
                  </span>
                  <span className="badge badge-success">
                    <TrendingDown className="w-3 h-3" />
                    12%
                  </span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {formatCO2e(data.total_co2e_month)}
                </div>
                <p className="text-xs mt-1 text-gray-400">
                  CO₂e emitted
                </p>
              </GlassCard>

              {/* Carbon Budget */}
              <GlassCard interactive className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Carbon Budget
                  </span>
                  <span
                    className={cn(
                      "badge",
                      data.budget_percentage_used < 80 ? "badge-success" : "badge-warning"
                    )}
                  >
                    {data.budget_percentage_used.toFixed(0)}%
                  </span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {formatCO2e(data.carbon_budget_remaining)}
                </div>
                <div className="mt-3 progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${data.budget_percentage_used}%`,
                      background:
                        data.budget_percentage_used > 80
                          ? "linear-gradient(90deg, #F59E0B, #EF4444)"
                          : undefined,
                    }}
                  />
                </div>
                <p className="text-xs mt-1.5 text-gray-400">
                  of {formatCO2e(data.carbon_budget_total)} remaining
                </p>
              </GlassCard>

              {/* Streak */}
              <GlassCard interactive className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Streak
                  </span>
                  <Flame className="w-5 h-5" style={{ color: "#F59E0B" }} />
                </div>
                <div className="text-3xl font-bold text-white">
                  {data.streak}
                  <span className="text-lg ml-1 text-gray-400">days</span>
                </div>
                <p className="text-xs mt-1 text-gray-400">
                  Keep it going! 🔥
                </p>
              </GlassCard>

              {/* Level & XP */}
              <GlassCard interactive className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Level
                  </span>
                  <Trophy className="w-5 h-5" style={{ color: "#10B981" }} />
                </div>
                <div className="text-3xl font-bold text-white">
                  {data.level}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${(data.xp % 500) / 5}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs mt-1.5 text-gray-400">
                  {formatNumber(data.xp)} XP
                </p>
              </GlassCard>
            </motion.div>

            {/* ── Charts Row ──────────────────────────────────── */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Emission Trend Chart */}
              <div className="glass-card p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                      Emission Trend
                    </h3>
                    <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                      Daily CO₂e over the last 30 days
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {["Week", "Month", "Year"].map((period) => (
                      <button
                        key={period}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                          period === "Month"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "text-gray-500 hover:text-gray-300"
                        )}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.daily_emissions}>
                    <defs>
                      <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `${val}kg`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid var(--border-secondary)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        boxShadow: "var(--shadow-lg)",
                      }}
                      formatter={(value: any) => [`${Number(value || 0).toFixed(1)} kg`, "CO₂e"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    />
                    <Area
                      type="monotone"
                      dataKey="co2e"
                      stroke="#10B981"
                      strokeWidth={2}
                      fill="url(#gradientArea)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown Pie */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  Category Breakdown
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
                  This month&apos;s emissions by source
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid var(--border-secondary)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        boxShadow: "var(--shadow-lg)",
                      }}
                      formatter={(value: any) => [`${value} kg CO₂e`]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="mt-4 space-y-2">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: entry.color }}
                        />
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {entry.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>
                        {entry.value} kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Weekly Trend & Impact ────────────────────────── */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Weekly Trend */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  Weekly Trend
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
                  12-week emission trajectory
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.weekly_trend}>
                    <defs>
                      <linearGradient id="gradientWeekly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="week_start"
                      tick={{ fill: "#6B7280", fontSize: 10 }}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return `W${Math.ceil(d.getDate() / 7)}`;
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#6B7280", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `${val}kg`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid var(--border-secondary)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        boxShadow: "var(--shadow-lg)",
                      }}
                      formatter={(value: any) => [`${Number(value || 0).toFixed(1)} kg`, "CO₂e"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="co2e"
                      stroke="#06B6D4"
                      strokeWidth={2}
                      fill="url(#gradientWeekly)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Impact Equivalencies */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  Your Impact
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
                  This month&apos;s emissions are equivalent to:
                </p>
                <div className="space-y-4">
                  {[
                    {
                      icon: TreePine,
                      label: "Trees needed to absorb",
                      value: data.impact_equivalencies.trees_needed,
                      unit: "trees/year",
                      color: "#10B981",
                    },
                    {
                      icon: Car,
                      label: "Days of car driving",
                      value: data.impact_equivalencies.cars_removed_days,
                      unit: "days",
                      color: "#3B82F6",
                    },
                    {
                      icon: Zap,
                      label: "Phone charges",
                      value: data.impact_equivalencies.phone_charges,
                      unit: "charges",
                      color: "#F59E0B",
                    },
                    {
                      icon: Monitor,
                      label: "Hours powering a home",
                      value: data.impact_equivalencies.homes_powered_hours,
                      unit: "hours",
                      color: "#8B5CF6",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-white/[0.02]"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: `${item.color}15` }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          {item.label}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                          {formatNumber(item.value, item.value < 100 ? 1 : 0)}
                        </span>
                        <span className="text-xs ml-1" style={{ color: "var(--text-tertiary)" }}>
                          {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Category Detail Cards ───────────────────────── */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Emission Sources
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {Object.entries(data.category_breakdown).map(([category, co2e]) => {
                  const config = CATEGORY_CONFIG[category];
                  if (!config) return null;
                  const Icon = config.icon;
                  const percentage = (co2e / data.total_co2e_month) * 100;

                  return (
                    <motion.div
                      key={category}
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                      className="glass-card p-4 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ background: `${config.color}15` }}
                        >
                          <Icon className="w-4.5 h-4.5" style={{ color: config.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize" style={{ color: "var(--text-primary)" }}>
                            {category}
                          </p>
                          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                            {percentage.toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                      <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {formatCO2e(co2e)}
                      </div>
                      <div className="mt-2 progress-bar" style={{ height: 4 }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            background: config.color,
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Recent Activities (Empty State Polish) ──────── */}
            <motion.div variants={itemVariants} className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  Recent Logs
                </h3>
                <button className="text-sm font-medium gradient-text hover:opacity-80 transition-opacity">
                  View All
                </button>
              </div>
              
              <EmptyState 
                icon={Leaf}
                title="No activities logged yet"
                description="Your carbon twin is waiting for data. Log your first meal, commute, or energy usage to start seeing insights."
                actionLabel="Log First Activity"
                onAction={() => console.log("Open Log Modal")}
              />
            </motion.div>

          </motion.div>
    </div>
  );
}
