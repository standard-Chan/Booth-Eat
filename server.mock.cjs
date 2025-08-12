// server.mock.cjs
const jsonServer = require('json-server');

const PORT = 8080;
const DELAY_MS = 200;

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// 기본 미들웨어(CORS/로거/정적파일)
server.use(middlewares);
// 딜레이
server.use((req, res, next) => setTimeout(next, DELAY_MS));
// JSON body 파서
server.use(jsonServer.bodyParser);

// 유틸: DB 핸들
const db = router.db;

// 유틸: '/api/...'와 '/...' 둘 다 매칭되도록
const apiPaths = (p) => [p, p.replace(/^\/api/, '')];

// 주문 생성: POST /api/orders
server.post(apiPaths('/api/orders'), (req, res) => {
  const body = req.body || {};
  const { boothId, tableNo, items = [], payment = {} } = body;

  // --- 기본 검증 ---
  if (!boothId || !tableNo || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'boothId, tableNo, items는 필수입니다.' });
  }

  // --- 테이블 찾기 (boothId + tableNo) ---
  const tableRow = db.get('tables')
    .find({ boothId: Number(boothId), tableNumber: Number(tableNo) })
    .value();

  if (!tableRow) {
    return res.status(404).json({ message: `테이블을 찾을 수 없습니다. (boothId=${boothId}, tableNo=${tableNo})` });
  }
  const tableId = tableRow.tableId;

  // --- 최신 OPEN visit 찾기, 없으면 새로 생성 ---
  let openVisit = db.get('visits')
    .filter(v => String(v.tableId) === String(tableId) && v.status === 'OPEN')
    .sortBy(v => v.startedAt)
    .value()
    .pop();

  if (!openVisit) {
    const visits = db.get('visits').value();
    const nextVisitId = visits.length ? Math.max(...visits.map(v => v.visitId || v.id || 0)) + 1 : 1;
    const newVisit = {
      id: nextVisitId,
      visitId: nextVisitId,
      tableId,
      status: 'OPEN',
      startedAt: new Date().toISOString(),
    };
    db.get('visits').push(newVisit).write();
    openVisit = newVisit;
  }
  const visitId = openVisit.visitId+1;

  // --- 금액 계산 (요청에 payment.amount가 있으면 우선, 없으면 items 합계) ---
  const itemsNorm = items.map(it => ({
    foodId: Number(it.foodId),
    name: it.name ?? null,
    price: Number(it.price ?? 0),
    imageUrl: it.imageUrl ?? null,
    quantity: Number(it.quantity ?? 1),
  }));
  const itemsTotal = itemsNorm.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const totalAmount = Number(payment.amount ?? itemsTotal);

  // --- orderId/id 생성 ---
  const orders = db.get('orders').value();
  const nextOrderId = orders.length ? Math.max(...orders.map(o => o.orderId || o.id || 0)) + 1 : 1;

  // --- 주문코드 생성 (예: BE-YYYYMMDD-000123) ---
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const orderCode = `BE-${y}${m}${d}-${String(nextOrderId).padStart(6, '0')}`;

  // --- 레코드 생성 ---
  const newOrder = {
    id: nextOrderId,
    orderId: nextOrderId,
    boothId: Number(boothId),
    tableId,
    visitId,
    status: 'PENDING',                 // 항상 PENDING으로 시작
    orderCode,
    totalAmount,
    createdAt: now.toISOString(),
    approvedAt: null,
    tableNo: Number(tableNo),
    items: itemsNorm,
    payment: {
      payerName: payment.payerName ?? null,
      amount: totalAmount,
    },
  };

  db.get('orders').push(newOrder).write();

  // --- 응답 (스펙대로 최소 필드만) ---
  return res.status(201).json({
    orderId: newOrder.orderId,
    status: newOrder.status,
    amount: newOrder.totalAmount,
    createdAt: newOrder.createdAt,
  });
});


// =============================================
// 1) Custom Handlers (스펙 맞춤 가공/상태변경) - rewriter보다 먼저!!
// =============================================

// 오늘 현황: /api/manager/stats/today?boothId=&top=
server.get(apiPaths('/api/manager/stats/today'), (req, res) => {
  const { boothId, top } = req.query;
  let rows = db.get('todayStats').value();
  if (boothId) rows = rows.filter(r => String(r.boothId) === String(boothId));
  if (top) rows = rows.slice(0, Number(top));
  return res.json(rows.length === 1 ? rows[0] : rows);
});

// 오늘 랭킹: /api/manager/rankings/menu?boothId=&metric=&limit=
server.get(apiPaths('/api/manager/rankings/menu'), (req, res) => {
  const { boothId, metric, limit } = req.query;
  let rows = db.get('menuRankings').value();
  if (boothId) rows = rows.filter(r => String(r.boothId) === String(boothId));
  if (metric) rows = rows.filter(r => String(r.metric) === String(metric));
  if (limit) rows = rows.slice(0, Number(limit));
  return res.json(rows.length === 1 ? rows[0] : rows);
});

// 디버그 컨텍스트: /api/dev/table-context?boothId=&tableNo=
server.get(apiPaths('/api/dev/table-context'), (req, res) => {
  const { boothId, tableNo } = req.query;
  let rows = db.get('devTableContexts').value();
  if (boothId) rows = rows.filter(r => String(r.boothId) === String(boothId));
  if (tableNo) rows = rows.filter(r => String(r.tableNo) === String(tableNo));
  return res.json(rows.length === 1 ? rows[0] : rows);
});

// 최신 visit의 주문 ID 목록: /api/tables/:tableId/visits/latest/orders
server.get(apiPaths('/api/tables/:tableId/visits/latest/orders'), (req, res) => {
  const { tableId } = req.params;

  const visits = db.get('visits')
    .filter(v => String(v.tableId) === String(tableId) && v.status === 'OPEN')
    .sortBy(v => v.startedAt)
    .value();

  const latest = visits[visits.length - 1];
  if (!latest) return res.json({ orderIds: [] });

  const orders = db.get('orders')
    .filter(o => String(o.tableId) === String(tableId) && String(o.visitId) === String(latest.visitId))
    .sortBy(o => o.createdAt)
    .value();

  const orderIds = orders.map(o => o.orderId);
  return res.json({ orderIds });
});

// 주문 상태 변경(일반형): POST /api/manager/orders/:orderId/status/:status
server.post(apiPaths('/api/manager/orders/:orderId/status/:status'), (req, res) => {
  const { orderId, status } = req.params;
  const allowed = ['PENDING', 'APPROVED', 'REJECTED', 'FINISHED'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'invalid status' });

  const row = db.get('orders').find({ orderId: Number(orderId) }).value();
  if (!row) return res.status(404).json({ message: 'order not found' });

  db.get('orders').find({ orderId: Number(orderId) }).assign({ status }).write();
  return res.status(200).json({ orderId: Number(orderId), status });
});

// 편의 엔드포인트: approve/reject/pending/finish
;['approve', 'reject', 'pending', 'finish'].forEach(action => {
  server.post(apiPaths(`/api/manager/orders/:orderId/${action}`), (req, res) => {
    const map = { approve: 'APPROVED', reject: 'REJECTED', pending: 'PENDING', finish: 'FINISHED' };
    const status = map[action];
    const { orderId } = req.params;

    const row = db.get('orders').find({ orderId: Number(orderId) }).value();
    if (!row) return res.status(404).json({ message: 'order not found' });

    db.get('orders').find({ orderId: Number(orderId) }).assign({ status }).write();
    return res.status(200).json({ orderId: Number(orderId), status });
  });
});

// 비우기(visit 종료): POST /api/manager/tables/:tableId/close-visit
server.post(apiPaths('/api/manager/tables/:tableId/close-visit'), (req, res) => {
  const { tableId } = req.params;

  db.get('tables').find({ tableId: Number(tableId) }).assign({ active: false }).write();

  const openVisit = db.get('visits')
    .filter(v => String(v.tableId) === String(tableId) && v.status === 'OPEN')
    .sortBy(v => v.startedAt)
    .value()
    .pop();

  if (openVisit) {
    db.get('visits').find({ id: openVisit.id })
      .assign({ status: 'CLOSED', closedAt: new Date().toISOString() })
      .write();
  }

  return res.status(200).json({ tableId: Number(tableId), closed: !!openVisit });
});

// 테이블 생성: POST /api/manager/booths/:boothId/tables
server.post(apiPaths('/api/manager/booths/:boothId/tables'), (req, res) => {
  const { boothId } = req.params;
  const tables = db.get('tables').filter({ boothId: Number(boothId) }).value();
  const nextNumber = tables.length ? Math.max(...tables.map(t => t.tableNumber)) + 1 : 1;

  const allTables = db.get('tables').value();
  const nextId = allTables.length ? Math.max(...allTables.map(t => t.id)) + 1 : 1;

  const newRow = {
    id: nextId,
    tableId: nextId,
    boothId: Number(boothId),
    tableNumber: nextNumber,
    active: true
  };

  db.get('tables').push(newRow).write();
  return res.status(201).json(newRow);
});

// 메뉴 추가: POST /api/manager/booths/:boothId/menus
server.post(apiPaths('/api/manager/booths/:boothId/menus'), (req, res) => {
  const { boothId } = req.params;
  const body = req.body || {};

  const menus = db.get('menus').value();
  const nextId = menus.length ? Math.max(...menus.map(m => m.id)) + 1 : 1;

  const newMenu = {
    id: nextId,
    menuItemId: nextId,
    boothId: Number(boothId),
    name: body.name ?? '메뉴',
    price: Number(body.price ?? 0),
    available: body.available ?? true,
    modelUrl: body.modelUrl ?? null,
    previewImage: body.previewImage ?? null,
    description: body.description ?? null,
    category: body.category ?? 'FOOD'
  };

  db.get('menus').push(newMenu).write();
  return res.status(201).json(newMenu);
});

// 메뉴 available 토글: POST /api/manager/menus/:menuItemId/toggle-available
server.post(apiPaths('/api/manager/menus/:menuItemId/toggle-available'), (req, res) => {
  const { menuItemId } = req.params;
  const body = req.body || {};
  const row = db.get('menus').find({ menuItemId: Number(menuItemId) }).value();
  if (!row) return res.status(404).json({ message: 'menu not found' });

  const nextAvailable = typeof body.available === 'boolean' ? body.available : !row.available;
  db.get('menus').find({ menuItemId: Number(menuItemId) }).assign({ available: nextAvailable }).write();
  return res.status(200).json({ menuItemId: Number(menuItemId), available: nextAvailable });
});

// 매출: 특정 날짜
server.get(apiPaths('/api/manager/booths/:boothId/stats/date/:date'), (req, res) => {
  const { boothId, date } = req.params;
  const row = db.get('dateSales').find({ boothId: Number(boothId), date }).value();
  if (!row) return res.json({ boothId: Number(boothId), date, totalSales: 0, orderNumbers: 0 });
  return res.json(row);
});

// 매출: 메뉴별
server.get(apiPaths('/api/manager/booths/:boothId/stats/menu-sales'), (req, res) => {
  const { boothId } = req.params;
  const row = db.get('menuSales').find({ boothId: Number(boothId) }).value();
  return res.json(row || { boothId: Number(boothId), items: [] });
});

// ================================
// 2) Rewriter: /api → 실제 컬렉션 (router 직전)
// ================================
server.use(jsonServer.rewriter({
  // ----- 공개(구매자) -----
  '/api/:boothId/booths/menus': '/menus?boothId=:boothId',
  '/api/booth/:boothId/menus/:menuItemId': '/menus/:menuItemId',
  '/api/booths/:boothId/account': '/accounts?boothId=:boothId',
  '/api/orders': '/orders',
  '/api/orders/:orderId': '/orders/:orderId',

  // ----- 매니저 통계/랭킹 -----
  '/api/manager/stats/today': '/todayStats',
  '/api/manager/rankings/menu': '/menuRankings',

  // ----- 개발/디버그 -----
  '/api/dev/table-context': '/devTableContexts',

  // ----- 주문 관리(리스트/조회 계열) -----
  '/api/booths/:boothId/tables': '/tables?boothId=:boothId',
  '/api/booths/:boothId/tables/:tableId/orders': '/orders?boothId=:boothId&tableId=:tableId',
  '/api/manager/orders/:orderId': '/orders/:orderId',

  // ----- 메뉴 관리(쿼리/조회 계열) -----
  '/api/manager/booths/:boothId/menus/:menuItemId/metrics/total-orders': '/menuMetrics?boothId=:boothId&menuItemId=:menuItemId',
  '/api/manager/booths/:boothId/menus/:menuItemId': '/menus/:menuItemId',

  // ----- 매출 관리 -----
  '/api/manager/booths/:boothId/stats/date/:date': '/dateSales?boothId=:boothId&date=:date',
  '/api/manager/booths/:boothId/stats/menu-sales': '/menuSales?boothId=:boothId',

  // 마지막: /api/* → /*  (프리픽스 제거)
  '/api/*': '/$1'
}));

// 라우터 장착 (rewriter 이후)
server.use(router);

server.listen(PORT, () => {
  console.log(`✅ json-server mock running on http://localhost:${PORT}`);
});
