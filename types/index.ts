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
  day: string; 
  dishName: string;
  momMessage: string;
}

export interface WeeklyPlan {
  momIntro: string;
  meals: DailyMeal[];
}