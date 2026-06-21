"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Bot, User, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: string[];
}

const SUGGESTED_PROMPTS = [
  "How can I reduce my transport emissions this week?",
  "Analyze my energy consumption trend.",
  "Give me a zero-waste grocery shopping list.",
  "What is my carbon twin projection?"
];

export default function AICoachPage() {
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "ai",
      content: "Hello! I am EcoSphere AI. I analyze your carbon footprint data and provide tailored, actionable insights to help you reduce emissions. What would you like to focus on today?"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    
    const userQuery = overrideQuery || query.trim();
    if (!userQuery) return;

    setQuery("");
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userQuery }]);
    setIsTyping(true);

    try {
      const response = await apiClient.queryCoach(userQuery);
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "ai", 
        content: response.data?.response || "I couldn't process that right now.",
        sources: ["IPCC 2023 Report", "Your recent activity log"]
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "ai", 
        content: "Sorry, I am having trouble connecting to the intelligence engine right now." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] relative overflow-hidden bg-[var(--bg-primary)]">
      
      {/* ── Ambient Glows ── */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* ── Header ── */}
      <div className="shrink-0 pt-10 pb-6 px-6 md:px-12 max-w-4xl mx-auto w-full flex items-center justify-between border-b border-white/[0.04] z-10 relative">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Intelligence Engine
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">Powered by EcoSphere Multi-Agent System</p>
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 custom-scrollbar z-10">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-4",
                  msg.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg border",
                  msg.role === "ai" 
                    ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" 
                    : "bg-teal-500/10 border-teal-500/20 text-teal-400"
                )}>
                  {msg.role === "ai" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                
                {/* Bubble */}
                <div className={cn(
                  "flex flex-col max-w-[85%] md:max-w-[75%]",
                  msg.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-5 text-[15px] leading-relaxed shadow-xl border",
                    msg.role === "ai" 
                      ? "bg-white/[0.03] border-white/10 text-slate-200 rounded-2xl rounded-tl-sm backdrop-blur-xl" 
                      : "bg-teal-500/10 border-teal-500/20 text-white rounded-2xl rounded-tr-sm backdrop-blur-xl"
                  )}>
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i !== msg.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>

                  {/* Sources (AI only) */}
                  {msg.sources && (
                    <div className="flex gap-2 mt-3 ml-2">
                      {msg.sources.map((source, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.05] text-[11px] font-medium text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-pointer">
                          <BookOpen className="w-3 h-3" />
                          {source}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl rounded-tl-sm backdrop-blur-xl flex items-center gap-2 shadow-xl">
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-2 h-2 rounded-full bg-cyan-400"></motion.div>
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 rounded-full bg-cyan-400"></motion.div>
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 rounded-full bg-cyan-400"></motion.div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Bottom Input Area ── */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent z-20">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          
          {/* Suggested Prompts */}
          {messages.length < 3 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 justify-center md:justify-start"
            >
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(undefined, prompt)}
                  className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white hover:border-cyan-500/30 transition-all flex items-center gap-2 group"
                >
                  {prompt}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </motion.div>
          )}

          {/* Input Box */}
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-[28px] blur-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center bg-[rgba(15,23,42,0.6)] backdrop-blur-2xl border border-white/10 rounded-3xl p-2 shadow-2xl focus-within:border-cyan-500/50 transition-colors">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask EcoSphere anything..."
                className="flex-1 bg-transparent text-white placeholder-slate-500 px-4 py-3 outline-none resize-none h-[52px] max-h-[150px] custom-scrollbar text-[15px]"
                rows={1}
              />
              <button
                type="submit"
                disabled={!query.trim() || isTyping}
                className="w-12 h-12 flex items-center justify-center shrink-0 rounded-2xl bg-white text-black hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all ml-2"
              >
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
}
