"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChefHat, Clock, Flame, Utensils, Copy, Check } from "lucide-react";
import { clsx } from "clsx";

interface Recipe {
  dishName: string;
  momMessage: string;
  ingredientsList: string[];
  steps: string[];
  cookingTime: string;
  difficulty: string;
}

const MOODS = [
  { id: "Kahit ano", label: "Kahit ano" },
  { id: "Petsa de Peligro", label: "Petsa de Peligro" },
  { id: "Nagmamadali", label: "Nagmamadali" },
  { id: "Masabaw", label: "Masabaw" },
  { id: "Pulutan", label: "Pulutan" },
];

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [mood, setMood] = useState("Kahit ano");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    setLoading(true);
    setError("");
    setRecipe(null);
    setCopied(false);

    try {
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, mood }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Naku, may problema sa kusina.");

      setRecipe(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("May hindi inaasahang error na nangyari.");
    } finally {
      setLoading(false);
    }
  };

  // Function para mag-copy sa clipboard
  const handleCopy = () => {
    if (!recipe) return;
    const text = `🍽️ ${recipe.dishName}\n\n"${recipe.momMessage}"\n\n🛒 Ingredients:\n${recipe.ingredientsList.join("\n")}\n\n🔥 Steps:\n${recipe.steps.join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-800 p-6 flex flex-col items-center font-sans">
      
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center mt-10 mb-8"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-orange-500 p-4 rounded-full text-white shadow-xl shadow-orange-200 rotate-3">
            <ChefHat size={40} />
          </div>
        </div>
        {/* GAMITIN ANG NEW FONT DITO */}
        <h1 className="text-5xl font-bold tracking-tight text-orange-900 mb-2 font-hand">
          Ma, Anong Ulam?
        </h1>
        <p className="text-stone-500">
          Sabihin mo kung anong laman ng ref, si Mama na bahala.
        </p>
      </motion.div>

      {/* INPUT FORM */}
      <div className="max-w-md w-full relative z-10">
        <form onSubmit={handleSubmit} className="relative space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
          
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 block">
              Anong mood mo ngayon?
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                    mood === m.id 
                      ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm" 
                      : "border-stone-200 bg-white text-stone-500 hover:border-orange-300 hover:text-orange-600"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Halimbawa: Itlog, kamatis, leftover na kanin..."
            className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:border-orange-500 focus:ring-0 outline-none resize-none text-lg transition-all placeholder:text-stone-400"
            rows={3}
          />
          
          <button
            type="submit"
            disabled={loading || !ingredients}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Wait lang anak...
              </>
            ) : (
              "Magluto na Tayo!"
            )}
          </button>
        </form>

        {/* ERROR */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-center text-sm">
            {error}
          </motion.div>
        )}
      </div>

      {/* RESULT AREA */}
      <div className="max-w-md w-full mt-8 pb-20">
        
        {/* SKELETON LOADER (Display habang loading) */}
        {loading && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100"
           >
             <div className="bg-orange-50/50 p-6 space-y-3 animate-pulse">
               <div className="h-8 bg-orange-200 rounded w-3/4"></div>
               <div className="h-4 bg-orange-100 rounded w-1/2"></div>
             </div>
             <div className="p-6 space-y-6 animate-pulse">
               <div className="space-y-2">
                 <div className="h-4 bg-stone-100 rounded w-full"></div>
                 <div className="h-4 bg-stone-100 rounded w-5/6"></div>
                 <div className="h-4 bg-stone-100 rounded w-4/6"></div>
               </div>
               <div className="h-32 bg-stone-100 rounded-xl"></div>
             </div>
           </motion.div>
        )}

        {/* RECIPE CARD */}
        <AnimatePresence>
          {recipe && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100 relative group"
            >
              {/* Copy Button */}
              <button 
                onClick={handleCopy}
                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white backdrop-blur-sm rounded-full text-orange-700 transition-all border border-orange-100 hover:shadow-md z-10"
                title="Copy Recipe"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>

              <div className="bg-orange-50 p-6 border-b border-orange-100 relative overflow-hidden">
                {/* Decorative Pattern Background */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-200 rounded-full opacity-20 blur-2xl"></div>
                
                <h2 className="text-3xl font-bold text-orange-900 leading-tight font-hand mb-2">{recipe.dishName}</h2>
                <div className="inline-block px-3 py-1 bg-white/60 border border-orange-200 rounded-full text-xs font-bold text-orange-800 mb-4">
                  {mood}
                </div>
                <p className="text-orange-800 italic text-lg leading-relaxed">&quot;{recipe.momMessage}&quot;</p>
                
                <div className="flex gap-4 mt-6 text-sm text-orange-900 font-bold">
                  <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full">
                    <Clock size={16} /> {recipe.cookingTime}
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full">
                    <Flame size={16} /> {recipe.difficulty}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-8">
                <div>
                  <h3 className="font-bold text-stone-900 mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
                    <Utensils size={14} className="text-orange-500"/> Mga Kailangan
                  </h3>
                  <ul className="space-y-3 text-stone-600">
                    {recipe.ingredientsList.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors">
                        <span className="text-orange-400 mt-1">•</span> 
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-stone-100 pt-6">
                  <h3 className="font-bold text-stone-900 mb-4 uppercase text-xs tracking-wider">Paano Lutuin</h3>
                  <div className="space-y-6">
                    {recipe.steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-bold shadow-sm border border-orange-200">
                          {index + 1}
                        </div>
                        <p className="text-stone-600 leading-relaxed mt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-stone-50 p-4 text-center text-stone-400 text-xs font-medium">
                Generated by &quot;Ma, Anong Ulam?&quot; AI
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}