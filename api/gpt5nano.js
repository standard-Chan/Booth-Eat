// <root>/api/gpt5nano.js (ESM)
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  let raw = ""; for await (const chunk of req) raw += chunk;
  let data = {}; try { data = JSON.parse(raw || "{}"); } catch {}

  const { prompt } = data;
  if (!prompt || typeof prompt !== "string") return res.status(400).json({ message: "prompt는 문자열이어야 합니다." });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const r = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      reasoning_effort: "minimal",
      verbosity: "low",
    });
    res.status(200).json({ reply: r.choices?.[0]?.message?.content ?? "" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}
