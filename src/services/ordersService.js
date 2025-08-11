// src/services/manager/ordersMockService.js
// ✅ 실제 API 경로 사용 (json-server + 실제 서버 겸용)
//    - 경로/쿼리는 src/const/api.js 의 BASE_URL, API_ORDER 사용
//    - json-server일 때 배열([]) 응답은 1개 객체로 정규화 처리

import { API_ORDER, BASE_URL } from "../api/api.js";


const MOCK = true; // 더미 지연이 필요하면 true
const delay = (v, ms = 60) => (MOCK ? new Promise(res => setTimeout(() => res(v), ms)) : v);

// 공통 fetch 래퍼
async function req(path, opts = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    ...opts,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`[${res.status}] ${url} ${t}`);
  }
  return res;
}

// HH:MM 포맷
const hhmm = (iso) => {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

/* ---------------- STEP 1: boothId → tables ---------------- */
/** 부스의 테이블 목록 조회 */
export async function fetchTables(boothId) {
  // GET /api/tables?boothId=...
  const res = await req(API_ORDER.GET_TABLES_BY_BOOTH(boothId));
  const rows = await res.json();
  // db.json(tables): { id, tableId, boothId, tableNumber, active }
  const normalized = rows.map((t) => ({
    tableId: t.tableId ?? t.id,
    tableNumber: t.tableNumber,
    active: Boolean(t.active),
  }));
  return delay(normalized);
}

/* ---------------- STEP 3: tableId → { orderIds } ---------- */
/** 테이블의 최신 방문에 해당하는 주문 ID 목록 */
export async function fetchOrderIdsByTable(tableId) {
  // GET /api/tables/:tableId/latest-orders → routes: /latestOrders?tableId=:
  const res = await req(API_ORDER.GET_ORDER_IDS_BY_TABLE(tableId));
  const data = await res.json();
  const one = Array.isArray(data) ? (data[0] ?? { orderIds: [] }) : data;
  return delay({ orderIds: one.orderIds ?? [] });
}

/* ---------------- STEP 4: orderIds → details -------------- */
/** 주문 상세(여러 개) 조회 */
export async function fetchOrderDetails(orderIds) {
  if (!orderIds || orderIds.length === 0) return [];
  // /api/orders/:id/detail → routes: /orderDetails?orderId=:
  const promises = orderIds.map(async (id) => {
    const res = await req(API_ORDER.GET_ORDER_DETAIL(id));
    const data = await res.json();
    const one = Array.isArray(data) ? (data[0] ?? null) : data;
    return one;
  });
  const details = (await Promise.all(promises)).filter(Boolean);
  return delay(details);
}

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

  const timeText = hhmm(latest.customerOrder.created_at);
  const customerName = latest.paymentInfo?.payer_name || "";
  const addAmount =
    latest.paymentInfo?.amount ?? latest.customerOrder.total_amount ?? 0;
  const totalAmount = group.reduce(
    (sum, x) => sum + (x.paymentInfo?.amount ?? x.customerOrder.total_amount ?? 0),
    0
  );

  const itemsMap = new Map();
  for (const o of group) {
    for (const it of o.orderItems) {
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
    visitId: latest.customerOrder.visit_id,
  };
}

/* ---------------- Orchestrator: booth → cards ------------- */
/** 부스 → 카드 목록 로딩 */
export async function loadCards(boothId) {
  const tables = await fetchTables(boothId);
  const results = [];

  // table 구조
  // [
  //   {
  //       "tableId": 1,
  //       "tableNumber": 1,
  //       "active": true
  //   },...]

  for (const t of tables) {
    if (!t.active) { // 활성화 상태 아닌 경우 pass
      results.push({ tableId: t.tableId, tableNumber: t.tableNumber, active: false });
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
        latestOrderId: null, // ✅ 추가
      });
      continue;
    }

    const orders = await fetchOrderDetails(orderIds);
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

    const s = summarizeVisitGroup(latestGroup);

    // 최신 주문(동일 visit 내 최종)
    const latestOrder = [...latestGroup].sort(
      (a, b) =>
        +new Date(b.customerOrder.created_at) -
        +new Date(a.customerOrder.created_at)
    )[0];

    results.push({
      tableId: t.tableId,
      tableNumber: t.tableNumber,
      active: true,
      orderStatus: latestOrder?.customerOrder?.status ?? s.status,
      items: s.items,
      customerName: s.customerName,
      addAmount: s.addAmount,
      totalAmount: s.totalAmount,
      timeText: s.timeText,
      visitId: s.visitId,
      latestOrderId: latestOrder?.customerOrder?.order_id ?? null, // ✅ 추가
    });
  }

  return results;
}

/* ---------------- 추가: 테이블별 주문 히스토리 ---------- */
/** 부스/테이블ID → 주문 히스토리(내림차순) */
export async function fetchOrderHistoryByTable(boothId, tableId) {
  // /api/orders?boothId=:&tableId=:
  const path = API_ORDER.GET_ORDERS_BY_TABLE(boothId, tableId);
  const res = await req(path);
  const rows = await res.json();

  // rows: [{ id(orderId), tableNo, status, items[], payment{}, amount, createdAt, ... }]
  const list = rows
    .map((o) => ({
      customerOrder: {
        order_id: o.id,
        table_id: o.tableId ?? o.tableNo ?? tableId,
        visit_id: o.visitId ?? o.visit_id ?? 0,
        status: o.status,
        order_code: o.order_code ?? `ORD-${o.id}`,
        total_amount: o.amount ?? o.total_amount ?? 0,
        created_at: o.createdAt ?? o.created_at,
        approved_at: o.approvedAt ?? o.approved_at ?? null,
      },
      orderItems: (o.items ?? []).map((it) => ({
        name: it.name,
        quantity: it.quantity,
      })),
      paymentInfo: {
        payer_name: o.payment?.payerName ?? o.paymentInfo?.payer_name ?? "",
        amount: o.payment?.amount ?? o.amount ?? 0,
      },
    }))
    .sort(
      (a, b) =>
        +new Date(b.customerOrder.created_at) -
        +new Date(a.customerOrder.created_at)
    );

  return list;
}

/* ---------------- 주문 상태 변경 ---------------- */
/**
 * 주문 상태 변경 (PENDING, APPROVED, REJECTED, FINISHED)
 * 우선 실제 경로(POST /orders/status) 사용, json-server면 PATCH /orders/:id 로 폴백
 */
export async function updateOrderStatus(orderId, status) {
  console.log(orderId);
  // 1) 실제 서버 규격: POST /api/orders/status  { order_id, status }

  const res = await req(API_ORDER.UPDATE_ORDER_STATUS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, status }),
  });
  // 실제 서버는 200/204 가정
  try { return delay(await res.json()); } catch { return delay(true); }
}

/* ---------------- 테이블 비우기(완료처리) ---------------- */
/**
 * 테이블 비우기 (active=false)
 * 실제 규격: POST /orders/clear { tableId }
 * json-server 폴백: PATCH /tables/:tableId { active:false }
 */
export async function clearTable(tableId) {
  // 1) 실제 서버 규격
  try {
    const res = await req(API_ORDER.CLEAR_TABLE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId }),
    });
    try { return delay(await res.json()); } catch { return delay(true); }
  } catch (e) {
    // 2) json-server 폴백
    const res = await req(`/tables/${tableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: false }),
    });
    return delay(await res.json());
  }
}
