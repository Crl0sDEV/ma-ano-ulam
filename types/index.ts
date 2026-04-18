export interface Recipe {
    id: string;
    dishName: string;
    momMessage: string;
    ingredientsList: string[];
    steps: string[];
    cookingTime: string;
    difficulty: string;
    moodUsed?: string;
    dateSaved?: string;
  }
export interface DailyMeal {
  day: string;          // Lunes, Martes, etc.
  dishName: string;     // Pangalan ng ulam
  momMessage: string;   // Short comment ni Mama per day
}

export interface WeeklyPlan {
  momIntro: string;     // General na sermon/lambing ni Mama para sa buong linggo
  meals: DailyMeal[];   // Array ng 7 days
}