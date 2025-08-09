import React from 'react';
import styled from 'styled-components';

export default function FoodCard({
  badge,            // "Best!" 같은 라벨(옵션)
  title,
  description,
  price,            // number
  image,            // url
  onClick,
}) {
  return (
    <Card onClick={onClick}>
      <Info>
        <Name>{title}</Name>
        {description ? <Desc>{description}</Desc> : null}
        <PricePill>{price.toLocaleString()}원</PricePill>
      </Info>
      {image ? <Thumb src={image} alt={title} loading="lazy" /> : null}
    </Card>
  );
}
const Card = styled.button`
  width: 100%;
  height: 150px; /* 카드 전체 높이 고정 */
  display: grid;
  grid-template-columns: 1fr 110px;
  gap: 12px;
  border: 0;
  background: #fff;
  padding: 12px 1px;
  cursor: pointer;
  text-align: left;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden; /* 높이 고정 시 넘치는 내용 숨김 */
`;

const Desc = styled.p`
  margin: 0;
  color: #8a8580;
  font-size: 13px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 최대 2줄 */
  -webkit-box-orient: vertical;
  overflow: hidden;
`;


const Badge = styled.span`
  color: #e25822;
  font-weight: 700;
  font-size: 13px;
`;

const Name = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #111;
`;
const PricePill = styled.span`
  width: fit-content;
  margin-top: 6px;
  background: #f1eee9;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 700;
`;

const Thumb = styled.img`
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 16px;
`;
