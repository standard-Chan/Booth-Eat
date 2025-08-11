import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Modal from "../common/manager/Modal.jsx";
import OrderCard from "./OrderCard.jsx";

import { getTableOrders, setOrderStatus } from "../../api/manager/orderApi.js";


export default function OrderHistoryModal({
  open,
  boothId,
  tableId,
  tableNumber,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  const listRef = useRef(null);
  const colRefs = useRef([]);

  useEffect(() => {
    if (!open || !boothId || !tableId) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await getTableOrders(boothId, tableId);
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        setError("주문 이력을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, boothId, tableId]);

  // 최신순(생성시간) 정렬
  const sorted = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          +new Date(b?.createdAt || 0) - +new Date(a?.createdAt || 0)
      ),
    [orders]
  );

  const fmtHM = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };
  const fmtYMD = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(d.getDate()).padStart(2, "0")}`;
  };

  // 팝업에서 개별 주문만 FINISHED 처리
  const handleFinishOne = async (orderId) => {
    try {
      await setOrderStatus(orderId, "FINISHED");
      const data = await getTableOrders(boothId, tableId);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      alert("주문 완료 처리에 실패했습니다.");
    }
  };

  // ★ API 응답 형태에 맞춰 매핑 (플랫 + items + payment)
  const toCardProps = (o) => {
    const status = (o?.status || "").toUpperCase(); // PENDING | APPROVED | REJECTED | FINISHED
    const amount = o?.payment?.amount ?? o?.totalAmount ?? 0;

    return {
      tableNo: tableNumber,
      timeText: `${fmtYMD(o?.createdAt)} ${fmtHM(o?.createdAt)}`,
      active: true,
      orderStatus: status,
      items: (o?.items || []).map((it) => ({
        name: it.name,
        qty: it.quantity ?? 0,
      })),
      customerName: o?.payment?.payerName || "-",
      addAmount: amount,
      totalAmount: amount,
      onApprove: undefined,
      onReject: undefined,
      onClear: () => handleFinishOne(o?.orderId), // 이 주문만 FINISHED
      onReceiptClick: () => {},
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
        <List ref={listRef}>
          {sorted.map((o, i) => (
            <CardWrap
              key={o?.orderId ?? o?.id ?? `${i}`}
              ref={(el) => (colRefs.current[i] = el)}
            >
              <OrderCard {...toCardProps(o)} />
            </CardWrap>
          ))}
        </List>
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
  grid-auto-columns: 340px;
  gap: 18px;
  overflow-x: auto;
  padding: 8px 6px 6px 6px;
`;

const CardWrap = styled.div``;
