import React from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header.jsx";
import { paths } from "../../routes/paths.js";

export default function OrderCompletePage() {
  const { boothId, orderId, tableId } = useParams();
  const navigate = useNavigate();

  const goMenu = () => navigate(paths.menu(boothId, tableId));
  const goOrders = () => navigate(paths.orderHistory(boothId, tableId));

  return (
    <Page>
      <Header
        title="결제 확인"
        leftIcon={<span style={{ fontSize: 22 }}>×</span>}
        onLeft={goMenu}
        rightIcon={<span />} // 오른쪽 비우기
      />

      <Content>
        <MainText>결제 확인되었습니다.</MainText>
        <SubText>음식이 나올 때까지 조금만 기다려 주세요.</SubText>
      </Content>

      <BottomBar>
        <OrderButton onClick={goOrders}>주문내역 확인하기</OrderButton>
      </BottomBar>
    </Page>
  );
}

/* ===== styled ===== */
const Page = styled.div`
  max-width: 560px;
  margin: 0 auto;
  padding-bottom: 120px;
`;

const Content = styled.div`
  padding: 24px 16px 0 16px;
  min-height: 60vh;
  display: grid;
  place-items: center;
  text-align: center;
  row-gap: 18px;
`;

const MainText = styled.h1`
  margin: 80px 0 0;
  font-size: 28px;
  font-weight: 900;
`;

const SubText = styled.p`
  margin: 0;
  color: #555;
  font-size: 16px;
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
