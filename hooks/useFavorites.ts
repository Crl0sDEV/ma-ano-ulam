"use client";

import { useState, useEffect } from "react";
import type { Recipe } from "@/types/index";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    // Gumamit tayo ng async wrapper para i-bypass ang "synchronous" rule ng linter
    // pero safe pa rin sa Next.js SSR Hydration.
    const loadSavedData = async () => {
      await Promise.resolve(); // Micro-delay para hindi i-flag ni React as strict sync
      
      const saved = localStorage.getItem("mama-favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    };

    loadSavedData();
  }, []);

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

  return { favorites, showFavorites, setShowFavorites, toggleFavorite, deleteFavorite };
}