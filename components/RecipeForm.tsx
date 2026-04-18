import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

const MOODS = [
  { id: "Kahit ano", label: "Kahit ano" },
  { id: "Petsa de Peligro", label: "Petsa de Peligro" },
  { id: "Nagmamadali", label: "Nagmamadali" },
  { id: "Masabaw", label: "Masabaw" },
  { id: "Pulutan", label: "Pulutan" },
];

interface Props {
  ingredients: string;
  setIngredients: (val: string) => void;
  mood: string;
  setMood: (val: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function RecipeForm({ ingredients, setIngredients, mood, setMood, loading, error, onSubmit }: Props) {
  return (
    <div className="max-w-md w-full relative z-10">
      <form onSubmit={onSubmit} className="relative space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
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
          {loading ? <><Loader2 className="animate-spin" /> Wait lang anak...</> : "Magluto na Tayo!"}
        </button>
      </form>
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-center text-sm">
          {error}
        </motion.div>
      )}
    </div>
  );
}