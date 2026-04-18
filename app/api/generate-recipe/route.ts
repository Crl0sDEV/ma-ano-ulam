import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1. Initialize Ratelimiter sa labas ng handler para ma-reuse
// Setup: 3 requests per 1 minute (Pwede mo i-adjust itong "3" at "1 m" depende sa gusto mo)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export async function POST(req: Request) {
  try {
    // 2. Kunin ang IP Address ng User
    // Ginagamit natin ang headers kasi nasa serverless/edge environment tayo
    const ip = req.headers.get("x-forwarded-for") || 
               req.headers.get("x-real-ip") || 
               "127.0.0.1";

    // 3. I-check kung pasok pa sa limit
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      // Kung sumobra, ito isasagot ni Mama (429 Too Many Requests)
      return NextResponse.json(
        { error: 'Hinay-hinay lang anak! Masyado kang mabilis magtanong. Pahinga muna ng 1 minute.' },
        { status: 429 }
      );
    }

    // --- ORIGINAL LOGIC NATIN SA BABA ---
    const { ingredients, mood } = await req.json();

    if (!ingredients) {
      return NextResponse.json(
        { error: 'Anak, wala ka namang binigay na ingredients.' },
        { status: 400 }
      );
    }

    const prompt = `
      You are a caring but slightly naggy Filipino mother/tita. 
      The user (your "anak") has these ingredients: "${ingredients}".
      The user is currently in this mood/situation: "${mood || 'Kahit ano'}".
      
      Your task:
      1. Suggest ONE delicious Filipino recipe based on these ingredients (you can assume basic pantry staples like garlic, onion, oil, salt, pepper, soy sauce, vinegar are available).
      2. Speak in Taglish (Tagalog-English), warm, and conversational tone.
      3. ADJUST your recommendation and message based on the mood:
         - If "Petsa de Peligro": Suggest a budget-friendly meal. Message: "Tipid-tipid muna tayo anak."
         - If "Nagmamadali": Suggest a quick <15 mins recipe. Message: "O heto, mabilis lang to."
         - If "Masabaw": Suggest a soup-based dish. Message: "Mainit na sabaw para guminhawa pakiramdam mo."
         - If "Pulutan": Suggest something savory/fried. Message: "Inom na naman? O sige heto pulutan."
         - If "Healthy": Suggest something with veggies or less oil.
      
      You must respond in strictly VALID JSON format ONLY. Do not use Markdown formatting like \`\`\`json.
      
      JSON Structure:
      {
        "dishName": "Name of the Dish",
        "momMessage": "A short, witty, or caring comment related to the mood and ingredients.",
        "ingredientsList": ["List of ingredients with measurements"],
        "steps": ["Step 1...", "Step 2..."],
        "cookingTime": "Estimated time (e.g., 20 mins)",
        "difficulty": "Easy/Medium/Hard"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const recipe = JSON.parse(cleanText);

    return NextResponse.json(recipe);

  } catch (error) {
    console.error('Error ni Mama:', error);
    return NextResponse.json(
      { error: 'Pasensya na anak, sumakit ulo ni Mama. Try mo ulit maya-maya.' },
      { status: 500 }
    );
  }
}