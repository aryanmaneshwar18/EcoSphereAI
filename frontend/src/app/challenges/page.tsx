"use client";

import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function ChallengesPage() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-500" />
          Global Challenges
        </h1>
        <p className="text-gray-400 mt-2">
          Compete with the community in monthly eco-challenges.
        </p>
      </div>
      
      <EmptyState 
        icon={Trophy}
        iconColor="#F59E0B"
        title="No active challenges"
        description="The next global challenge starts on the 1st of the month. Stay tuned!"
      />
    </div>
  );
}
