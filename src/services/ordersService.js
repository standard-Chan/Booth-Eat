// src/services/ordersService.js
// ✅ Manager 주문관리 서비스 (UI 로직 유지, API만 교체)
// - 모든 HTTP 호출은 src/services/orderApi.js 의 함수를 사용

import {
  getTablesByBooth,
  getLatestVisitOrderIds,
  getOrderDetail,
  getTableOrders,
  setOrderStatus,
  closeVisit,
} from "../api/manager/orderApi.js";


// (선택) 개발 편의용 지연
const MOCK_DELAY = 0;
const delay = (v, ms = MOCK_DELAY) =>
  new Promise((res) => setTimeout(() => res(v), ms));

// HH:MM 포맷
const hhmm = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

/* ---------------- group & summarize ----------------------- */
export function groupOrdersByVisit(orders) {
  const map = new Map(); // visit_id -> order[]
  for (const o of orders) {
    const key = o.customerOrder.visit_id;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(o);
  }
  return map;
}

export function summarizeVisitGroup(group) {
  const hasPending = group.some((o) => o.customerOrder.status === "PENDING");
  const status = hasPending ? "PENDING" : "APPROVED";

  const latest = [...group].sort(
    (a, b) =>
      +new Date(b.customerOrder.created_at) - +new Date(a.customerOrder.created_at)
  )[0];

  const timeText = hhmm(latest?.customerOrder?.created_at);
  const customerName = latest?.paymentInfo?.payer_name || "";
  const addAmount =
    latest?.paymentInfo?.amount ?? latest?.customerOrder?.total_amount ?? 0;
  const totalAmount = group.reduce(
    (sum, x) => sum + (x.paymentInfo?.amount ?? x.customerOrder.total_amount ?? 0),
    0
  );

  const itemsMap = new Map();
  for (const o of group) {
    for (const it of o.orderItems ?? []) {
      itemsMap.set(it.name, (itemsMap.get(it.name) || 0) + (it.quantity || 0));
    }
  }
  const items = [...itemsMap.entries()].map(([name, qty]) => ({ name, qty }));

  return {
    status,
    timeText,
    customerName,
    addAmount,
    totalAmount,
    items,
    visitId: latest?.customerOrder?.visit_id ?? null,
  };
}

/* ---------------- STEP 1: boothId → tables ---------------- */
/** 부스의 테이블 목록 조회 */
export async function fetchTables(boothId) {
  const rows = await getTablesByBooth(boothId);
  // 기대 응답: [{ tableId, tableNumber, active }, ...]
  return delay(
    rows.map((t) => ({
      tableId: t.tableId ?? t.id, // 방어적 매핑
      tableNumber: t.tableNumber,
      active: Boolean(t.active),
    }))
  );
}

/* ---------------- STEP 3: tableId → { orderIds } ---------- */
/** 테이블의 최신 방문에 해당하는 주문 ID 목록 */
export async function fetchOrderIdsByTable(tableId) {
  // 기대 응답: { orderIds: [...] }
  const data = await getLatestVisitOrderIds(tableId);
  const ids = Array.isArray(data?.orderIds) ? data.orderIds : [];
  console.log(ids);
  return delay({ orderIds: ids });
}

/* ---------------- STEP 4: orderIds → details -------------- */
/** 주문 상세(여러 개) 조회 */
export async function fetchOrderDetails(orderIds) {
  console.log(orderIds)
  if (!orderIds || orderIds.length === 0) return [];
  const details = (
    await Promise.all(orderIds.map((id) => getOrderDetail(id)))
  ).filter(Boolean);
  return delay(details);
}

/* ---------------- Orchestrator: booth → cards ------------- */
/** 부스 → 카드 목록 로딩 (UI 데이터 형태 유지) */
export async function loadCards(boothId) {
  const tables = await fetchTables(boothId);
  console.log(tables);
  const results = [];

  for (const t of tables) {
    if (!t.active) {
      results.push({
        tableId: t.tableId,
        tableNumber: t.tableNumber,
        active: false,
        orderStatus: undefined,
        items: [],
        customerName: "",
        addAmount: 0,
        totalAmount: 0,
        timeText: "",
        visitId: null,
        latestOrderId: null,
      });
      continue;
    }

    const { orderIds } = await fetchOrderIdsByTable(t.tableId);
    console.log(orderIds);
    if (!orderIds || orderIds.length === 0) {
      results.push({
        tableId: t.tableId,
        tableNumber: t.tableNumber,
        active: true,
        orderStatus: "PENDING",
        items: [],
        customerName: "",
        addAmount: 0,
        totalAmount: 0,
        timeText: "",
        visitId: null,
        latestOrderId: null,
      });
      continue;
    }

    const orders = await fetchOrderDetails(orderIds);
    
    console.log(orders);
    const groups = groupOrdersByVisit(orders);

    // 최신 방문(visit) 선택
    let latestGroup = null;
    let latestTs = -Infinity;
    groups.forEach((g) => {
      const maxTs = Math.max(
        ...g.map((x) => +new Date(x.customerOrder.created_at))
      );
      if (maxTs > latestTs) {
        latestTs = maxTs;
        latestGroup = g;
      }
    });

    const s = summarizeVisitGroup(latestGroup || []);
    const latestOrder = [...(latestGroup || [])].sort(
      (a, b) =>
        +new Date(b.customerOrder.created_at) -
        +new Date(a.customerOrder.created_at)
    )[0];

    results.push({
      tableId: t.tableId,
      tableNumber: t.tableNumber,
      active: true,
      orderStatus: latestOrder?.customerOrder?.status ?? s.status ?? "PENDING",
      items: s.items ?? [],
      customerName: s.customerName ?? "",
      addAmount: s.addAmount ?? 0,
      totalAmount: s.totalAmount ?? 0,
      timeText: s.timeText ?? "",
      visitId: s.visitId,
      latestOrderId: latestOrder?.customerOrder?.order_id ?? null,
    });
  }

  return results;
}

/* ---------------- 추가: 테이블별 주문 히스토리 ---------- */
/** 부스/테이블ID → 주문 히스토리(내림차순) */
export async function fetchOrderHistoryByTable(boothId, tableId) {
  // 기대 응답: [{ customerOrder, orderItems, paymentInfo }, ...]
  const rows = await getTableOrders(boothId, tableId);
  return (rows ?? []).sort(
    (a, b) =>
      +new Date(b.customerOrder.created_at) -
      +new Date(a.customerOrder.created_at)
  );
}

/* ---------------- 주문 상태 변경 ---------------- */
export async function updateOrderStatus(orderId, status) {
  // POST /api/manager/orders/{orderId}/status/{status}
  // body: { order_id, status }
  return setOrderStatus(orderId, status);
}

/* ---------------- 테이블 비우기(완료처리) --------------- */
export async function clearTable(tableId) {
  // POST /api/manager/tables/{tableId}/close-visit { tableId }
  return closeVisit(tableId);
}
