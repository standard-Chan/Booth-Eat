// src/components/common/AccountInfo.jsx
import React, { useState } from "react";
import styled from "styled-components";

/**
 * 계좌 정보 + 복사 버튼 컴포넌트
 * - 계좌번호 바로 옆에 📋 아이콘 버튼
 * - 복사 성공시 짧게 "복사됨" 배지 노출
 * - 디자인: 텍스트 라인과 자연스럽게 이어지는 미니 버튼
 *
 * props:
 *  - bank: string
 *  - account: string
 *  - accountHolder?: string
 *  - onCopied?: (text: string) => void
 */
export default function AccountInfo({
  bank,
  account,
  accountHolder = "",
  onCopied,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `${bank} ${account}`;
    try {
      // HTTPS 환경/권한 문제 대비: navigator.clipboard → execCommand 순차 시도
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      onCopied && onCopied(text);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("Copy failed:", e);
      alert("복사에 실패했습니다. 수동으로 복사하세요.");
    }
  };

  return (
    <Wrap>
      <Row>
        <Label>입금 계좌</Label>
        <Inline>
          <AccountText aria-label="입금 계좌">
            {bank} {account}
          </AccountText>

          <CopyBtn
            type="button"
            onClick={handleCopy}
            aria-label="계좌번호 복사"
            title="계좌번호 복사"
          >
            📋
          </CopyBtn>

          {copied && <CopiedBadge>복사됨</CopiedBadge>}
        </Inline>
      </Row>

      {accountHolder && (
        <Row>
          <Label>예금주</Label>
          <Value>{accountHolder}</Value>
        </Row>
      )}
    </Wrap>
  );
}

/* ===== styles ===== */
const Wrap = styled.div`
  display: grid;
  gap: 10px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 96px 1fr;
  align-items: center;
  gap: 8px;

  @media (max-width: 420px) {
    grid-template-columns: 84px 1fr;
  }
`;

const Label = styled.div`
  color: #666;
  font-weight: 700;
  font-size: 14px;
`;

const Inline = styled.div`
  display: inline-flex;           /* 텍스트 라인과 자연스럽게 이어지도록 */
  align-items: center;
  gap: 6px;                       /* 계좌번호와 버튼 사이 간격 */
  flex-wrap: wrap;
`;

const AccountText = styled.span`
  font-weight: 800;
  font-size: 18px;
  color: #222;
  line-height: 1.2;
`;

const CopyBtn = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  padding: 2px 6px;               /* 미니 버튼 느낌 */
  border-radius: 6px;
  line-height: 1;
  transition: background 0.15s ease;

  &:hover {
    background: #f2f2f2;
  }

  &:active {
    transform: translateY(0.5px);
  }
`;

const CopiedBadge = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #10b981;
  background: #e6fbf3;
  border: 1px solid #a7f3d0;
  padding: 2px 6px;
  border-radius: 999px;
  line-height: 1;
`;

const Value = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: #222;
`;
