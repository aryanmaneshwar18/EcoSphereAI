"use client";

import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function ReportsPage() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-indigo-500" />
          Analytics & Reports
        </h1>
        <p className="text-gray-400 mt-2">
          Deep dive into your historical data and export compliance reports.
        </p>
      </div>
      
      <EmptyState 
        icon={BarChart3}
        iconColor="#6366F1"
        title="Not enough data"
        description="We need at least 7 days of activity data to generate a comprehensive sustainability report."
      />
    </div>
  );
}
