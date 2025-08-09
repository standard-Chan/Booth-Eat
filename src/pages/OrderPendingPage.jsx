import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paths } from '../routes/paths.js';

export default function OrderPendingPage() {
  const { boothId, orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 데모: 2초 후 승인 완료로 이동
    const t = setTimeout(() => {
      navigate(paths.complete(boothId, orderId));
    }, 2000);
    return () => clearTimeout(t);
  }, [boothId, orderId, navigate]);

  return (
    <div>
      <h1>결제 승인 대기</h1>
      <p>boothId: {boothId}, orderId: {orderId}</p>
      <p>주문 확인 중입니다…</p>
    </div>
  );
}
