"use client";

import { useState } from "react";
import { Target, Plus, Leaf } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { motion, AnimatePresence } from "framer-motion";

export default function GoalsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [goals, setGoals] = useState<{id: string, title: string, target: string}[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  const handleCreateGoal = () => {
    if (!newGoalTitle) return;
    setGoals([...goals, { id: Date.now().toString(), title: newGoalTitle, target: newGoalTarget }]);
    setIsCreating(false);
    setNewGoalTitle("");
    setNewGoalTarget("");
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 relative">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-rose-500" />
            Sustainability Goals
          </h1>
          <p className="text-gray-400 mt-2">
            Set targets and track your progress towards a lower footprint.
          </p>
        </div>
        {goals.length > 0 && (
          <button 
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        )}
      </div>
      
      {goals.length === 0 && !isCreating ? (
        <EmptyState 
          icon={Target}
          iconColor="#F43F5E"
          title="No active goals"
          description="You haven't set any sustainability targets yet. Start small by committing to Meatless Mondays or reducing car trips."
          actionLabel="Create New Goal"
          onAction={() => setIsCreating(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="glass-card p-6 border border-rose-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-rose-500" />
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">In Progress</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{goal.title}</h3>
              <p className="text-gray-400 text-sm">{goal.target}</p>
              <div className="mt-6 bg-white/5 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-500 to-orange-500 h-full w-[0%]" />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">0% Completed</p>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal overlay */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-8 w-full max-w-md border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create New Goal</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Goal Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Meatless Mondays"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 w-full text-white focus:outline-none focus:border-rose-500 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Target Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Eat vegan every Monday for a month"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 w-full text-white focus:outline-none focus:border-rose-500 transition-colors" 
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2 rounded-lg font-medium bg-white/5 text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateGoal}
                  disabled={!newGoalTitle}
                  className="flex-1 py-2 rounded-lg font-medium bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
