"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, CalendarDays, Loader2, Share2, ArrowLeft, Utensils } from "lucide-react";
import { clsx } from "clsx";
import { toPng } from "html-to-image";
import Link from "next/link";
import type { WeeklyPlan } from "@/types/index";

const BUDGETS = [
  { id: "Petsa de Peligro", label: "Petsa de Peligro" },
  { id: "Sakto lang", label: "Sakto lang" },
  { id: "May budget", label: "May budget" },
];

export default function Planner() {
  const plannerRef = useRef<HTMLDivElement>(null);

  const [ingredients, setIngredients] = useState("");
  const [budget, setBudget] = useState("Sakto lang");
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const res = await fetch("/api/generate-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, budget }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Naku, may problema sa kusina.");

      setPlan(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("May hindi inaasahang error na nangyari.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!plannerRef.current || !plan) return;
    setIsSharing(true);

    try {
      const dataUrl = await toPng(plannerRef.current, {
        cacheBust: true,
        backgroundColor: "#fafaf9", // stone-50 background para malinis
        filter: (node) => {
          if (node.classList && node.classList.contains("no-print")) return false;
          return true;
        },
      });

      const link = document.createElement("a");
      link.download = `Mama-Weekly-Plan.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Sharing failed:", err);
      alert("Naku anak, ayaw mapicturan ni Mama. Try mo manual screenshot.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-800 p-6 flex flex-col items-center font-sans relative">
      
      {/* NAVIGATION */}
      <div className="w-full max-w-4xl flex justify-start mb-4">
        <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-orange-600 transition-colors text-sm font-bold uppercase tracking-wider">
          <ArrowLeft size={16} /> Balik sa Daily Ulam
        </Link>
      </div>

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full text-center mb-8 relative">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-500 p-4 rounded-full text-white shadow-xl shadow-orange-200 rotate-3">
            <CalendarDays size={40} />
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-orange-900 mb-2 font-hand">Weekly Planner</h1>
        <p className="text-stone-500">Ibigay ang budget at ingredients, si Mama na bahala sa 7 araw mo.</p>
      </motion.div>

      {/* INPUT FORM */}
      <div className="max-w-xl w-full relative z-10 mb-8">
        <form onSubmit={handleSubmit} className="relative space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 block">Kumusta ang budget natin?</label>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudget(b.id)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                    budget === b.id ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm" : "border-stone-200 bg-white text-stone-500 hover:border-orange-300 hover:text-orange-600"
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Halimbawa: Manok, patatas, repolyo, itlog..."
            className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:border-orange-500 focus:ring-0 outline-none resize-none text-lg transition-all placeholder:text-stone-400"
            rows={3}
          />
          
          <button type="submit" disabled={loading || !ingredients} className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 active:scale-95">
            {loading ? <><Loader2 className="animate-spin" /> Nag-iisip si Mama...</> : "Iplano ang Isang Linggo!"}
          </button>
        </form>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-center text-sm">
            {error}
          </motion.div>
        )}
      </div>

      {/* PLANNER RESULT AREA */}
      <div className="max-w-4xl w-full pb-20">
        
        {loading && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100 p-8 flex flex-col items-center justify-center space-y-4">
             <Loader2 size={40} className="animate-spin text-orange-500" />
             <p className="text-stone-500 animate-pulse">Kinakalkula ni Mama ang budget mo mula Lunes hanggang Linggo...</p>
           </motion.div>
        )}

        <AnimatePresence>
          {plan && !loading && (
            <motion.div
              ref={plannerRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100 relative"
            >
              {/* Share Button (no-print) */}
              <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-stone-100 no-print">
                <button 
                  onClick={handleShare}
                  disabled={isSharing}
                  className="p-2 text-stone-500 hover:text-blue-600 hover:bg-stone-100 rounded-full transition-all relative"
                  title="Download Weekly Plan"
                >
                  {isSharing ? <Loader2 size={18} className="animate-spin text-blue-500"/> : <Share2 size={18} />}
                </button>
              </div>

              {/* Intro Section */}
              <div className="bg-orange-50 p-8 border-b border-orange-100 relative overflow-hidden">
                 <div className="absolute top-0 left-0 -mt-8 -ml-8 w-32 h-32 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
                 <div className="flex items-center gap-3 mb-4">
                    <ChefHat className="text-orange-600" size={28} />
                    <h2 className="text-3xl font-bold text-orange-900 font-hand">Ang Menu Natin Ngayong Linggo</h2>
                 </div>
                 <p className="text-orange-800 italic text-lg leading-relaxed">&quot;{plan.momIntro}&quot;</p>
                 <div className="mt-4 inline-block px-3 py-1 bg-white/60 border border-orange-200 rounded-full text-xs font-bold text-orange-800">
                  Budget: {budget}
                </div>
              </div>

              {/* The 7-Day Grid */}
              <div className="p-6 sm:p-8 bg-stone-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plan.meals.map((meal, index) => (
                    <div key={index} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      {/* Day Label */}
                      <div className="absolute top-0 right-0 bg-orange-100 text-orange-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                        Day {index + 1}
                      </div>
                      
                      <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-1">{meal.day}</h3>
                      <h4 className="text-xl font-bold text-stone-800 mb-3 group-hover:text-orange-600 transition-colors">{meal.dishName}</h4>
                      
                      <div className="flex gap-2 items-start mt-4 pt-4 border-t border-stone-100">
                        <Utensils size={14} className="text-orange-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-stone-600 italic leading-snug">&quot;{meal.momMessage}&quot;</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Watermark sa picture */}
              <div className="bg-white text-center text-stone-400 text-xs font-medium py-4 border-t border-stone-100">
                Generated by &quot;Ma, Anong Ulam?&quot; AI Planner
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}