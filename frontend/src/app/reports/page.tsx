"use client";

import { motion } from "framer-motion";
import { FileText, Download, FileSpreadsheet, TrendingUp, Calendar, ArrowRight, ArrowDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const REPORTS = [
  { id: 1, title: "Monthly Summary", subtitle: "May 2026", trend: "-12%", isPositive: true, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { id: 2, title: "Weekly Breakdown", subtitle: "Week 24", trend: "+5%", isPositive: false, color: "text-rose-400", bg: "bg-rose-500/10" },
  { id: 3, title: "Carbon Twin Forecast", subtitle: "Q3 Projection", trend: "-20%", isPositive: true, color: "text-cyan-400", bg: "bg-cyan-500/10" },
];

export default function ReportsPage() {
  return (
    <div className="flex-1 p-6 md:p-12 max-w-[1200px] mx-auto w-full">
      
      {/* ── Background Gradients ── */}
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            Detailed Reports
          </h1>
          <p className="text-slate-400 mt-2">Generate, view, and export your sustainability data analytics.</p>
        </div>

        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white font-medium transition-all group shadow-lg">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Download className="w-4 h-4" />
            Generate PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {REPORTS.map((report, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={report.id}
            className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5", report.bg)}>
                <Calendar className={cn("w-6 h-6", report.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border",
                report.isPositive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              )}>
                {report.isPositive ? <ArrowDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {report.trend}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight mb-1">{report.title}</h3>
            <p className="text-sm text-slate-400 mb-6">{report.subtitle}</p>

            <div className="flex items-center text-sm font-medium text-slate-300 group-hover:text-blue-400 transition-colors">
              View Analysis <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Deep Dive Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Generated Insights Summary</h2>
        </div>
        <div className="p-8 text-slate-300 leading-relaxed space-y-6">
          <p>
            Your overall carbon footprint for May 2026 was <strong className="text-white font-semibold">12% lower</strong> than the previous month, primarily driven by a significant reduction in transport emissions. By substituting 40% of your typical car commutes with cycling, you avoided approximately 45kg of CO₂e.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Strengths</h4>
              <ul className="list-disc list-inside text-sm text-emerald-400 space-y-2">
                <li>Transport emissions down 40%</li>
                <li>Zero-waste shopping consistency</li>
                <li>Plant-based diet targets met 90%</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Areas for Improvement</h4>
              <ul className="list-disc list-inside text-sm text-amber-400 space-y-2">
                <li>Home energy usage spiked in week 2</li>
                <li>Digital footprint slightly above average</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
