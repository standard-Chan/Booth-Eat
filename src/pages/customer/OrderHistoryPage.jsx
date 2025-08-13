// src/pages/OrderHistoryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import Header from "../../components/common/Header.jsx";
import { paths } from "../../routes/paths.js";
import { selectOrderIdsByTable } from "../../store/orderIdsSlice.js";
import { getOrderDetail } from "../../api/customerApi.js";

// 상태 라벨/색상 매핑
const STATUS_MAP = {
  PENDING: { label: "확인 대기 중", color: "#F59E0B" },
  APPROVED: { label: "승인 완료 (요리중)", color: "#3B82F6" },
  REJECTED: { label: "취소", color: "#EF4444" },
  FINISHED: { label: "처리 완료", color: "#10B981" },
};

export default function OrderHistoryPage() {
  const { boothId, tableId } = useParams();
  const navigate = useNavigate();

  // Redux에서 가져오는 값
  const reduxOrderIds = useSelector(
    selectOrderIdsByTable(Number(tableId)),
    shallowEqual
  );

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderIds, setOrderIds] = useState([]);

  const goMenu = () => navigate(paths.menu(boothId, tableId));

  const formatDate = (iso) => {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    const hh = `${d.getHours()}`.padStart(2, "0");
    const min = `${d.getMinutes()}`.padStart(2, "0");
    return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
  };

  // ✅ localStorage에서 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(`orderIds_table_${tableId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setOrderIds(parsed);
        }
      } catch {
        console.warn("저장된 orderIds 파싱 실패");
      }
    }
  }, [tableId]);

  // ✅ Redux에서 값이 바뀌면 localStorage + state에 반영
  useEffect(() => {
    if (reduxOrderIds && reduxOrderIds.length > 0) {
      const unique = Array.from(
        new Set(reduxOrderIds.map((n) => Number(n)).filter(Number.isFinite))
      );
      setOrderIds(unique);
      localStorage.setItem(
        `orderIds_table_${tableId}`,
        JSON.stringify(unique)
      );
    }
  }, [reduxOrderIds, tableId]);

  // 숫자 변환 + NaN 제거 + 중복 제거
  const uniqueOrderIds = useMemo(() => {
    return Array.from(new Set(orderIds.map((n) => Number(n)).filter(Number.isFinite)));
  }, [orderIds]);

  // ✅ 안정적인 문자열 키(정렬 후 join) — useEffect 의존성으로 사용
  const idsKey = useMemo(() => {
    if (!uniqueOrderIds.length) return "";
    const sorted = [...uniqueOrderIds].sort((a, b) => a - b);
    return sorted.join(",");
  }, [uniqueOrderIds]);

  useEffect(() => {
    let canceled = false;

    async function fetchAll() {
      if (!idsKey) {
        if (!canceled) {
          setOrders([]);
          setError(null);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const ids = idsKey.split(",").map((s) => Number(s));
        const results = await Promise.allSettled(
          ids.map((id) => getOrderDetail(id))
        );

        const ok = results
          .filter((r) => r.status === "fulfilled" && r.value)
          .map((r) => r.value);

        ok.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        if (!canceled) {
          setOrders(ok);
          if (ok.length < ids.length) {
            setError("일부 주문 정보를 불러오지 못했습니다.");
          }
        }
      } catch (e) {
        if (!canceled) {
          setOrders([]);
          setError("주문 내역을 불러오는 중 오류가 발생했습니다.");
          console.error(e);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      canceled = true;
    };
  }, [idsKey]);

  return (
    <Page>
      <Header
        title={`${tableId}번 주문 내역`}
        leftIcon={<span style={{ fontSize: 22 }}>×</span>}
        onLeft={goMenu}
        rightIcon={<span />}
      />

      {loading ? (
        <List>
          <Card><Skeleton>주문 내역을 불러오는 중…</Skeleton></Card>
          <Card><Skeleton>주문 내역을 불러오는 중…</Skeleton></Card>
        </List>
      ) : error ? (
        <List>
          <Card><ErrorText>{error}</ErrorText></Card>
        </List>
      ) : orders.length === 0 ? (
        <EmptyBox>
          <div>주문 내역이 없습니다.</div>
          <SmallBtn onClick={goMenu}>메뉴로 가기</SmallBtn>
        </EmptyBox>
      ) : (
        <List>
          {orders.map((o) => {
            const stat =
              STATUS_MAP[o.customerOrder.status] || STATUS_MAP.PENDING;
            const qty = Array.isArray(o.orderItems)
              ? o.orderItems.length
              : 0;
            return (
              <Card key={o.orderId}>
                <TopRow>
                  <OrderTitle>
                    {formatDate(o.customerOrder.created_at)} 주문
                  </OrderTitle>
                  <Status>
                    <Dot style={{ background: stat.color }} />
                    <StatusText style={{ color: stat.color }}>
                      {stat.label}
                    </StatusText>
                  </Status>
                </TopRow>

                <Sub>ODR{o.orderId}</Sub>

                <MetaRow>
                  <MetaCol>
                    <MetaLabel>총 금액</MetaLabel>
                    <MetaStrong>
                      {(o.paymentInfo.amount || 0).toLocaleString()}원
                    </MetaStrong>
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
      )}
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

const Skeleton = styled.div`
  color: #9aa0a6;
  font-size: 14px;
`;

const ErrorText = styled.div`
  color: #EF4444;
  font-size: 14px;
`;

const EmptyBox = styled.div`
  padding: 40px 16px;
  text-align: center;
  color: #6b7280;
  display: grid;
  gap: 12px;
`;

const SmallBtn = styled.button`
  display: inline-block;
  margin: 0 auto;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
`;
