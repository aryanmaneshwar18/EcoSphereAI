"use client";

import { useState } from "react";
import { Settings, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const [budget, setBudget] = useState("800");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would hit the API
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-gray-400" />
          Account Settings
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your profile, carbon budget, and notifications.
        </p>
      </div>
      
      <div className="glass-card p-8 relative overflow-hidden">
        <h2 className="text-xl font-semibold text-white mb-4">Carbon Baseline</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Monthly Budget (kg CO₂e)</label>
            <input 
              type="number" 
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 w-full max-w-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" 
            />
          </div>
          <button 
            onClick={handleSave}
            className="btn-primary mt-4 flex items-center gap-2"
          >
            Save Changes
          </button>
        </div>
        
        <AnimatePresence>
          {isSaved && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Settings saved!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
