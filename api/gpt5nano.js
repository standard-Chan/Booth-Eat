// /api/gpt5nano.js  (ESM)
import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed", ok: false });
    }

    // Vercel Node 함수: 안전하게 바디 직접 파싱
    let raw = "";
    for await (const chunk of req) raw += chunk;
    let data = {};
    try { data = JSON.parse(raw || "{}"); } catch { /* ignore */ }

    const prompt = data?.prompt;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ message: "prompt는 문자열이어야 합니다.", ok: false });
    }

    const hasKey = !!process.env.OPENAI_API_KEY;
    if (!hasKey) {
      return res.status(500).json({ message: "OPENAI_API_KEY 미설정", ok: false });
    }

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

    const reply = r.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ ok: true, reply });
  } catch (err) {
    // 🔎 에러를 그대로 노출(민감정보 제외) — 디버깅 후엔 다시 숨겨도 됨
    const status = err?.status || err?.response?.status || 500;
    const detail =
      err?.error?.message ||
      err?.response?.data?.error?.message ||
      err?.message ||
      "Unknown error";
    return res.status(status).json({
      ok: false,
      message: "Server error",
      detail,
      status,
      // stack: err?.stack, // 필요하면 임시로 열기
    });
  }
}
