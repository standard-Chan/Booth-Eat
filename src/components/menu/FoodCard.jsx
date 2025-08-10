import React from 'react';
import styled from 'styled-components';

export default function FoodCard({
  badge,                 // 옵션
  name,
  description,
  price,
  imageUrl,
  isAvailable = true,
  onClick,
}) {
  return (
    <Card onClick={isAvailable ? onClick : undefined} disabled={!isAvailable}>
      <Info>
        {badge ? <Badge>{badge}</Badge> : null}
        <Name>{name}</Name>
        {description ? <Desc>{description}</Desc> : null}
        <PricePill>{price.toLocaleString()}</PricePill>
      </Info>

      {imageUrl ? (
        <ThumbWrap>
          {!isAvailable && <SoldOut>품절</SoldOut>}
          <Thumb src={imageUrl} alt={name} loading="lazy" />
        </ThumbWrap>
      ) : null}
    </Card>
  );
}

const Card = styled.button`
  position: relative; /* 가격 위치 고정을 위해 relative */
  width: 100%;
  height: 150px;
  display: grid;
  grid-template-columns: 1fr 110px;
  gap: 12px;
  border: 0;
  background: #fff;
  padding: 10px 3px;
  cursor: pointer;
  text-align: left;
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
  border-bottom: 1.5px solid rgba(0, 0, 0, 0.15);

  &:last-child {
    border-bottom: none;
  }
`;


const Info = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 20px;
`;

const Badge = styled.span`
  color: #e25822;
  font-weight: 700;
  font-size: 13px;
`;

const Name = styled.div`
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #111;
`;

const Desc = styled.p`
  margin: 0;
  color: #8a8580;
  font-size: 13px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;      /* 최대 2줄 표시 */
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PricePill = styled.span`
  position: absolute;
  left: 0px;   /* 좌측 여백 */
  bottom: 15px; /* 하단 여백 */
  background: #f1eee9;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 500;
`;
const ThumbWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1; /* 600:400 비율 유지 */
`;

const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; 
  border-radius: 16px;
`;

const SoldOut = styled.div`
  position: absolute;
  inset: 0; /* 부모 크기에 딱 맞춤 */
  background: rgba(0,0,0,0.45);
  color: #fff;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
`;
