"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChefHat, Clock, Flame, Utensils, Copy, Check, Heart, BookOpen, Trash2, X, Volume2, StopCircle, Share2 } from "lucide-react";
import { clsx } from "clsx";
import { toPng } from "html-to-image";
import type { Recipe } from "@/lib/index";

const MOODS = [
  { id: "Kahit ano", label: "Kahit ano" },
  { id: "Petsa de Peligro", label: "Petsa de Peligro" },
  { id: "Nagmamadali", label: "Nagmamadali" },
  { id: "Masabaw", label: "Masabaw" },
  { id: "Pulutan", label: "Pulutan" },
];

export default function Home() {
  const recipeCardRef = useRef<HTMLDivElement>(null);

  const [ingredients, setIngredients] = useState("");
  const [mood, setMood] = useState("Kahit ano");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mama-favorites");
    if (saved) setFavorites(JSON.parse(saved));
    
    const loadVoices = () => { window.speechSynthesis.getVoices(); };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
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

      setRecipe({
        ...data,
        id: Date.now().toString(),
        moodUsed: mood
      });
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

  // --- 📸 FIX: GAMIT ANG HTML-TO-IMAGE ---
  const handleShare = async () => {
    if (!recipeCardRef.current || !recipe) return;
    setIsSharing(true);

    try {
      // Gumamit ng toPng galing sa html-to-image
      const dataUrl = await toPng(recipeCardRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff', // Siguraduhin puti background
        // Dito natin ifi-filter para matanggal ang buttons sa picture
        filter: (node) => {
          // I-check kung ang element ay may class na 'no-print'
          const exclusionClasses = ['no-print'];
          if (node.classList) {
             for (const cls of exclusionClasses) {
               if (node.classList.contains(cls)) return false; // Exclude this node
             }
          }
          return true; // Include other nodes
        },
      });

      const link = document.createElement("a");
      link.download = `Mama-${recipe.dishName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      
    } catch (err) {
      console.error("Sharing failed:", err);
      alert("Naku anak, ayaw mapicturan ni Mama. Try mo manual screenshot.");
    } finally {
      setIsSharing(false);
    }
  };
  // ---------------------------------

  const toggleFavorite = (currentRecipe: Recipe) => {
    const isFavorited = favorites.some((fav) => fav.dishName === currentRecipe.dishName);
    let newFavorites;
    if (isFavorited) {
      newFavorites = favorites.filter((fav) => fav.dishName !== currentRecipe.dishName);
    } else {
      const recipeToSave = { ...currentRecipe, dateSaved: new Date().toLocaleDateString() };
      newFavorites = [recipeToSave, ...favorites];
    }
    setFavorites(newFavorites);
    localStorage.setItem("mama-favorites", JSON.stringify(newFavorites));
  };

  const deleteFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = favorites.filter((fav) => fav.id !== id);
    setFavorites(newFavorites);
    localStorage.setItem("mama-favorites", JSON.stringify(newFavorites));
  };

  const handleSpeak = () => {
    if (!recipe) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `Anak! Ang ulam natin ay ${recipe.dishName}. ${recipe.momMessage}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('fil-PH')) || 
                           voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) ||
                           voices.find(v => v.lang.includes('en-US'));
    if (preferredVoice) utterance.voice = preferredVoice;

    let targetRate = 1.0; let targetPitch = 1.1;
    switch (recipe.moodUsed) {
      case "Nagmamadali": targetRate = 1.4; targetPitch = 1.3; break;
      case "Masabaw": targetRate = 0.85; targetPitch = 0.9; break;
      case "Petsa de Peligro": targetRate = 0.95; targetPitch = 1.0; break;
      case "Pulutan": targetRate = 1.1; targetPitch = 1.1; break;
      default: targetRate = 1.05; targetPitch = 1.2;
    }

    utterance.rate = targetRate; utterance.pitch = targetPitch; utterance.volume = 1;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const isCurrentRecipeFavorited = recipe ? favorites.some(fav => fav.dishName === recipe.dishName) : false;

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-800 p-6 flex flex-col items-center font-sans relative">
      
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center mt-6 mb-8 relative">
        <button onClick={() => setShowFavorites(true)} className="absolute right-0 top-0 p-2 text-orange-800 hover:bg-orange-100 rounded-full transition-colors flex flex-col items-center gap-1" title="My Kusina">
          <div className="relative">
            <BookOpen size={24} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{favorites.length}</span>
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
        <p className="text-stone-500">Sabihin mo kung anong laman ng ref, si Mama na bahala.</p>
      </motion.div>

      {/* INPUT FORM */}
      <div className="max-w-md w-full relative z-10">
        <form onSubmit={handleSubmit} className="relative space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 block">Anong mood mo ngayon?</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button key={m.id} type="button" onClick={() => setMood(m.id)} className={clsx("px-3 py-1.5 rounded-full text-sm font-medium border transition-all", mood === m.id ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm" : "border-stone-200 bg-white text-stone-500 hover:border-orange-300 hover:text-orange-600")}>{m.label}</button>
              ))}
            </div>
          </div>
          <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="Halimbawa: Itlog, kamatis, leftover na kanin..." className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:border-orange-500 focus:ring-0 outline-none resize-none text-lg transition-all placeholder:text-stone-400" rows={3} />
          <button type="submit" disabled={loading || !ingredients} className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 active:scale-95">
            {loading ? <><Loader2 className="animate-spin" /> Wait lang anak...</> : "Magluto na Tayo!"}
          </button>
        </form>
        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-center text-sm">{error}</motion.div>}
      </div>

      {/* RESULT AREA */}
      <div className="max-w-md w-full mt-8 pb-20">
        {loading && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100">
             <div className="bg-orange-50/50 p-6 space-y-3 animate-pulse">
               <div className="h-8 bg-orange-200 rounded w-3/4"></div>
               <div className="h-4 bg-orange-100 rounded w-1/2"></div>
             </div>
             <div className="p-6 space-y-6 animate-pulse"><div className="space-y-2"><div className="h-4 bg-stone-100 rounded w-full"></div><div className="h-4 bg-stone-100 rounded w-5/6"></div><div className="h-4 bg-stone-100 rounded w-4/6"></div></div><div className="h-32 bg-stone-100 rounded-xl"></div></div>
           </motion.div>
        )}

        <AnimatePresence>
          {recipe && !loading && (
            <motion.div
              ref={recipeCardRef}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100 relative group"
            >
              {/* NOTE: Pinalitan ko yung 'data-html2canvas-ignore' ng class na 'no-print'.
                 Ito ang hahanapin ng filter natin para hindi isama sa picture.
              */}
              <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-stone-100 no-print">
                 <button 
                  onClick={() => toggleFavorite(recipe)}
                  className={clsx("p-2 rounded-full transition-all active:scale-90", isCurrentRecipeFavorited ? "text-red-500 bg-red-50" : "text-stone-400 hover:text-red-500 hover:bg-stone-100")}
                  title="Save to Kusina"
                >
                  <Heart size={18} className={isCurrentRecipeFavorited ? "fill-current" : ""} />
                </button>

                <button 
                  onClick={handleCopy}
                  className="p-2 text-stone-400 hover:text-orange-600 hover:bg-stone-100 rounded-full transition-all"
                  title="Copy Text"
                >
                  {copied ? <Check size={18} className="text-green-500"/> : <Copy size={18} />}
                </button>
                
                <button 
                  onClick={handleShare}
                  disabled={isSharing}
                  className="p-2 text-stone-400 hover:text-blue-600 hover:bg-stone-100 rounded-full transition-all relative"
                  title="Download Image"
                >
                  {isSharing ? <Loader2 size={18} className="animate-spin text-blue-500"/> : <Share2 size={18} />}
                </button>
              </div>

              <div className="bg-orange-50 p-6 border-b border-orange-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-200 rounded-full opacity-20 blur-2xl"></div>
                <h2 className="text-3xl font-bold text-orange-900 leading-tight font-hand mb-2 pr-28">{recipe.dishName}</h2>
                <div className="inline-block px-3 py-1 bg-white/60 border border-orange-200 rounded-full text-xs font-bold text-orange-800 mb-4">
                  {recipe.moodUsed || mood}
                </div>
                
                {/* Nilagyan ko rin ng 'no-print' ang speaker button para di kasama sa picture */}
                <div className="flex items-start gap-3">
                   <button onClick={handleSpeak} className={clsx("shrink-0 p-2 rounded-full transition-all border no-print", isSpeaking ? "bg-orange-500 text-white border-orange-600 animate-pulse" : "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200")} title={isSpeaking ? "Stop Speaking" : "Listen to Mama"}>
                     {isSpeaking ? <StopCircle size={18} /> : <Volume2 size={18} />}
                   </button>
                   <p className="text-orange-800 italic text-lg leading-relaxed">&quot;{recipe.momMessage}&quot;</p>
                </div>

                <div className="flex gap-4 mt-6 text-sm text-orange-900 font-bold">
                  <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full"><Clock size={16} /> {recipe.cookingTime}</div>
                  <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full"><Flame size={16} /> {recipe.difficulty}</div>
                </div>
              </div>

              <div className="p-6 space-y-8">
                <div>
                  <h3 className="font-bold text-stone-900 mb-4 uppercase text-xs tracking-wider flex items-center gap-2"><Utensils size={14} className="text-orange-500"/> Mga Kailangan</h3>
                  <ul className="space-y-3 text-stone-600">
                    {recipe.ingredientsList.map((item, index) => (<li key={index} className="flex items-start gap-3 p-2 rounded-lg bg-stone-50/50"><span className="text-orange-400 mt-1">•</span><span className="leading-snug">{item}</span></li>))}
                  </ul>
                </div>
                <div className="border-t border-stone-100 pt-6">
                  <h3 className="font-bold text-stone-900 mb-4 uppercase text-xs tracking-wider">Paano Lutuin</h3>
                  <div className="space-y-6">
                    {recipe.steps.map((step, index) => (<div key={index} className="flex gap-4"><div className="shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-bold shadow-sm border border-orange-200">{index + 1}</div><p className="text-stone-600 leading-relaxed mt-1">{step}</p></div>))}
                  </div>
                </div>
                <div className="text-center text-stone-400 text-xs font-medium pt-4 border-t">Generated by &quot;Ma, Anong Ulam?&quot; AI</div>
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl relative z-10 flex flex-col">
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-orange-50"><h2 className="text-2xl font-bold text-orange-900 font-hand flex items-center gap-2"><BookOpen size={24}/> My Kusina</h2><button onClick={() => setShowFavorites(false)} className="p-2 bg-white/50 hover:bg-white rounded-full text-stone-500 transition-all"><X size={20} /></button></div>
              <div className="overflow-y-auto p-4 space-y-3 flex-1">
                {favorites.length === 0 ? (<div className="text-center py-10 text-stone-400"><p className="mb-2">Wala pang laman ang cookbook mo.</p><p className="text-sm">Mag-heart ka ng recipe para ma-save dito!</p></div>) : (
                  favorites.map((fav) => (
                    <div key={fav.id} onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); setRecipe(fav); setShowFavorites(false); }} className="p-4 rounded-xl border border-stone-100 bg-white hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group flex justify-between items-start">
                      <div><h3 className="font-bold text-stone-800 group-hover:text-orange-700 transition-colors">{fav.dishName}</h3><p className="text-xs text-stone-400 mt-1">Saved: {fav.dateSaved}</p><span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full mt-2 inline-block">{fav.moodUsed}</span></div>
                      <button onClick={(e) => deleteFavorite(fav.id, e)} className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><Trash2 size={16} /></button>
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