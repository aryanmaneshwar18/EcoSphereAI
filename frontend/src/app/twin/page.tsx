"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Leaf, Zap, Car, TrendingDown, ArrowRight, Sun, Bike, Salad, Train
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { cn, formatCO2e } from "@/lib/utils";

import { apiClient } from "@/lib/api-client";
import { SkeletonCard } from "@/components/ui/skeleton";

const SCENARIOS = [
  {
    id: "solar",
    title: "Install Solar Panels",
    icon: Sun,
    description: "Switch 80% of your home electricity to solar power.",
    savings: 1200,
    color: "#F59E0B" // amber
  },
  {
    id: "ev",
    title: "Switch to Electric Vehicle",
    icon: Car,
    description: "Replace your petrol car commuting with an EV.",
    savings: 2100,
    color: "#3B82F6" // blue
  },
  {
    id: "diet",
    title: "Plant-based Diet",
    icon: Salad,
    description: "Shift from an omnivore to a vegetarian diet.",
    savings: 950,
    color: "#10B981" // emerald
  },
  {
    id: "commute",
    title: "Cycle to Work",
    icon: Bike,
    description: "Cycle instead of driving 3 days a week.",
    savings: 600,
    color: "#8B5CF6" // violet
  }
];

export default function CarbonTwinPage() {
  const [activeScenarios, setActiveScenarios] = useState<Set<string>>(new Set());
  const [baseTotal, setBaseTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiClient.getTwinTrajectory().then(res => {
      if (mounted) {
        setBaseTotal(res.data?.annual_projected_co2e || 8500);
        setIsLoading(false);
      }
    }).catch(() => {
      if (mounted) {
        setBaseTotal(8500);
        setIsLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const toggleScenario = (id: string) => {
    const next = new Set(activeScenarios);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setActiveScenarios(next);
  };

  const totalSavings = SCENARIOS.filter(s => activeScenarios.has(s.id))
    .reduce((sum, s) => sum + s.savings, 0);
  
  const MOCK_CURRENT_TOTAL = baseTotal || 0;
  
  const projectedTotal = MOCK_CURRENT_TOTAL - totalSavings;
  const savingsPercentage = MOCK_CURRENT_TOTAL > 0 ? (totalSavings / MOCK_CURRENT_TOTAL) * 100 : 0;

  // Generate projection data
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return {
      year: year.toString(),
      current: MOCK_CURRENT_TOTAL,
      projected: MOCK_CURRENT_TOTAL - (totalSavings * (i === 0 ? 0 : 1)) // Instant drop after year 0
    };
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Leaf className="w-8 h-8 text-emerald-500" />
          Carbon Twin Simulator
        </h1>
        <p className="text-gray-400 mt-2">
          Model "What If?" scenarios and forecast your future environmental impact.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Scenarios */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Simulate Changes</h2>
          
          {SCENARIOS.map((scenario) => {
            const isActive = activeScenarios.has(scenario.id);
            return (
              <motion.div
                key={scenario.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleScenario(scenario.id)}
                className={cn(
                  "p-5 rounded-2xl cursor-pointer border transition-all duration-300",
                  isActive 
                    ? "bg-white/10 border-white/30 shadow-lg shadow-emerald-500/10" 
                    : "glass-card border-white/5 hover:border-white/20 hover:shadow-md"
                )}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      isActive ? "bg-white/20" : "bg-white/5"
                    )}
                  >
                    <scenario.icon 
                      className="w-5 h-5" 
                      style={{ color: isActive ? "#fff" : scenario.color }} 
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">{scenario.title}</h3>
                    <p className="text-xs text-gray-400 mb-3">{scenario.description}</p>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                      <TrendingDown className="w-4 h-4" />
                      {formatCO2e(scenario.savings)} / yr
                    </div>
                  </div>
                  {/* Checkbox circle */}
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center mt-1 transition-colors",
                    isActive ? "bg-emerald-500 border-emerald-500" : "border-gray-600"
                  )}>
                    {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column: Projection & Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-6">
              <p className="text-sm text-gray-400 mb-2">Current Trajectory</p>
              <div className="text-3xl font-bold text-white">
                {formatCO2e(MOCK_CURRENT_TOTAL)}
              </div>
              <p className="text-xs text-gray-500 mt-1">per year</p>
            </div>
            
            <div className="glass-card p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-sm text-emerald-400 mb-2 font-medium">Potential Savings</p>
              <div className="text-3xl font-bold text-emerald-400">
                {formatCO2e(totalSavings)}
              </div>
              <div className="mt-2 progress-bar h-1.5">
                <div 
                  className="progress-bar-fill bg-emerald-500" 
                  style={{ width: `${savingsPercentage}%` }} 
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {savingsPercentage.toFixed(1)}% reduction
              </p>
            </div>

            <div className="glass-card p-6 border-white/20">
              <p className="text-sm text-blue-400 mb-2 font-medium">Projected Future</p>
              <div className="text-3xl font-bold text-white">
                {formatCO2e(projectedTotal)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Target for next year</p>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-6 min-h-[400px] flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">5-Year Forecast</h3>
              <p className="text-sm text-gray-400">Compare your current path vs the simulated scenarios.</p>
            </div>
            
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4B5563" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4B5563" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    stroke="#6B7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6B7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val/1000}t`}
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
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="current" 
                    name="Current Path"
                    stroke="#4B5563" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCurrent)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="projected" 
                    name="With Changes"
                    stroke="#10B981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProjected)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-sm text-gray-400">Current Path</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-gray-400">Projected Future</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
