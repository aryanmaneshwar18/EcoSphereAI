"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Leaf, ArrowRight, ArrowLeft, Check, Car, Zap, Utensils, Home } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const QUESTIONS = [
  {
    id: "diet",
    title: "What is your typical diet?",
    icon: Utensils,
    options: [
      { value: "meat_heavy", label: "Meat Heavy", description: "Meat with most meals" },
      { value: "omnivore", label: "Omnivore", description: "Meat 3-4 times a week" },
      { value: "pescatarian", label: "Pescatarian", description: "Fish/seafood but no meat" },
      { value: "vegetarian", label: "Vegetarian", description: "No meat or fish" },
      { value: "vegan", label: "Vegan", description: "No animal products" }
    ]
  },
  {
    id: "transport",
    title: "How do you primarily commute?",
    icon: Car,
    options: [
      { value: "car_petrol", label: "Petrol/Diesel Car", description: "Standard internal combustion" },
      { value: "car_electric", label: "Electric Vehicle", description: "Fully electric car" },
      { value: "motorcycle", label: "Motorcycle", description: "Petrol motorcycle" },
      { value: "public_transit", label: "Public Transit", description: "Bus, train, tram" },
      { value: "bicycle_walk", label: "Bicycle / Walking", description: "Active transport" }
    ]
  },
  {
    id: "energy",
    title: "How is your home primarily heated?",
    icon: Zap,
    options: [
      { value: "natural_gas", label: "Natural Gas", description: "Standard gas boiler" },
      { value: "electricity", label: "Electricity", description: "Electric radiators" },
      { value: "heat_pump", label: "Heat Pump", description: "Air or ground source" },
      { value: "wood_pellet", label: "Wood/Biomass", description: "Wood burning stove" },
      { value: "oil", label: "Heating Oil", description: "Oil boiler" }
    ]
  },
  {
    id: "home",
    title: "What is your household size?",
    icon: Home,
    options: [
      { value: "1", label: "Just me", description: "Living alone" },
      { value: "2", label: "Two people", description: "Couple or flatmates" },
      { value: "3", label: "Three people", description: "Small family" },
      { value: "4", label: "Four people", description: "Standard family" },
      { value: "5", label: "Five or more", description: "Large household" }
    ]
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = QUESTIONS[currentStep];

  const handleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = async () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await submitBaseline();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitBaseline = async () => {
    setIsSubmitting(true);
    try {
      // Map frontend values to backend expected format
      const payload = {
        country: "uk", // Default for now, could be added as a question
        diet_type: answers.diet || "omnivore",
        vehicle_type: answers.transport === "car_petrol" ? "petrol" : answers.transport === "car_electric" ? "electric" : "none",
        daily_commute_km: answers.transport === "bicycle_walk" ? 0 : 20,
        flights_per_year: 1,
        monthly_electricity_kwh: 250,
        has_solar: false,
        heating_type: answers.energy || "natural_gas",
        household_size: parseInt(answers.home || "1")
      };

      await apiClient.calculateBaseline(payload);
      router.push("/");
    } catch (error) {
      console.error("Baseline calculation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: "radial-gradient(circle at top right, rgba(16, 185, 129, 0.05), transparent 40%), var(--bg-primary)"
      }}
    >
      <div className="max-w-xl w-full relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-2xl"
            style={{ background: "linear-gradient(135deg, #10B981, #06B6D4)" }}
          >
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Let&apos;s calculate your baseline.</h1>
          <p className="text-gray-400">We need a few details to build your initial carbon footprint profile.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {QUESTIONS.map((_, idx) => (
            <div 
              key={idx} 
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                idx <= currentStep ? "bg-emerald-500" : "bg-white/10"
              )}
            />
          ))}
        </div>

        {/* Question Card */}
        <div className="glass-card p-8 border-white/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <currentQuestion.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-xl font-semibold text-white">{currentQuestion.title}</h2>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all duration-200 group flex items-center justify-between",
                        isSelected 
                          ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      )}
                    >
                      <div>
                        <div className="font-medium text-white mb-0.5">{option.label}</div>
                        <div className="text-sm text-gray-400">{option.description}</div>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected ? "border-emerald-500 bg-emerald-500" : "border-gray-500 group-hover:border-gray-400"
                      )}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
              className={cn(
                "flex items-center text-sm font-medium transition-colors",
                currentStep === 0 ? "text-gray-600 cursor-not-allowed" : "text-gray-400 hover:text-white"
              )}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id] || isSubmitting}
              className={cn(
                "btn-primary flex items-center px-6",
                (!answers[currentQuestion.id] || isSubmitting) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Calculating..." : currentStep === QUESTIONS.length - 1 ? "Complete Setup" : "Continue"}
              {!isSubmitting && <ArrowRight className="w-4 h-4 ml-1.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
