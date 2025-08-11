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

// === 라우트 리라이터 (여기에 /api 경로 매핑) ===
server.use(jsonServer.rewriter({
  '/api/booths/:boothId/menuItems': '/menuItems?boothId=:boothId',
  '/api/booths/:boothId/menuItems/:menuItemId': '/menuItems/:menuItemId',
  '/api/booths/:boothId/account': '/accounts?boothId=:boothId',

  '/api/menus': '/menuItems',
  '/api/menus/:menuId': '/menuItems/:menuId',
  '/api/menus/:menuId/total-orders': '/menuTotals?menuItemId=:menuId',
  '/api/menus/:menuId/available': '/menuItems/:menuId',

  '/api/orders': '/orders',
  '/api/orders/:orderId': '/orders/:orderId',
  '/api/orders/:orderId/detail': '/orderDetails?orderId=:orderId',

  '/api/tables': '/tables',
  '/api/tables/:tableId/latest-orders': '/latestOrders?tableId=:tableId',

  '/api/sales': '/salesDaily',
  '/api/sales/menu': '/menuSales',

  // catch-all: /api/* → /*  (프리픽스만 벗겨서 기본 컬렉션으로)
  '/api/*': '/$1'
}));

// 라우터 장착
server.use(router);

server.listen(PORT, () => {
  console.log(`✅ json-server mock running on http://localhost:${PORT}`);
});
