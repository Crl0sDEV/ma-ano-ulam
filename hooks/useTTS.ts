import { useState, useEffect } from "react";
import type { Recipe } from "@/types/index";

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => window.speechSynthesis.cancel();
  }, []);

  const handleSpeak = (recipe: Recipe | null) => {
    if (!recipe) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `Anak! Ang ulam natin ay ${recipe.dishName}. ${recipe.momMessage}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.includes("fil-PH")) ||
      voices.find((v) => v.lang.includes("en-US") && v.name.includes("Google")) ||
      voices.find((v) => v.lang.includes("en-US"));
    
    if (preferredVoice) utterance.voice = preferredVoice;

    let targetRate = 1.0;
    let targetPitch = 1.1;
    switch (recipe.moodUsed) {
      case "Nagmamadali": targetRate = 1.4; targetPitch = 1.3; break;
      case "Masabaw": targetRate = 0.85; targetPitch = 0.9; break;
      case "Petsa de Peligro": targetRate = 0.95; targetPitch = 1.0; break;
      case "Pulutan": targetRate = 1.1; targetPitch = 1.1; break;
      default: targetRate = 1.05; targetPitch = 1.2;
    }

    utterance.rate = targetRate;
    utterance.pitch = targetPitch;
    utterance.volume = 1;
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeak = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { isSpeaking, handleSpeak, stopSpeak };
}