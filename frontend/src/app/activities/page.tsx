"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { 
  Car, Zap, Utensils, Trash2, Droplets, ShoppingBag, Monitor, 
  ChevronRight, Calendar, ArrowLeft, CheckCircle2
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboard-store";
import { cn } from "@/lib/utils";

// ── Configuration ───────────────────────────────────────────────
const CATEGORIES = [
  { id: "transport", label: "Transport", icon: Car, color: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/30" },
  { id: "energy", label: "Energy", icon: Zap, color: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/30" },
  { id: "food", label: "Food & Drink", icon: Utensils, color: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/30" },
  { id: "waste", label: "Waste", icon: Trash2, color: "bg-violet-500", text: "text-violet-500", border: "border-violet-500/30" },
  { id: "water", label: "Water", icon: Droplets, color: "bg-cyan-500", text: "text-cyan-500", border: "border-cyan-500/30" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, color: "bg-pink-500", text: "text-pink-500", border: "border-pink-500/30" },
  { id: "digital", label: "Digital", icon: Monitor, color: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-500/30" },
];

const SUBCATEGORIES: Record<string, { id: string; label: string; unit: string }[]> = {
  transport: [
    { id: "car_petrol", label: "Petrol Car Driving", unit: "km" },
    { id: "car_electric", label: "Electric Car Driving", unit: "km" },
    { id: "flight_short", label: "Short-haul Flight", unit: "km" },
    { id: "train", label: "Train Journey", unit: "km" },
    { id: "bus", label: "Bus Journey", unit: "km" },
  ],
  food: [
    { id: "beef", label: "Beef Meal", unit: "kg" },
    { id: "chicken", label: "Chicken Meal", unit: "kg" },
    { id: "vegetarian", label: "Vegetarian Meal", unit: "kg" },
    { id: "vegan", label: "Vegan Meal", unit: "kg" },
  ],
  energy: [
    { id: "electricity", label: "Electricity Usage", unit: "kWh" },
    { id: "natural_gas", label: "Natural Gas Heating", unit: "kWh" },
  ]
};

// ── Component ──────────────────────────────────────────────────
export default function LogActivityPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const logActivity = useDashboardStore((state) => state.logActivity);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      amount: "",
      activity_date: new Date().toISOString().split("T")[0],
      notes: ""
    }
  });

  const amount = watch("amount");
  const subcategoryDef = selectedCategory && selectedSubcategory 
    ? SUBCATEGORIES[selectedCategory]?.find(s => s.id === selectedSubcategory)
    : null;

  const onSubmit = async (data: any) => {
    if (!selectedCategory || !selectedSubcategory) return;
    
    setIsSubmitting(true);
    try {
      await logActivity({
        category: selectedCategory,
        subcategory: selectedSubcategory,
        activity_name: subcategoryDef?.label || "Activity",
        amount: parseFloat(data.amount),
        unit: subcategoryDef?.unit || "units",
        activity_date: new Date(data.activity_date).toISOString(),
      });
      setStep(3); // Success step
    } catch (error) {
      console.error("Failed to log activity", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="mb-8">
        <button 
          onClick={() => {
            if (step === 2) setStep(1);
            else window.history.back();
          }}
          className="flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {step === 2 ? "Back to Categories" : "Back to Dashboard"}
        </button>
        <h1 className="text-3xl font-bold text-white">Log Activity</h1>
        <p className="text-gray-400 mt-2">Track your daily actions and see your impact.</p>
      </div>

      {/* Step 1: Select Category */}
      {step === 1 && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-1"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setStep(2);
              }}
              className={cn(
                "glass-card p-5 flex items-center justify-between group cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
                "border border-white/5 hover:border-white/20 hover:shadow-lg"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-opacity-10", cat.color.replace('bg-', 'bg-') + '/20')}>
                  <cat.icon className={cn("w-6 h-6", cat.text)} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white text-lg">{cat.label}</h3>
                  <p className="text-sm text-gray-400">
                    {SUBCATEGORIES[cat.id]?.length || 0} activity types
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </button>
          ))}
        </motion.div>
      )}

      {/* Step 2: Details */}
      {step === 2 && selectedCategory && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="glass-card p-8 border border-white/10"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Subcategory Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Activity Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUBCATEGORIES[selectedCategory]?.map((sub) => (
                  <button
                    type="button"
                    key={sub.id}
                    onClick={() => setSelectedSubcategory(sub.id)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all",
                      selectedSubcategory === sub.id 
                        ? `border-emerald-500 bg-emerald-500/10` 
                        : "border-white/10 hover:border-white/20 bg-white/5"
                    )}
                  >
                    <div className="font-medium text-white">{sub.label}</div>
                  </button>
                ))}
                {!SUBCATEGORIES[selectedCategory] && (
                  <p className="text-sm text-gray-400 py-4">No activities mapped for this category yet.</p>
                )}
              </div>
            </div>

            {selectedSubcategory && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-6">
                
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount ({subcategoryDef?.unit})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      autoFocus
                      placeholder="e.g. 15.5"
                      {...register("amount", { required: true, min: 0 })}
                      className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 w-full text-white focus:outline-none focus:border-emerald-500 transition-colors text-xl pl-4 pr-16"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <span className="text-gray-400 font-medium">{subcategoryDef?.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      {...register("activity_date", { required: true })}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !amount}
                  className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Logging..." : "Log Impact"}
                </button>
              </motion.div>
            )}
          </form>
        </motion.div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center flex flex-col items-center border border-emerald-500/30"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 glow-emerald-strong"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">Activity Logged!</h2>
          <p className="text-gray-400 mb-8 max-w-md">
            Your emission calculations have been updated and synced with your dashboard. Keep up the streak!
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setStep(1);
                setSelectedCategory(null);
                setSelectedSubcategory(null);
              }}
              className="btn-secondary"
            >
              Log Another
            </button>
            <button 
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
