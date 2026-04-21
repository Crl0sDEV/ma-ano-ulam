"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
// DAGDAG DITO: CalendarDays
import { ChefHat, BookOpen, Clock, Flame, Heart, Copy, Check, Share2, Loader2, StopCircle, Volume2, Utensils, X, Trash2, CalendarDays } from "lucide-react";
import { clsx } from "clsx";
import { toPng } from "html-to-image";
import Link from "next/link"; // DAGDAG DITO: Next.js Link
import type { Recipe } from "@/types/index";

// Hooks
import { useFavorites } from "@/hooks/useFavorites";
import { useTTS } from "@/hooks/useTTS";

// Components
import { RecipeForm } from "@/components/RecipeForm";

export default function Home() {
  const recipeCardRef = useRef<HTMLDivElement>(null);
  
  // State
  const [ingredients, setIngredients] = useState("");
  const [mood, setMood] = useState("Kahit ano");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Custom Hooks
  const { favorites, showFavorites, setShowFavorites, toggleFavorite, deleteFavorite } = useFavorites();
  const { isSpeaking, handleSpeak, stopSpeak } = useTTS();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    stopSpeak();
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

      setRecipe({ ...data, id: Date.now().toString(), moodUsed: mood });
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("May hindi inaasahang error na nangyari.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!recipe) return;
    const text = `🍽️ ${recipe.dishName}\n\n"${recipe.momMessage}"\n\n🛒 Ingredients:\n${recipe.ingredientsList.join("\n")}\n\n🔥 Steps:\n${recipe.steps.join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!recipeCardRef.current || !recipe) return;
    setIsSharing(true);
    try {
      const dataUrl = await toPng(recipeCardRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        filter: (node) => {
          if (node.classList && node.classList.contains("no-print")) return false;
          return true;
        },
      });
      const link = document.createElement("a");
      link.download = `Mama-${recipe.dishName.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Naku anak, ayaw mapicturan ni Mama. Try mo manual screenshot.");
    } finally {
      setIsSharing(false);
    }
  };

  const isCurrentRecipeFavorited = recipe ? favorites.some((fav) => fav.dishName === recipe.dishName) : false;

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-800 p-6 flex flex-col items-center font-sans relative">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center mt-6 mb-8 relative">
        <button onClick={() => setShowFavorites(true)} className="absolute right-0 top-0 p-2 text-orange-800 hover:bg-orange-100 rounded-full transition-colors flex flex-col items-center gap-1">
          <div className="relative">
            <BookOpen size={24} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {favorites.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Kusina</span>
        </button>

        <div className="flex justify-center mb-4">
          <div className="bg-orange-500 p-4 rounded-full text-white shadow-xl shadow-orange-200 rotate-3">
            <ChefHat size={40} />
          </div>
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-orange-900 mb-2 font-hand">Ma, Anong Ulam?</h1>
        <p className="text-stone-500 mb-5">Sabihin mo kung anong laman ng ref, si Mama na bahala.</p>

        <div className="flex justify-center mb-2">
          <Link href="/planner" className="bg-orange-100 px-5 py-2 rounded-full text-sm font-bold text-orange-700 hover:bg-orange-200 transition-colors flex items-center gap-2 shadow-sm border border-orange-200 active:scale-95">
            <CalendarDays size={18} /> Try natin ang Weekly Planner!
          </Link>
        </div>
      </motion.div>

      <RecipeForm 
        ingredients={ingredients} setIngredients={setIngredients} 
        mood={mood} setMood={setMood} 
        loading={loading} error={error} onSubmit={handleSubmit} 
      />

      <div className="max-w-md w-full mt-8 pb-20">
        {/* Loading Skeleton */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100">
            <div className="bg-orange-50/50 p-6 space-y-3 animate-pulse"><div className="h-8 bg-orange-200 rounded w-3/4"></div></div>
            <div className="p-6 space-y-6 animate-pulse"><div className="h-32 bg-stone-100 rounded-xl"></div></div>
          </motion.div>
        )}

        <AnimatePresence>
          {recipe && !loading && (
            <motion.div ref={recipeCardRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100 relative">
              {/* Toolbar */}
              <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-stone-100 no-print">
                <button onClick={() => toggleFavorite(recipe)} className={clsx("p-2 rounded-full transition-all", isCurrentRecipeFavorited ? "text-red-500 bg-red-50" : "text-stone-400 hover:bg-stone-100")}>
                  <Heart size={18} className={isCurrentRecipeFavorited ? "fill-current" : ""} />
                </button>
                <button onClick={handleCopy} className="p-2 text-stone-400 hover:text-orange-600 hover:bg-stone-100 rounded-full">
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
                <button onClick={handleShare} disabled={isSharing} className="p-2 text-stone-400 hover:text-blue-600 hover:bg-stone-100 rounded-full">
                  {isSharing ? <Loader2 size={18} className="animate-spin text-blue-500" /> : <Share2 size={18} />}
                </button>
              </div>

              {/* Header */}
              <div className="bg-orange-50 p-6 border-b border-orange-100 relative">
                <h2 className="text-3xl font-bold text-orange-900 font-hand mb-2 pr-28">{recipe.dishName}</h2>
                <div className="inline-block px-3 py-1 bg-white/60 border border-orange-200 rounded-full text-xs font-bold text-orange-800 mb-4">{recipe.moodUsed || mood}</div>
                <div className="flex items-start gap-3">
                  <button onClick={() => handleSpeak(recipe)} className={clsx("shrink-0 p-2 rounded-full border no-print", isSpeaking ? "bg-orange-500 text-white animate-pulse" : "bg-orange-100 text-orange-700")}>
                    {isSpeaking ? <StopCircle size={18} /> : <Volume2 size={18} />}
                  </button>
                  <p className="text-orange-800 italic text-lg">&quot;{recipe.momMessage}&quot;</p>
                </div>
                <div className="flex gap-4 mt-6 text-sm text-orange-900 font-bold">
                  <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full"><Clock size={16} /> {recipe.cookingTime}</div>
                  <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full"><Flame size={16} /> {recipe.difficulty}</div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8">
                <div>
                  <h3 className="font-bold text-stone-900 mb-4 uppercase text-xs flex items-center gap-2"><Utensils size={14} className="text-orange-500" /> Mga Kailangan</h3>
                  <ul className="space-y-3 text-stone-600">
                    {recipe.ingredientsList.map((item, i) => (<li key={i} className="flex gap-3 p-2 bg-stone-50/50"><span className="text-orange-400">•</span>{item}</li>))}
                  </ul>
                </div>
                <div className="border-t border-stone-100 pt-6">
                  <h3 className="font-bold text-stone-900 mb-4 uppercase text-xs">Paano Lutuin</h3>
                  <div className="space-y-6">
                    {recipe.steps.map((step, i) => (<div key={i} className="flex gap-4"><div className="shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">{i + 1}</div><p className="text-stone-600 mt-1">{step}</p></div>))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAVORITES MODAL */}
      <AnimatePresence>
        {showFavorites && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFavorites(false)} className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl relative z-10 flex flex-col">
              <div className="p-6 border-b flex justify-between items-center bg-orange-50"><h2 className="text-2xl font-bold text-orange-900 font-hand flex items-center gap-2"><BookOpen size={24} /> My Kusina</h2><button onClick={() => setShowFavorites(false)} className="p-2 bg-white/50 rounded-full"><X size={20} /></button></div>
              <div className="overflow-y-auto p-4 flex-1">
                {favorites.length === 0 ? ( <div className="text-center py-10 text-stone-400">Wala pang laman ang cookbook mo.</div> ) : (
                  favorites.map((fav) => (
                    <div key={fav.id} onClick={() => { stopSpeak(); setRecipe(fav); setShowFavorites(false); }} className="p-4 border border-stone-100 rounded-xl mb-3 hover:shadow-md cursor-pointer flex justify-between">
                      <div><h3 className="font-bold text-stone-800">{fav.dishName}</h3><p className="text-xs text-stone-400">Saved: {fav.dateSaved}</p></div>
                      <button onClick={(e) => deleteFavorite(fav.id, e)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full"><Trash2 size={16} /></button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}