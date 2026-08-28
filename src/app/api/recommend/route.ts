import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/products";

export const runtime = "nodejs";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// A trimmed view of the catalog — just enough for the model to match
// concerns/types without burning tokens on long descriptions.
const catalogForPrompt = products.map((p) => ({
  slug: p.slug,
  brand: p.brand,
  name: p.name,
  type: p.type,
  concerns: p.concerns,
  price: p.price,
  summary: p.desc,
}));

const responseSchema = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "STRING",
      description:
        "One short, warm sentence acknowledging the user's concern before the recommendations.",
    },
    recommendations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          slug: {
            type: "STRING",
            description: "Must exactly match a slug from the provided catalog.",
          },
          reason: {
            type: "STRING",
            description: "One or two sentences on why this product fits their concern.",
          },
        },
        required: ["slug", "reason"],
      },
    },
  },
  required: ["summary", "recommendations"],
};

const SYSTEM_INSTRUCTION = `You are the SkinWise shopping assistant, helping customers of a dermatology-focused skincare store find suitable products.

Rules:
- Only recommend products from the catalog JSON provided in the user message. Never invent a product or a slug that isn't in that list.
- Recommend 2 to 4 products that best match the customer's described concern.
- Prefer products whose "concerns" array matches what the customer describes, then consider "type" for a well-rounded routine (e.g. a cleanser plus a treatment, not five of the same type).
- Keep "reason" specific to their situation, not generic marketing copy.
- This is general product guidance, not medical advice. If the customer describes something that sounds severe, unusual, or potentially serious (e.g. rapidly spreading rash, signs of infection, suspicious moles, severe pain), say so plainly in the summary and recommend they see a dermatologist in person, in addition to or instead of product suggestions.
- Respond ONLY with JSON matching the given schema.`;

const RETRYABLE_STATUSES = new Set([429, 503]);
const MAX_ATTEMPTS = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Google's free tier intermittently returns 429/503 "model overloaded"
// under load — usually resolved by a short retry, so we absorb that here
// instead of surfacing it to the customer on the first hiccup.
async function callGeminiWithRetry(
  apiKey: string,
  userPrompt: string
): Promise<{ res: Response | null; errText: string }> {
  let lastErrText = "";
  let lastRes: Response | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.4,
          },
        }),
      }
    );

    if (res.ok) return { res, errText: "" };

    lastRes = res;
    lastErrText = await res.text();

    if (!RETRYABLE_STATUSES.has(res.status) || attempt === MAX_ATTEMPTS) {
      return { res, errText: lastErrText };
    }

    await sleep(attempt * 700); // 700ms, then 1400ms
  }

  return { res: lastRes, errText: lastErrText };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "The recommendation agent isn't configured yet — GEMINI_API_KEY is missing on the server.",
      },
      { status: 503 }
    );
  }

  let message: string;
  try {
    const body = await req.json();
    message = typeof body?.message === "string" ? body.message.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: "Please describe your skin concern first." }, { status: 400 });
  }
  if (message.length > 1000) {
    return NextResponse.json({ error: "That's a bit long — try summarizing in a sentence or two." }, { status: 400 });
  }

  const userPrompt = `Customer's description of their concern:\n"""${message}"""\n\nProduct catalog (JSON):\n${JSON.stringify(catalogForPrompt)}`;

  try {
    const { res, errText } = await callGeminiWithRetry(apiKey, userPrompt);

    if (!res || !res.ok) {
      console.error("Gemini API error:", res?.status, errText);
      // Google's free tier occasionally reports the model as overloaded
      // (429/503) under load — distinct from a real outage or misconfig.
      const overloaded = res?.status === 429 || res?.status === 503;
      return NextResponse.json(
        {
          error: overloaded
            ? "SkinWise's AI agent is getting a lot of requests right now. Please try again in a few seconds."
            : "The recommendation agent is temporarily unavailable. Please try again shortly.",
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json(
        { error: "The agent didn't return a usable response. Please try rephrasing." },
        { status: 502 }
      );
    }

    let parsed: { summary: string; recommendations: { slug: string; reason: string }[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "The agent's response couldn't be read. Please try again." },
        { status: 502 }
      );
    }

    // Never trust the model's slugs blindly — drop anything that isn't a
    // real product so the UI can't render a broken "Add to cart" card.
    const validSlugs = new Set(products.map((p) => p.slug));
    const recommendations = (parsed.recommendations || []).filter((r) =>
      validSlugs.has(r.slug)
    );

    return NextResponse.json({
      summary: parsed.summary || "",
      recommendations,
    });
  } catch (err) {
    console.error("Recommendation agent error:", err);
    return NextResponse.json(
      { error: "Something went wrong reaching the recommendation agent." },
      { status: 500 }
    );
  }
}
