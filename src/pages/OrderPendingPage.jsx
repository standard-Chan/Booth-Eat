// src/pages/OrderPendingPage.jsx
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import { paths } from '../routes/paths.js';

export default function OrderPendingPage() {
  const { boothId, orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 데모: 2초 후 완료 페이지로 이동
    // 실제에선 SSE/WS 이벤트 수신하거나 폴링으로 상태가 APPROVED일 때 navigate
    const t = setTimeout(() => {
      navigate(paths.complete(boothId, orderId));
    }, 2000);
    return () => clearTimeout(t); // 누수 방지
  }, [boothId, orderId, navigate]);

  const goHome = () => navigate(paths.menu(boothId));

  return (
    <Page>
      <Header
        title="결제 확인"
        leftIcon={<span style={{ fontSize: 22 }}>×</span>}  // X 버튼
        onLeft={goHome}                                      // 처음 메뉴로
        rightIcon={<span />}                                 // 오른쪽 빈 자리
      />

      <Content>
        <MainText>주문 확인 중입니다…</MainText>
        <SubText>잠시만 기다려주세요.</SubText>
        <SubText>2분 동안 주문 확인이 없을 경우{'\n'}직원에게 문의해주세요 :)</SubText>
      </Content>

      <BottomBar>
        <OrderButton onClick={goHome}>확인</OrderButton>
      </BottomBar>
    </Page>
  );
}

/* ===== styled ===== */
const Page = styled.div`
  max-width: 560px;
  margin: 0 auto;
  padding-bottom: 120px; /* 하단 버튼 공간 확보 */
`;

const Content = styled.div`
  padding: 24px 16px 0 16px;
  display: grid;
  place-items: center;
  row-gap: 24px;
  text-align: center;
  min-height: 60vh;
`;

const MainText = styled.h1`
  margin: 80px 0 0;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.3px;
`;

const SubText = styled.p`
  margin: 0;
  white-space: pre-line;
  color: #666;
  line-height: 1.6;
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
