import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are AccessCheck AI, an accessibility-focused text transformation assistant.
Return ONLY valid JSON with exactly these keys:
{
  "readabilityScore": 1,
  "scoreExplanation": "One short sentence explaining the score.",
  "dyslexiaFriendly": "Plain text with short paragraphs and simple language. Use **bold** around important words.",
  "screenReaderScript": "A natural, conversational version that reads smoothly aloud."
}
Rules:
- readabilityScore must be an integer from 1 to 10. A higher score means the original text is easier to read.
- Keep all important facts, dates, names, amounts, deadlines, requirements and contact details accurate.
- Never invent missing information.
- Simplify sentence structure and explain difficult terms in plain language.
- The dyslexia-friendly version must use short paragraphs and clear wording.
- The screen-reader script must be natural when spoken; avoid visual-only references such as "see below".
- If the text is unclear, preserve the uncertainty instead of guessing.`;

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key is missing. Add GEMINI_API_KEY in your Vercel environment variables." });
  }

  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (text.length < 20) {
    return res.status(400).json({ error: "Please enter at least 20 characters so the text can be assessed." });
  }
  if (text.length > 15000) {
    return res.status(413).json({ error: "Please keep the text under 15,000 characters." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.25
      }
    });

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      "\n\nTransform this user-provided text:\n",
      text
    ]);

    const raw = result.response.text();
    const cleanedRaw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleanedRaw);

    const score = Number(parsed.readabilityScore);
    if (!Number.isInteger(score) || score < 1 || score > 10 ||
        typeof parsed.dyslexiaFriendly !== "string" ||
        typeof parsed.screenReaderScript !== "string" ||
        typeof parsed.scoreExplanation !== "string") {
      throw new Error("The AI returned an unexpected response format. Please try again.");
    }

    return res.status(200).json({
      readabilityScore: score,
      scoreExplanation: parsed.scoreExplanation.slice(0, 300),
      dyslexiaFriendly: parsed.dyslexiaFriendly,
      screenReaderScript: parsed.screenReaderScript
    });
  } catch (error) {
    console.error("AccessCheck AI error:", error);
    return res.status(502).json({
      error: error.message?.includes("unexpected response")
        ? error.message
        : `Error details: ${error.message || "Check your API key and try again."}`
    });
  }
}
