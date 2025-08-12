import OpenAI from "openai";
import { OPENAI_API_KEY } from "./api.js";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY, // 환경변수로 설정
});

export async function callGpt5Nano(promptText) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: promptText },
      ],
      reasoning_effort: "minimal",  // 속도 우선
      verbosity: "low",             // 짧게 요약된 응답
      stream: false,                // 실시간 스트리밍 false로 설정
    });

    const answer = response.choices?.[0]?.message?.content;
    console.log("GPT-5 Nano 응답:", answer);
    return answer;
  } catch (err) {
    console.error("API 호출 오류:", err);
    throw err;
  }
}

// 예제 호출
callGpt5Nano("INTP이 갖는 남들보다 뛰어난 능력이 뭐야? INTP은 어떤 삶을 살아야 행복할 수 있어? ").then(console.log);
