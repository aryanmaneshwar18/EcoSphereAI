"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
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
      
      <div className="glass-card p-8">
        <h2 className="text-xl font-semibold text-white mb-4">Carbon Baseline</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Monthly Budget (kg CO₂e)</label>
            <input 
              type="number" 
              defaultValue={800}
              className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 w-full max-w-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" 
            />
          </div>
          <button className="btn-primary mt-4">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
