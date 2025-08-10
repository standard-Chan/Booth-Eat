// src/pages/OrderHistoryPage.jsx
import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import { paths } from '../routes/paths.js';
import { MOCK_ORDERS as MOCK } from '../test/mock.js';

// API 응답 예시(목록) — 실제에선 서버 배열로 교체
const MOCK_ORDERS = MOCK;

// 상태 라벨/색상 매핑
const STATUS_MAP = {
  PENDING: { label: '진행 중', color: '#F59E0B' },   // 주황
  APPROVED: { label: '완료',   color: '#10B981' },   // 초록
  REJECTED: { label: '취소',   color: '#EF4444' },   // 빨강
};

export default function OrderHistoryPage() {
  const { boothId } = useParams();
  const navigate = useNavigate();

  const goMenu = () => navigate(paths.menu(boothId));

  const formatDate = (iso) => {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const dd = `${d.getDate()}`.padStart(2, '0');
    const hh = `${d.getHours()}`.padStart(2, '0');
    const min = `${d.getMinutes()}`.padStart(2, '0');
    return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
  };

  return (
    <Page>
      <Header
        title={`${MOCK_ORDERS[0].boothName} ${MOCK_ORDERS[0]?.tableNo ?? ''}번 주문 내역`}
        leftIcon={<span style={{ fontSize: 22 }}>×</span>}
        onLeft={goMenu}
        rightIcon={<span />}
      />

      <List>
        {MOCK_ORDERS.map((o) => {
          const stat = STATUS_MAP[o.status] || STATUS_MAP.PENDING;
          const qty = o.items.length; // distinct line count
          return (
            <Card key={o.orderId}>
              <TopRow>
                <OrderTitle>{formatDate(o.createdAt)} 주문</OrderTitle>
                <Status>
                  <Dot style={{ background: stat.color }} />
                  <StatusText style={{ color: stat.color }}>{stat.label}</StatusText>
                </Status>
              </TopRow>

              <Sub>ODR{o.orderId}</Sub>

              <MetaRow>
                <MetaCol>
                  <MetaLabel>총 금액</MetaLabel>
                  <MetaStrong>{o.amount.toLocaleString()}원</MetaStrong>
                </MetaCol>

                <MetaColRight>
                  <MetaLabel>수량</MetaLabel>
                  <MetaStrong>{qty}</MetaStrong>
                </MetaColRight>
              </MetaRow>
            </Card>
          );
        })}
      </List>
    </Page>
  );
}

/* ===== styled ===== */
const Page = styled.div`
  max-width: 560px;
  margin: 0 auto;
`;

const List = styled.div`
  padding: 12px 16px 24px;
  display: grid;
  gap: 16px;
`;

const Card = styled.div`
  border: 2px dashed #d9d9d9;
  border-radius: 16px;
  padding: 16px;
  background: #fff;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OrderTitle = styled.div`
  flex: 1;
  font-weight: 800;
  font-size: 18px;
`;

const Status = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
`;

const StatusText = styled.span`
  font-weight: 700;
  font-size: 14px;
`;

const Sub = styled.div`
  margin-top: 4px;
  color: #9aa0a6;
  font-size: 14px;
`;

const MetaRow = styled.div`
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const MetaCol = styled.div``;

const MetaColRight = styled(MetaCol)`
  text-align: right;
`;

const MetaLabel = styled.div`
  color: #a7a7a7;
  font-size: 14px;
`;

const MetaStrong = styled.div`
  margin-top: 6px;
  font-weight: 900;
  font-size: 18px;
`;
