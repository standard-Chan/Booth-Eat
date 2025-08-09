import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paths } from '../routes/paths.js';

export default function OrderConfirmPage() {
  const { boothId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');

  // 데모용으로 orderId=123 가정
  const submit = () => {
    if (!name.trim()) return alert('성함을 입력해주세요.');
    navigate(paths.pending(boothId, 123));
  };

  return (
    <div>
      <h1>주문 상세(이체 안내)</h1>
      <p>boothId: {boothId}</p>
      <div style={{ margin: '12px 0' }}>
        <label>성함: <input value={name} onChange={(e) => setName(e.target.value)} /></label>
      </div>
      <button onClick={submit}>이체 완료</button>
    </div>
  );
}
