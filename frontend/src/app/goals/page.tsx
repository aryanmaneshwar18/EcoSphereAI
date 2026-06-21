"use client";

import { Target } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function GoalsPage() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Target className="w-8 h-8 text-rose-500" />
          Sustainability Goals
        </h1>
        <p className="text-gray-400 mt-2">
          Set targets and track your progress towards a lower footprint.
        </p>
      </div>
      
      <EmptyState 
        icon={Target}
        iconColor="#F43F5E"
        title="No active goals"
        description="You haven't set any sustainability targets yet. Start small by committing to Meatless Mondays or reducing car trips."
        actionLabel="Create New Goal"
        onAction={() => {}}
      />
    </div>
  );
}
