import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Limit: 2 requests per minute para sa planner (kasi mas mabigat itong task na 'to)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "1 m"),
  analytics: true,
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || 
               req.headers.get("x-real-ip") || 
               "127.0.0.1";

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Hinay-hinay lang anak! Nagpaplano pa si Mama para sa isang linggo. Wait ka 1 minute.' },
        { status: 429 }
      );
    }

    const { ingredients, budget } = await req.json();

    if (!ingredients) {
      return NextResponse.json(
        { error: 'Anak, pano ako magpaplano kung di ko alam laman ng ref natin?' },
        { status: 400 }
      );
    }

    const prompt = `
      You are a caring, budget-conscious Filipino mother. 
      Your child has these ingredients available: "${ingredients}".
      Their budget situation is: "${budget || 'Sakto lang'}".
      
      Task: Create a 7-day meal plan (Lunch or Dinner main dish) using the ingredients provided, supplementing with basic Filipino pantry staples (garlic, onion, oil, soy sauce, vinegar, rice). Ensure variety across the 7 days.
      
      Speak in warm, Taglish (Tagalog-English) tone.
      
      Respond in strictly VALID JSON format ONLY. Do not use markdown backticks.
      
      JSON Structure:
      {
        "momIntro": "A caring overview message about the week's meal plan (e.g., 'Oh heto na anak, inayos ko na ang ulam mo mula Lunes hanggang Linggo para di ka na mahirapan mag isip.')",
        "meals": [
          {
            "day": "Lunes",
            "dishName": "Name of Dish",
            "momMessage": "Short reason why this is good for Monday"
          },
          // ... continue for Martes, Miyerkules, Huwebes, Biyernes, Sabado, Linggo
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const plannerData = JSON.parse(cleanText);

    return NextResponse.json(plannerData);

  } catch (error) {
    console.error('Error ni Mama sa Planner:', error);
    return NextResponse.json(
      { error: 'Nahilo si Mama sa pagpaplano anak. Try mo ulit.' },
      { status: 500 }
    );
  }
}