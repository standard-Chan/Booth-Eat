import React from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  inc,
  dec,
  removeItem,
  selectCartItems,
  selectCartTotalAmount,
} from "../../store/cartSlice.js";
import Header from "../../components/common/Header.jsx";
import CartItem from "../../components/cart/CartItem.jsx";
import { paths } from "../../routes/paths.js";
import { showErrorToast } from "../../utils/toast.js";

export default function CartPage() {
  const { boothId, tableId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const totalAmount = useSelector(selectCartTotalAmount);

  const goConfirm = () => {
    if (!items.length) {
      showErrorToast("장바구니가 비어있습니다.");
      return;
    }
    navigate(paths.confirm(boothId, tableId));
  };

  return (
    <Page>
      <Header
        title="장바구니"
        onLeft={() => navigate(paths.orderHistory(boothId, tableId))}
        onRight={() => {}}
      />

      <List>
        {items.length === 0 ? (
          <Empty>
            장바구니가 비어있습니다.
            <EmptyBtn onClick={() => navigate(paths.menu(boothId, tableId))}>
              메뉴 보러가기
            </EmptyBtn>
          </Empty>
        ) : (
          items.map((it, idx) => (
            <React.Fragment key={it.foodId}>
              <CartItem
                item={it}
                onInc={() => dispatch(inc(it.foodId))}
                onDec={() => dispatch(dec(it.foodId))}
                onRemove={() => dispatch(removeItem(it.foodId))}
              />
              {idx !== items.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </List>

      <BottomArea>
        <TotalRow>
          <TotalLabel>Total</TotalLabel>
          <TotalValue>{totalAmount.toLocaleString()}</TotalValue>
        </TotalRow>

        <PrimaryBtn onClick={goConfirm}>주문 확인하기</PrimaryBtn>
        <SecondaryBtn onClick={() => navigate(paths.menu(boothId, tableId))}>
          더 담으러 가기
        </SecondaryBtn>
      </BottomArea>
    </Page>
  );
}

/* ===== styled ===== */
const Page = styled.div`
  max-width: 560px;
  margin: 0 auto;
  padding-bottom: 160px; /* 하단 영역 공간 */
`;

const List = styled.div`
  padding: 12px 16px 0 16px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 2px dashed rgba(0, 0, 0, 0.12);
  margin: 12px 0;
`;

const Empty = styled.div`
  padding: 48px 0 24px;
  color: #666;
  text-align: center;
  display: grid;
  gap: 12px;
`;

const EmptyBtn = styled.button`
  width: 160px;
  margin: 0 auto;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #fafafa;
  cursor: pointer;
`;

const BottomArea = styled.div`
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(560px, 100vw);
  background: #fff;
  padding: 16px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 0px 25px;
  margin-bottom: 25px;
`;

const TotalLabel = styled.div`
  font-size: 20px;
  font-weight: 600;
`;

const TotalValue = styled.div`
  font-size: 25px;
  font-weight: 700;
`;

const PrimaryBtn = styled.button`
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

const SecondaryBtn = styled.button`
  width: 100%;
  height: 52px;
  margin-top: 10px;
  background: #f4f1ee;
  color: #111;
  border: 0;
  border-radius: 16px;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
`;
