import React from "react";
import styled from "styled-components";
import { formatKRW } from "../../../utils/format.js";

const Card = styled.div`
  flex:1 1 220px;
  min-width:220px;
  background:#fff;
  border:1px solid #eee;
  border-radius:16px;
  padding:16px 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;
const Title = styled.div` color:#6b7280; font-size:13px; margin-bottom:6px; `;
const Value = styled.div` font-size:22px; font-weight:700; color:#111827; `;

export default function StatCard({ title, value, isMoney }) {
  const display = isMoney ? formatKRW(value || 0) : (value ?? 0);
  return (
    <Card>
      <Title>{title}</Title>
      <Value>{display}</Value>
    </Card>
  );
}
