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

// ================================
// 1) Rewriter: /api → 실제 컬렉션
// ================================
server.use(jsonServer.rewriter({
  // ----- 공개(구매자) -----
  // 부스 메뉴 목록 / 단일
  '/api/booths/menus/:boothId': '/menus?boothId=:boothId',
  '/api/booth/menus/:boothId/:menuItemId': '/menus/:menuItemId',
  // 부스 계좌
  '/api/booths/:boothId/account': '/accounts?boothId=:boothId',
  // 주문 생성/조회
  '/api/orders': '/orders',
  '/api/orders/:orderId': '/orders/:orderId',

  // ----- 매니저 통계/랭킹 -----
  // 오늘 현황
  '/api/manager/stats/today': '/todayStats',
  // 메뉴 랭킹
  '/api/manager/rankings/menu': '/menuRankings',

  // ----- 개발/디버그 -----
  '/api/dev/table-context': '/devTableContexts',

  // ----- 주문 관리(리스트/조회 계열) -----
  // 부스의 테이블 목록
  '/api/booths/:boothId/tables': '/tables?boothId=:boothId',
  // 특정 테이블의 주문 이력 (부스+테이블)
  '/api/booths/:boothId/tables/:tableId/orders': '/orders?boothId=:boothId&tableId=:tableId',
  // 주문 단건 조회 (중복 매핑이지만 편의상 둠)
  '/api/manager/orders/:orderId': '/orders/:orderId',

  // ----- 메뉴 관리(쿼리/조회 계열) -----
  // 특정 메뉴 total-orders
  '/api/manager/booths/:boothId/menus/:menuItemId/metrics/total-orders': '/menuMetrics?boothId=:boothId&menuItemId=:menuItemId',
  // 메뉴 삭제/수정 기본 매핑
  '/api/manager/booths/:boothId/menus/:menuItemId': '/menus/:menuItemId',

  // ----- 매출 관리 -----
  // 특정 날짜 매출
  '/api/manager/booths/:boothId/stats/date/:yyyy': '/dateSales?boothId=:boothId&date=:yyyy',
  // 메뉴별 매출
  '/api/manager/booths/:boothId/stats/menu-sales': '/menuSales?boothId=:boothId',

  // 마지막: /api/* → /*  (프리픽스 제거)
  '/api/*': '/$1'
}));

// =============================================
// 2) Custom Handlers (스펙 맞춤 가공/상태변경)
// =============================================

// 오늘 현황: /api/manager/stats/today?boothId=&top=
server.get('/api/manager/stats/today', (req, res) => {
  const { boothId, top } = req.query;
  let rows = db.get('todayStats').value();
  if (boothId) rows = rows.filter(r => String(r.boothId) === String(boothId));
  if (top) rows = rows.slice(0, Number(top));
  return res.json(rows.length === 1 ? rows[0] : rows);
});

// 오늘 랭킹: /api/manager/rankings/menu?boothId=&metric=&limit=
server.get('/api/manager/rankings/menu', (req, res) => {
  const { boothId, metric, limit } = req.query;
  let rows = db.get('menuRankings').value();
  if (boothId) rows = rows.filter(r => String(r.boothId) === String(boothId));
  if (metric) rows = rows.filter(r => String(r.metric) === String(metric));
  if (limit) rows = rows.slice(0, Number(limit));
  return res.json(rows.length === 1 ? rows[0] : rows);
});

// 디버그 컨텍스트: /api/dev/table-context?boothId=&tableNo=
server.get('/api/dev/table-context', (req, res) => {
  const { boothId, tableNo } = req.query;
  let rows = db.get('devTableContexts').value();
  if (boothId) rows = rows.filter(r => String(r.boothId) === String(boothId));
  if (tableNo) rows = rows.filter(r => String(r.tableNo) === String(tableNo));
  return res.json(rows.length === 1 ? rows[0] : rows);
});

// 최신 visit의 주문 ID 목록: /api/tables/:tableId/visits/latest/orders
// 응답: { orderIds: [...] }
server.get('/api/tables/:tableId/visits/latest/orders', (req, res) => {
  const { tableId } = req.params;

  // visit 중 최신(시작시간 기준) OPEN을 찾는다.
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
server.post('/api/manager/orders/:orderId/status/:status', (req, res) => {
  const { orderId, status } = req.params;
  const allowed = ['PENDING', 'APPROVED', 'REJECTED', 'FINISHED'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'invalid status' });

  const row = db.get('orders').find({ orderId: Number(orderId) }).value();
  if (!row) return res.status(404).json({ message: 'order not found' });

  db.get('orders').find({ orderId: Number(orderId) }).assign({ status }).write();
  return res.status(200).json({ orderId: Number(orderId), status });
});

// 편의 엔드포인트: approve/reject/pending/finish
['approve', 'reject', 'pending', 'finish'].forEach(action => {
  server.post(`/api/manager/orders/:orderId/${action}`, (req, res) => {
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
server.post('/api/manager/tables/:tableId/close-visit', (req, res) => {
  const { tableId } = req.params;

  // 테이블 비활성화
  db.get('tables').find({ tableId: Number(tableId) }).assign({ active: false }).write();

  // OPEN visit이 있으면 CLOSED
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

// 테이블 생성: POST /api/manager/booths/:boothId/tables  (body 없음)
// - 해당 부스의 다음 tableNumber로 생성
server.post('/api/manager/booths/:boothId/tables', (req, res) => {
  const { boothId } = req.params;
  const tables = db.get('tables').filter({ boothId: Number(boothId) }).value();
  const nextNumber = tables.length ? Math.max(...tables.map(t => t.tableNumber)) + 1 : 1;

  // id/tableId 동기화
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
server.post('/api/manager/booths/:boothId/menus', (req, res) => {
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
server.post('/api/manager/menus/:menuItemId/toggle-available', (req, res) => {
  const { menuItemId } = req.params;
  const body = req.body || {};
  const row = db.get('menus').find({ menuItemId: Number(menuItemId) }).value();
  if (!row) return res.status(404).json({ message: 'menu not found' });

  const nextAvailable = typeof body.available === 'boolean' ? body.available : !row.available;
  db.get('menus').find({ menuItemId: Number(menuItemId) }).assign({ available: nextAvailable }).write();
  return res.status(200).json({ menuItemId: Number(menuItemId), available: nextAvailable });
});

// 매출: 특정 날짜
server.get('/api/manager/booths/:boothId/stats/date/:date', (req, res) => {
  const { boothId, date } = req.params;
  const row = db.get('dateSales').find({ boothId: Number(boothId), date }).value();
  if (!row) return res.json({ boothId: Number(boothId), date, totalSales: 0, orderNumbers: 0 });
  return res.json(row);
});

// 매출: 메뉴별
server.get('/api/manager/booths/:boothId/stats/menu-sales', (req, res) => {
  const { boothId } = req.params;
  const row = db.get('menuSales').find({ boothId: Number(boothId) }).value();
  return res.json(row || { boothId: Number(boothId), items: [] });
});

// 라우터 장착 (rewriter/커스텀 핸들 이후)
server.use(router);

server.listen(PORT, () => {
  console.log(`✅ json-server mock running on http://localhost:${PORT}`);
});
