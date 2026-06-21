"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Bot, User, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export default function AICoachPage() {
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm EcoSphere AI. Based on your recent dashboard activity, I notice your transport emissions are higher this month. Would you like some tailored suggestions on reducing them, or do you have a specific question about your carbon footprint?"
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQuery = query.trim();
    setQuery("");
    
    // Add user message
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userQuery }]);
    setIsTyping(true);

    try {
      const response = await apiClient.queryCoach(userQuery);
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "ai", 
        content: response.data?.response || "I couldn't process that right now." 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "ai", 
        content: "Sorry, I'm having trouble connecting to the Multi-Agent system." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-indigo-400" />
          EcoSphere AI Coach
        </h1>
        <p className="text-gray-400 mt-2">
          Your personal sustainability consultant. Powered by GPT-4o and the LangGraph Multi-Agent engine.
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 glass-card border-white/10 flex flex-col overflow-hidden">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={cn(
                "flex items-start gap-4 max-w-[85%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === "ai" 
                  ? "bg-indigo-500/20 text-indigo-400" 
                  : "bg-emerald-500/20 text-emerald-500"
              )}>
                {msg.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-md",
                msg.role === "ai" 
                  ? "bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm backdrop-blur-md" 
                  : "bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 text-white rounded-tr-sm backdrop-blur-md"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm flex items-center gap-2 shadow-md backdrop-blur-md h-[52px]">
                <div className="flex gap-1.5 items-center">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-indigo-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-indigo-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-indigo-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about your emissions, alternatives, or scientific data..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <button 
              type="submit"
              disabled={!query.trim() || isTyping}
              className="absolute right-2 w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
              Powered by RAG & Multi-Agent StateGraph
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
