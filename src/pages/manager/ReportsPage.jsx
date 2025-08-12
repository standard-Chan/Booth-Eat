// src/pages/manager/ManagerReportsPage.jsx
import React, { useState } from "react";
import styled from "styled-components";
import AppLayout from "../../components/common/manager/AppLayout.jsx";

const Box = styled.div`
  border: 1px dashed #ddd;
  border-radius: 12px;
  padding: 16px;
  display: grid;
  gap: 12px;
  height: 520px;
  grid-template-rows: auto auto 1fr;
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  resize: vertical;
  font-size: 14px;
`;

const Button = styled.button`
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background: #111827;
  color: white;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Output = styled.pre`
  margin: 0;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fafafa;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

export default function ManagerReportsPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setReply("");

    try {
      // 안전하게 서버리스 함수 호출
      const res = await fetch("/api/gpt5nano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setReply(data?.reply || "");
    } catch (err) {
      console.error(err);
      setError(err.message || "요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title="비즈니스 리포트">
      <Box>
        <form onSubmit={onSubmit}>
          <TextArea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='분석 요청을 입력하세요. 예) "우리 부스의 베스트셀러와 피크 시간대를 분석해줘"'
          />
          <Row style={{ marginTop: 8 }}>
            <Button type="submit" disabled={loading}>
              {loading ? "분석 중..." : "확인"}
            </Button>
          </Row>
        </form>

        {error ? (
          <Output style={{ color: "#b91c1c", background: "#fff1f2" }}>
            {error}
          </Output>
        ) : (
          <Output>{reply || "응답이 여기 표시됩니다."}</Output>
        )}
      </Box>
    </AppLayout>
  );
}
