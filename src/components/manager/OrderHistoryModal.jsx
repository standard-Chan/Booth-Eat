// src/components/manager/OrderHistoryModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Modal from "../common/manager/Modal.jsx";
import OrderCard from "./OrderCard.jsx";
import { fetchOrderHistoryByTable } from "../../services/ordersService.js";

export default function OrderHistoryModal({
  open,
  boothId,
  tableNumber,
  onClose,
  onClearOrder, // (orderId) => void
}) {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  const listRef = useRef(null);
  const colRefs = useRef([]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await fetchOrderHistoryByTable(boothId, tableNumber);
        setOrders(data || []);
      } catch (e) {
        setError("주문 내역을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, boothId, tableNumber]);

  // 최신순 정렬 보장
  const sorted = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          +new Date(b.customerOrder?.created_at) -
          +new Date(a.customerOrder?.created_at)
      ),
    [orders]
  );

  const fmtHM = (iso) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };
  const fmtYMD = (iso) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(d.getDate()).padStart(2, "0")}`;
  };

  // Order → OrderCard props 매핑
  const toCardProps = (o) => {
    const co = o.customerOrder || {};
    const status = (co.status || "").toUpperCase(); // PENDING | APPROVED | DONE
    const amount = o.paymentInfo?.amount ?? co.total_amount ?? 0;

    return {
      tableNo: tableNumber,
      timeText: `${fmtYMD(co.created_at)} ${fmtHM(co.created_at)}`,
      active: true,
      orderStatus: status === "DONE" ? "APPROVED" : status, // 카드 조건(비우기 버튼) 재사용 위해 DONE→APPROVED 취급
      items: (o.orderItems || []).map((it) => ({
        name: it.name,
        qty: it.quantity,
      })),
      customerName: o.paymentInfo?.payer_name || "-",
      addAmount: amount, // 히스토리 카드에선 개별 주문 금액
      totalAmount: amount, // 기존 컴포넌트 구조 유지 위해 동일 값 전달
      onApprove: undefined, // 팝업에선 사용 안 함
      onReject: undefined,
      onClear: () => onClearOrder?.(co.order_id),
      onReceiptClick: () => {}, // 팝업 안의 아이콘은 동작 없음
    };
  };

  return (
    <Modal open={open} title={`테이블 ${tableNumber}`} onClose={onClose}>
      {loading && <Empty>불러오는 중…</Empty>}
      {error && <Empty>{error}</Empty>}
      {!loading && !error && sorted.length === 0 && (
        <Empty>이 테이블의 주문 이력이 없습니다.</Empty>
      )}

      {!loading && !error && sorted.length > 0 && (
        <>
          <List ref={listRef}>
            {sorted.map((o, i) => (
              <CardWrap
                key={o.customerOrder?.order_id}
                ref={(el) => (colRefs.current[i] = el)}
              >
                <OrderCard {...toCardProps(o)} />
              </CardWrap>
            ))}
          </List>
        </>
      )}
    </Modal>
  );
}

/* ===== styles ===== */
const Empty = styled.div`
  padding: 40px 8px;
  color: #888;
  text-align: center;
  font-weight: 600;
`;

const List = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 340px; /* 카드 폭 + 여유 */
  gap: 18px;
  overflow-x: auto;
  padding: 8px 6px 6px 6px;
`;

const CardWrap = styled.div`
  /* 팝업 안에서 카드 여백/그림자 조정하고 싶으면 여기서 */
`;