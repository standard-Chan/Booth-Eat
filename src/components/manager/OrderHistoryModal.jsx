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

  const reload = async () => {
    const data = await getTableOrders(boothId, tableId);
    setOrders(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!open || !boothId || !tableId) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        await reload();
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
        (a, b) => +new Date(b?.createdAt || 0) - +new Date(a?.createdAt || 0)
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

  // 공통 상태 변경 함수
  const handleSetStatus = async (orderId, next) => {
    try {
      await setOrderStatus(orderId, next);
      await reload();
    } catch (e) {
      alert(`주문 상태 변경 실패: ${next}`);
    }
  };

  // ★ API 응답 형태에 맞춰 매핑 (플랫 + items + payment)
  const toCardProps = (o) => {
    const status = (o?.customerOrder.status || "").toUpperCase(); // PENDING | APPROVED | REJECTED | FINISHED
    const amount = o?.payment?.amount ?? o?.totalAmount ?? 0;
    const id = o?.customerOrder.order_id ?? o?.id;

    const result = {
      tableNo: tableNumber,
      timeText: `${fmtYMD(o?.createdAt)} ${fmtHM(o?.createdAt)}`,
      orderId : id,
      active: true,
      orderStatus: status,
      items: (o?.orderItems || []).map((it) => ({
        name: it.name,
        qty: it.quantity ?? 0,
      })),
      customerName: o?.paymentInfo?.payer_name || "-",
      addAmount: "-",
      totalAmount: o?.paymentInfo.amount,
      onApprove: () => handleSetStatus(id, "APPROVED"),
      onReject: () => handleSetStatus(id, "REJECTED"),
      onClear: () => handleSetStatus(id, "FINISHED"),
      onReceiptClick: () => {},
    };
    return result;
  };


  return (
    <Modal open={open} title={`테이블 ${tableNumber}`} onClose={onClose}>
      {loading && <Empty>불러오는 중…</Empty>}
      {error && <Empty>{error}</Empty>}
      {!loading && !error && sorted.length === 0 && (
        <Empty>이 테이블의 주문 이력이 없습니다.</Empty>
      )}
      {console.log(sorted)}
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


/**
 * 
 * {
    "customerOrder": {
        "order_id": 5,
        "table_id": 1,
        "visit_id": 1,
        "status": "PENDING",
        "order_code": "BE-20250812-000005",
        "total_amount": 15000,
        "created_at": "2025-08-12T06:38:46.370645Z",
        "approved_at": null
    },
    "orderItems": [
        {
            "name": "치즈핫도그",
            "quantity": 3
        }
    ],
    "paymentInfo": {
        "payer_name": "ㅇㄴㅇㄴㅁ",
        "amount": 15000
    }
}
 */
