import React from 'react';
import { useParams } from 'react-router-dom';

export default function OrderCompletePage() {
  const { boothId, orderId } = useParams();
  return (
    <div>
      <h1>주문 완료</h1>
      <p>boothId: {boothId}, orderId: {orderId}</p>
    </div>
  );
}
