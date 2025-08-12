// src/pages/customer/MenuPage.jsx
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header.jsx';
import FoodCard from '../../components/menu/FoodCard.jsx';
import FoodDetailModal from '../../components/menu/FoodDetailModal.jsx';
import { paths } from '../../routes/paths.js';
import { addItem } from '../../store/cartSlice.js';
import { useDispatch } from 'react-redux';
import { showSuccessToast, showErrorToast } from '../../utils/toast.js';
import { listMenusByBooth } from '../../api/customerApi.js';
import { MOCK_FOOD } from '../../test/mock.js';

export default function MenuPage() {
  const { boothId, tableId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // --- API: 부스별 메뉴 조회 ---
  useEffect(() => {
    let canceled = false;

    async function fetchMenus() {
      try {
        setLoading(true);
        const data = await listMenusByBooth(Number(boothId));
        if (!canceled) setMenus(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!canceled) {
          setMenus([]);
          showErrorToast('메뉴를 불러오지 못했습니다.');
          // eslint-disable-next-line no-console
          console.error(e);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    if (boothId) fetchMenus();
    return () => { canceled = true; };
  }, [boothId]);

  // 카테고리 분류
  const { foodList, drinkList } = useMemo(() => {
    // const foods = MOCK_FOOD.foods.filter((m) => m.category === 'FOOD');
    // const drinks = MOCK_FOOD.foods.filter((m) => m.category === 'DRINK');
    const foods = menus.filter((m) => m.category === 'FOOD');
    const drinks = menus.filter((m) => m.category === 'DRINK');
    console.log(foods);
    return { foodList: foods, drinkList: drinks };
  }, [menus]);

  const openDetail = useCallback((item) => setSelected(item), []);
  const closeDetail = useCallback(() => setSelected(null), []);

  // 장바구니 담기
  const handleAdd = useCallback(
    (item, qty) => {
      // API 스키마 → cart 스키마 매핑
      dispatch(
        addItem({
          foodId: item.menuItemId,                 // ✅ menuItemId 사용
          name: item.name,
          price: item.price,
          imageUrl: item.previewImage || '',
          quantity: qty,
        })
      );
      showSuccessToast('장바구니에 담기에 성공하였습니다.');
      closeDetail();
    },
    [dispatch, closeDetail]
  );

  return (
    <Page>
      <Header
        title="Menu"
        onLeft={() => navigate(paths.orderHistory(boothId, tableId))}
        onRight={() => navigate(paths.cart(boothId, tableId))}
      />

      {loading ? (
        <Loading>메뉴 불러오는 중…</Loading>
      ) : (
        <>
          <Section>
            <SectionTitle>음식</SectionTitle>
            {foodList.length === 0 ? (
              <Empty>표시할 음식이 없습니다.</Empty>
            ) : (
              <CardList>
                {foodList.map((item) => (
                  <FoodCard
                    key={item.menuItemId}
                    name={item.name}
                    description={item.description || ''}
                    price={item.price}
                    imageUrl={item.previewImage}
                    isAvailable={item.available}
                    onClick={() => openDetail(item)}
                  />
                ))}
              </CardList>
            )}
          </Section>

          <Section>
            <SectionTitle>음료</SectionTitle>
            {drinkList.length === 0 ? (
              <Empty>표시할 음료가 없습니다.</Empty>
            ) : (
              <CardList>
                {drinkList.map((item) => (
                  <FoodCard
                    key={item.menuItemId}
                    name={item.name}
                    description={item.description || ''}
                    price={item.price}
                    imageUrl={item.previewImage}
                    isAvailable={item.available}
                    onClick={() => openDetail(item)}
                  />
                ))}
              </CardList>
            )}
          </Section>
        </>
      )}

      <BottomSpacer />
      <BottomBar>
        <OrderButton onClick={() => navigate(paths.cart(boothId, tableId))}>주문하기</OrderButton>
      </BottomBar>

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

const Loading = styled.div`
  padding: 24px 12px;
  font-size: 16px;
  color: #666;
`;

const Empty = styled.div`
  padding: 16px 8px;
  color: #999;
  font-size: 14px;
`;

const Section = styled.section`
  padding: 10px 5px;
`;

const SectionTitle = styled.h2`
  margin: 10px 0 12px 0;
  font-size: 22px;
  font-weight: 900;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
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
