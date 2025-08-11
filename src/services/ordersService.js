// src/services/manager/ordersMockService.js
// ⚠️ 실제 API 붙일 땐 아래 MOCK_* 을 제거하고 fetch/axios로 대체하면 됨.

// ---------------- MOCK DATA ----------------
const MOCK_TABLES = [
  { tableId: 1, tableNumber: 1, active: true },
  { tableId: 2, tableNumber: 2, active: true },
  { tableId: 3, tableNumber: 3, active: false },
  { tableId: 4, tableNumber: 4, active: true },
  { tableId: 5, tableNumber: 5, active: true },
  { tableId: 6, tableNumber: 6, active: true },
  { tableId: 7, tableNumber: 7, active: true },
  { tableId: 8, tableNumber: 8, active: true },
];

const MOCK_ORDERS = [
  // table 1, visit 10 (PENDING)
  {
    customerOrder: {
      order_id: 101, table_id: 1, visit_id: 10, status: "PENDING",
      order_code: "A101", total_amount: 18900, created_at: "2025-08-11T18:16:00+09:00",
    },
    orderItems: [
      { name: "오징어튀김", quantity: 1 },
      { name: "닭발", quantity: 1 },
      { name: "사이다", quantity: 1 },
    ],
    paymentInfo: { payer_name: "이시현", amount: 18900 },
  },
  // table 2, visit 20 (APPROVED) + 추가주문
  {
    customerOrder: {
      order_id: 201, table_id: 2, visit_id: 20, status: "APPROVED",
      order_code: "B201", total_amount: 14000, created_at: "2025-08-11T18:05:00+09:00",
    },
    orderItems: [
      { name: "김치볶음밥", quantity: 1 },
      { name: "떡볶이", quantity: 1 },
    ],
    paymentInfo: { payer_name: "홍길동", amount: 14000 },
  },
  {
    customerOrder: {
      order_id: 202, table_id: 2, visit_id: 20, status: "FINISHED",
      order_code: "B202", total_amount: 18900, created_at: "2025-08-11T18:16:00+09:00",
    },
    orderItems: [
      { name: "닭발", quantity: 1 },
      { name: "오징어튀김", quantity: 1 },
      { name: "사이다", quantity: 1 },
    ],
    paymentInfo: { payer_name: "홍길동", amount: 18900 },
  },
  // table 4, visit 40 (PENDING)
  {
    customerOrder: {
      order_id: 401, table_id: 4, visit_id: 40, status: "PENDING",
      order_code: "D401", total_amount: 18900, created_at: "2025-08-11T18:16:00+09:00",
    },
    orderItems: [
      { name: "김치볶음밥", quantity: 1 },
      { name: "오징어튀김", quantity: 1 },
    ],
    paymentInfo: { payer_name: "도경수", amount: 18900 },
  },
  // table 5, visit 50 (APPROVED)
  {
    customerOrder: {
      order_id: 501, table_id: 5, visit_id: 50, status: "APPROVED",
      order_code: "E501", total_amount: 14200, created_at: "2025-08-11T18:16:00+09:00",
    },
    orderItems: [
      { name: "김치볶음밥", quantity: 1 },
      { name: "오징어튀김", quantity: 1 },
    ],
    paymentInfo: { payer_name: "최준근", amount: 14200 },
  },
  // table 6, visit 60 (PENDING)
  {
    customerOrder: {
      order_id: 601, table_id: 6, visit_id: 60, status: "PENDING",
      order_code: "F601", total_amount: 12900, created_at: "2025-08-11T18:16:00+09:00",
    },
    orderItems: [
      { name: "김치볶음밥", quantity: 1 },
      { name: "사이다", quantity: 2 },
    ],
    paymentInfo: { payer_name: "김태희", amount: 12900 },
  },
  // table 7, visit 70 (PENDING)
  {
    customerOrder: {
      order_id: 701, table_id: 7, visit_id: 70, status: "PENDING",
      order_code: "G701", total_amount: 18900, created_at: "2025-08-11T18:16:00+09:00",
    },
    orderItems: [
      { name: "김치볶음밥", quantity: 1 },
      { name: "오징어튀김", quantity: 3 },
    ],
    paymentInfo: { payer_name: "이수지", amount: 18900 },
  },
  // table 8, visit 80 (PENDING)
  {
    customerOrder: {
      order_id: 801, table_id: 8, visit_id: 80, status: "PENDING",
      order_code: "H801", total_amount: 18900, created_at: "2025-08-11T18:16:00+09:00",
    },
    orderItems: [
      { name: "김치볶음밥", quantity: 1 },
      { name: "오징어튀김", quantity: 3 },
    ],
    paymentInfo: { payer_name: "박보검", amount: 18900 },
  },
];

// ---------------- helpers ----------------
const delay = (v, ms = 50) => new Promise(res => setTimeout(() => res(v), ms));
const hhmm = (iso) => {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

// ---------------- STEP 1: boothId → tables ----------------
export async function fetchTables(boothId) {
  // TODO: 실제 API 예시 → GET /manager/booths/:boothId/tables
  return delay(MOCK_TABLES);
}

// ---------------- STEP 3: tableId → { orderIds } ----------
export async function fetchOrderIdsByTable(tableId) {
  // TODO: 실제 API 예시 → GET /manager/tables/:tableId/orders/ids
  const orderIds = MOCK_ORDERS
    .filter((o) => o.customerOrder.table_id === tableId)
    .map((o) => o.customerOrder.order_id);
  return delay({ orderIds });
}

// ---------------- STEP 4: orderIds → details --------------
export async function fetchOrderDetails(orderIds) {
  // TODO: 실제 API 예시 → GET /manager/orders?ids=1,2,3
  const details = MOCK_ORDERS.filter((o) =>
    orderIds.includes(o.customerOrder.order_id)
  );
  return delay(details);
}

// ---------------- group & summarize -----------------------
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
      +new Date(b.customerOrder.created_at) -
      +new Date(a.customerOrder.created_at)
  )[0];

  const timeText = hhmm(latest.customerOrder.created_at);
  const customerName = latest.paymentInfo?.payer_name || "";
  const addAmount =
    latest.paymentInfo?.amount ?? latest.customerOrder.total_amount ?? 0;
  const totalAmount = group.reduce(
    (sum, x) =>
      sum + (x.paymentInfo?.amount ?? x.customerOrder.total_amount ?? 0),
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

// ---------------- Orchestrator: booth → cards -------------
export async function loadCards(boothId) {
  const tables = await fetchTables(boothId);
  const results = [];

  for (const t of tables) {
    if (!t.active) {
      results.push({ tableId: t.tableId, tableNumber: t.tableNumber, active: false });
      continue;
    }

    const { orderIds } = await fetchOrderIdsByTable(t.tableId);
    const orders = await fetchOrderDetails(orderIds);
    const groups = groupOrdersByVisit(orders);

    if (groups.size === 0) {
      results.push({
        tableId: t.tableId, tableNumber: t.tableNumber, active: true,
        orderStatus: "PENDING", items: [], customerName: "",
        addAmount: 0, totalAmount: 0, timeText: "", visitId: null,
      });
      continue;
    }

    // 최신 방문(visit) 선택
    let latestGroup = null;
    let latestTs = -Infinity;
    groups.forEach((g) => {
      const maxTs = Math.max(...g.map((x) => +new Date(x.customerOrder.created_at)));
      if (maxTs > latestTs) { latestTs = maxTs; latestGroup = g; }
    });

    const s = summarizeVisitGroup(latestGroup);

    results.push({
      tableId: t.tableId, tableNumber: t.tableNumber, active: true,
      orderStatus: s.status, items: s.items, customerName: s.customerName,
      addAmount: s.addAmount, totalAmount: s.totalAmount, timeText: s.timeText,
      visitId: s.visitId,
    });
  }

  return results;
}

export async function fetchOrderHistoryByTable(boothId, tableNumber) {
  // 실제 API 예시: GET /manager/booths/:boothId/tables/:tableNumber/orders/history
  const tables = await fetchTables(boothId);
  const table = tables.find(t => t.tableNumber === Number(tableNumber));
  if (!table) return delay([]);

  const list = MOCK_ORDERS
    .filter(o => o.customerOrder.table_id === table.tableId)
    .sort((a,b) => +new Date(b.customerOrder.created_at) - +new Date(a.customerOrder.created_at));

  return delay(list);
}