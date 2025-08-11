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
        setOrders(data || []);
      } catch (e) {
        setError("주문 이력을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, boothId, tableId]);

  const sorted = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          +new Date(b?.customerOrder?.created_at || 0) -
          +new Date(a?.customerOrder?.created_at || 0)
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

  const handleFinishOne = async (orderId) => {
    try {
      await setOrderStatus(orderId, "FINISHED");
      const data = await getTableOrders(boothId, tableId);
      setOrders(data || []);
    } catch (e) {
      alert("주문 완료 처리에 실패했습니다.");
    }
  };

  const toCardProps = (o) => {
    const co = o?.customerOrder || {};
    const status = (co.status || "").toUpperCase();
    const amount = o?.paymentInfo?.amount ?? co?.total_amount ?? 0;

    return {
      tableNo: tableNumber,
      timeText: `${fmtYMD(co.created_at)} ${fmtHM(co.created_at)}`,
      active: true,
      orderStatus: status, // PENDING | APPROVED | REJECTED | FINISHED
      items: (o?.orderItems || []).map((it) => ({
        name: it.name,
        qty: it.quantity ?? it.qty ?? 0,
      })),
      customerName: o?.paymentInfo?.payer_name || "-",
      addAmount: amount,
      totalAmount: amount,
      onApprove: undefined,
      onReject: undefined,
      onClear: () => handleFinishOne(co.order_id), // 이 주문만 FINISHED
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
              key={o?.customerOrder?.order_id || `${i}`}
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
