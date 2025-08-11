import React from 'react';
import styled from 'styled-components';
import { formatKRW } from '../../../utils/format.js';

const Card = styled.div`
  background:#fff; border:1px solid #eee; border-radius:14px;
  padding:18px 16px; min-width:220px;
`;
const Title = styled.div` color:#6b7280; font-size:13px; margin-bottom:8px; `;
const Value = styled.div` font-size:22px; font-weight:800; `;
export default function StatCard({ title, value, isMoney }) {
  return (
    <Card>
      <Title>{title}</Title>
      <Value>{isMoney ? formatKRW(value) : value}</Value>
    </Card>
  );
}
