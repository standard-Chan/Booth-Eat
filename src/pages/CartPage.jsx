import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paths } from '../routes/paths.js';

export default function CartPage() {
  const { boothId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <h1>장바구니</h1>
      <p>boothId: {boothId}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => navigate(paths.menu(boothId))}>더 담으러 가기</button>
        <button onClick={() => navigate(paths.confirm(boothId))}>주문 확인하기</button>
      </div>
    </div>
  );
}
