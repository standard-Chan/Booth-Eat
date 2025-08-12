// src/api/gpt.js
/**
 * GPT-5 Nano를 브라우저에서 직접 호출하는 유틸.
 * - 성공 시 모델의 답변 텍스트(String) 반환.
 */

export async function callGpt5NanoBrowser(promptText, apiKey) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("OpenAI API 키가 없습니다.");
  }
  const payload = {
    model: "gpt-5-nano",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: promptText },
    ],
    // GPT-5 옵션(속도·길이 힌트)
    reasoning_effort: "minimal",
    verbosity: "low",
    stream: false,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail = {};
    try { detail = await res.json(); } catch {}
    const msg = detail?.error?.message || detail?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}
