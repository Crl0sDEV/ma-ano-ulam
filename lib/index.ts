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