import React from 'react';
import styled from 'styled-components';

export default function CartItem({ item, onInc, onDec, onRemove }) {
  const { name, price, imageUrl, quantity } = item;

  return (
    <Wrap>
      <ThumbWrap>
        {imageUrl ? <Thumb src={imageUrl} alt={name} /> : <Placeholder />}
      </ThumbWrap>

      <Info>
        <TopRow>
          <Name>{name}</Name>
          <RemoveBtn onClick={onRemove}>×</RemoveBtn>
        </TopRow>
        <Price>{price.toLocaleString()}원</Price>

        <QtyRow>
          <QtyBtn disabled={quantity <= 1} onClick={onDec}>−</QtyBtn>
          <QtyValue>{quantity}</QtyValue>
          <QtyBtn onClick={onInc}>＋</QtyBtn>
        </QtyRow>
      </Info>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 16px;
  padding: 12px 0;
`;

const ThumbWrap = styled.div`
  width: 110px;
  height: 110px;
  position: relative;
`;

const Thumb = styled.img`
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 16px;
`;

const Placeholder = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 16px;
  background: #ef6a3b; /* 이미지 없을 때 주황 */
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
`;

const Name = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #111;
  flex: 1;
`;

const RemoveBtn = styled.button`
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
`;

const Price = styled.div`
  color: #8f8f8f;
  font-size: 16px;
`;

const QtyRow = styled.div`
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const QtyBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #dedede;
  background: #f5f5f5;
  font-size: 20px;
  cursor: pointer;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const QtyValue = styled.div`
  width: 22px;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
`;
