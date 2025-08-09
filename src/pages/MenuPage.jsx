import React, { useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import FoodCard from '../components/menu/FoodCard.jsx';
import FoodDetailModal from '../components/menu/FoodDetailModal.jsx';
import { paths } from '../routes/paths.js';
import { MOCK_FOOD } from '../test/mock.js';

const MOCK = MOCK_FOOD;

export default function MenuPage() {
  const { boothId } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null); // 모달용 선택 아이템

  const { foodList, drinkList } = useMemo(() => {
    const foodList = MOCK.foods.filter((f) => f.category === 'FOOD');
    const drinkList = MOCK.foods.filter((f) => f.category === 'DRINK');
    return { foodList, drinkList };
  }, []);

  const openDetail = useCallback((item) => setSelected(item), []);
  const closeDetail = useCallback(() => setSelected(null), []);

  const handleAdd = useCallback((item, qty) => {
    // TODO: 추후 Redux cartSlice.add({ item, qty })로 교체
    console.log('장바구니 담기:', item.title, 'x', qty);
    closeDetail();
  }, [closeDetail]);

  return (
    <Page>
      <Header
        title="Menu"
        onLeft={() => {}}
        onRight={() => navigate(paths.cart(boothId))}
      />

      <Section>
        <SectionTitle>음식</SectionTitle>
        <CardList>
          {foodList.map((item) => (
            <FoodCard
              key={item.id}
              badge={item.badge}
              title={item.title}
              description={item.description}
              price={item.price}
              image={item.image}
              onClick={() => openDetail(item)}
            />
          ))}
        </CardList>
      </Section>

      <Section>
        <SectionTitle>음료</SectionTitle>
        <CardList>
          {drinkList.map((item) => (
            <FoodCard
              key={item.id}
              title={item.title}
              price={item.price}
              image={item.image}
              onClick={() => openDetail(item)}
            />
          ))}
        </CardList>
      </Section>

      <BottomSpacer />
      <BottomBar>
        <OrderButton onClick={() => navigate(paths.cart(boothId))}>주문하기</OrderButton>
      </BottomBar>

      {/* 상세 모달 */}
      <FoodDetailModal
        open={!!selected}
        item={selected}
        onClose={closeDetail}
        onAdd={handleAdd}
      />
    </Page>
  );
}

/* ===== styled ===== */
const Page = styled.div`
  max-width: 560px;
  margin: 0 auto;
  padding-bottom: 92px;
`;

const Section = styled.section`
  padding: 16px 16px 0 16px;
`;

const SectionTitle = styled.h2`
  margin: 10px 0 12px 0;
  font-size: 22px;
  font-weight: 900;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BottomSpacer = styled.div`
  height: 80px;
`;

const BottomBar = styled.div`
  position: fixed;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  width: min(520px, 92vw);
  padding: 0 8px;
  z-index: 20;
`;

const OrderButton = styled.button`
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
