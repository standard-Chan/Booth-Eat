import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paths } from '../routes/paths.js';

export default function MenuPage() {
  const { boothId } = useParams();
  const navigate = useNavigate();

  const goCart = () => {
    navigate(paths.cart(boothId));
  };

  return (
    <div>
      <h1>전체 메뉴 페이지</h1>
      <p>boothId: {boothId}</p>
      <button onClick={goCart}>주문하기(장바구니로)</button>
    </div>
  );
}
