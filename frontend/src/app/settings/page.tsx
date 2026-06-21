"use client";

import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, Palette, Leaf, ChevronRight, LogOut } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="flex-1 p-6 md:p-12 max-w-[1000px] mx-auto w-full">
      
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-slate-400" />
          Settings
        </h1>
        <p className="text-slate-400 mt-2">Manage your account, preferences, and privacy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-10">
        
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          {[
            { id: "profile", label: "Profile", icon: User, active: true },
            { id: "budget", label: "Carbon Budget", icon: Leaf, active: false },
            { id: "notifications", label: "Notifications", icon: Bell, active: false },
            { id: "appearance", label: "Appearance", icon: Palette, active: false },
            { id: "privacy", label: "Privacy & Security", icon: Shield, active: false },
          ].map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                item.active 
                  ? "bg-white/[0.08] text-white" 
                  : "text-slate-400 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <item.icon className={`w-4 h-4 ${item.active ? "text-cyan-400" : ""}`} />
              {item.label}
            </button>
          ))}
          
          <div className="pt-6 mt-6 border-t border-white/5">
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          {/* Apple-style Form Section */}
          <section>
            <h2 className="text-lg font-bold text-white mb-4 pl-1">Personal Information</h2>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden divide-y divide-white/[0.05]">
              
              <div className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-pointer group">
                <div>
                  <div className="text-sm text-slate-400 mb-0.5">Name</div>
                  <div className="text-[15px] font-medium text-white">{user?.fullName || "Loading..."}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-pointer group">
                <div>
                  <div className="text-sm text-slate-400 mb-0.5">Email address</div>
                  <div className="text-[15px] font-medium text-white">{user?.primaryEmailAddress?.emailAddress || "Loading..."}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>

            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4 pl-1">Eco Preferences</h2>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden divide-y divide-white/[0.05]">
              
              <div className="flex items-center justify-between p-4 bg-white/[0.01]">
                <div>
                  <div className="text-[15px] font-medium text-white mb-0.5">Diet Type</div>
                  <div className="text-sm text-slate-400">Used for accurate food emission calculations</div>
                </div>
                <select className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50">
                  <option>Omnivore</option>
                  <option>Vegetarian</option>
                  <option>Vegan</option>
                  <option>Pescatarian</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.01]">
                <div>
                  <div className="text-[15px] font-medium text-white mb-0.5">Primary Transport</div>
                  <div className="text-sm text-slate-400">Your most frequent mode of transit</div>
                </div>
                <select className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50">
                  <option>Petrol Car</option>
                  <option>Electric Vehicle</option>
                  <option>Public Transit</option>
                  <option>Bicycle</option>
                </select>
              </div>

            </div>
          </section>

        </motion.div>
      </div>

    </div>
  );
}
