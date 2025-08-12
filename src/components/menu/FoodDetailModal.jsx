import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Modal from "../common/Modal.jsx";

export default function FoodDetailModal({ open, item, onClose, onAdd }) {
  const [qty, setQty] = useState(1);

  // 모달 열릴 때마다 수량 초기화
  useEffect(() => {
    if (open) {
      setQty(1);
    }
  }, [open, item]);

  if (!item) return null;

  const inc = () => setQty((n) => n + 1);
  const dec = () => setQty((n) => Math.max(1, n - 1));
  const add = () => onAdd?.(item, qty); // 장바구니 추가

  return (
    <Modal open={open} onClose={onClose}>
      <Header>
        <Title>Menu</Title>
        <CloseBtn onClick={onClose}>✕</CloseBtn>
      </Header>

      {item.previewImage && <Hero src={item.previewImage} alt={item.name} />}

      <NameWrapper>
        
        <Name>{item.name}{<Badge>{item.badge}</Badge>}</Name>
        {item.description && <Desc>{item.description}</Desc>}
      </NameWrapper>

      <PriceRow>
        <Price>{item.price.toLocaleString()} 원</Price>
        <QtyBox>
          <QtyBtn onClick={dec}>−</QtyBtn>
          <QtyValue>{qty}</QtyValue>
          <QtyBtn onClick={inc}>＋</QtyBtn>
        </QtyBox>
      </PriceRow>

      <Bottom>
        <AddButton onClick={add} disabled={!item.available}>
          {item.available ? "장바구니 담기" : "품절"}
        </AddButton>
      </Bottom>
    </Modal>
  );
}

/* ==== styled ==== */
const Header = styled.div`
  grid-template-columns: 1fr auto;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h2`
  margin: 0 auto 0 0;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  grid-column: 1 / -1;
`;

const CloseBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 12px;
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
`;

const Hero = styled.img`
  display: block;
  width: 100%;
  height: 200px;
  min-height: 200px; /* 이미지 없을 때 높이 확보 */
  background-color: aliceblue;
  object-fit: cover;
  border-radius: 16px;
  margin-top: 8px;
`;

const NameWrapper = styled.div`
  margin-top: 22px; /* 위쪽 간격 */
`;

const Badge = styled.span`
  display: inline-block;
  margin-left: 20px;
  margin-top: 16px;
  color: #e25822;
  font-weight: 700;
  font-size: 14px;
`;

const Name = styled.h3`
  margin: 4px 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #2b211b;
`;

const Desc = styled.p`
  margin-top: 10px;
  white-space: pre-line; /* 줄바꿈 유지 */
  color: #7a5f54;
  font-size: 16px;
  line-height: 1.5;
`;

const PriceRow = styled.div`
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Price = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #7a5f54;
`;

const QtyBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QtyBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #d9d9d9;
  background: #fff;
  font-size: 22px;
  cursor: pointer;
`;

const QtyValue = styled.div`
  width: 24px;
  text-align: center;
  font-weight: 700;
  font-size: 18px;
`;

const Bottom = styled.div`
  margin-top: 8vh; /* 화면 아래 여백 확보 */
`;

const AddButton = styled.button`
  width: 100%;
  height: 56px;
  background: #ef6a3b;
  color: #fff;
  border: 0;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(239, 106, 59, 0.25);
`;
