// src/const/api.js

// ========================
// Base URL
//   - 로컬: http://localhost:8080/api
//   - 배포: https://modney.shop/api (동일 path 사용)
// ========================

export const BASE_URL = process.env.BASE_URL || 'https://modney.shop/api';  // 'http://localhost:8080/api'
// 배포 시 'https://modney.shop/api'
export const OPENAI_API_KEY = process.env.REACT_APP_OPEN;

// path → 완전한 URL을 원할 때 사용 (axios/fetch에 바로 넣어도 됨)
export const toURL = (path) => `${BASE_URL}${path}`;
console.log(`baseurl : ${BASE_URL}`);

if (!OPENAI_API_KEY) {
  console.warn('⚠️');
}

// 안전한 쿼리 문자열 빌더 (undefined/null은 자동 제거)
const qs = (paramsObj = {}) =>
  Object.entries(paramsObj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

// ---------------------------------------------------------------------
// 1) 공개 메뉴/주문 API (구매자 측)
// ---------------------------------------------------------------------
export const API_PUBLIC = {
  // 1. 부스 메뉴 목록 조회
  // ⚠️ 스펙: GET /api/booths/menus/{boothId}
  LIST_MENUS_BY_BOOTH: (boothId) => `/booths/${boothId}/menus`,

  // 2. 단일 메뉴 조회
  // ⚠️ 스펙: GET /api/booth/menus/{boothId}/{menuItemId} (booth 단수 주의)
  GET_MENU_DETAIL: (boothId, menuItemId) => `/booth/${boothId}/menus/${menuItemId}`,

  // 3. 부스 계좌 정보 조회
  // GET /api/booths/{boothId}/account
  GET_BOOTH_ACCOUNT: (boothId) => `/booths/${boothId}/account`,

  // 4. 주문 생성
  // POST /api/orders
  // Body 예시:
  // {
  //   "boothId":1,"tableNo":7,
  //   "items":[{"foodId":11,"name":"오징어튀김","price":7000,"imageUrl":"url","quantity":2}, ...],
  //   "payment":{"payerName":"정석찬","amount":43000}
  // }
  CREATE_ORDER: () => `/orders`,

  // 5. 주문 단건 조회
  // GET /api/orders/{orderId}
  GET_ORDER_DETAIL: (orderId) => `/orders/${orderId}`,

  // 6. (보류) 실시간 주문 상태 업데이트 (SSE)
  // GET /api/orders/stream?boothId=1
  // 응답: text/event-stream
  STREAM_ORDER_UPDATES_SSE: (boothId) =>
    `/orders/stream?${qs({ boothId })}`,
};

// ---------------------------------------------------------------------
// 2) 매니저 대시보드 / 통계 (오늘 집계/랭킹, 디버그)
// ---------------------------------------------------------------------
export const API_MANAGER_STATS = {
  // 오늘 기준 현황(승인건만)
  // GET /api/manager/stats/today?boothId={id}&top={n}
  // GET_TODAY_STATS: (boothId, top) =>
  //   `/manager/stats/today?${qs({ boothId, top })}`,

  // 오늘의 메뉴 랭킹
  // GET /api/manager/rankings/menu?boothId={id}&limit={n}
  GET_TODAY_MENU_RANKING: (boothId, limit) =>
    `/manager/rankings/menu?${qs({ boothId, limit })}`,

  // 개발/디버그용 테이블 컨텍스트
  // GET /api/dev/table-context?boothId={id}&tableNo={no}
  GET_TABLE_CONTEXT_DEBUG: (boothId, tableNo) =>
    `/dev/table-context?${qs({ boothId, tableNo })}`,
};

// ---------------------------------------------------------------------
// 3) 주문 관리 (매니저)
// ---------------------------------------------------------------------
export const API_MANAGER_ORDERS = {
  // 주문 상태 변경(두 가지 형태 모두 지원)
  // ① POST /api/manager/orders/{orderId}/status/{status}
  //    status: PENDING | APPROVED | REJECTED | FINISHED
  SET_STATUS: (orderId, status) => `/manager/orders/${orderId}/status/${status}`,

  // ② 예시 엔드포인트 (approve/reject/pending/finish)
  APPROVE: (orderId) => `/manager/orders/${orderId}/approve`,
  REJECT: (orderId) => `/manager/orders/${orderId}/reject`,
  PENDING: (orderId) => `/manager/orders/${orderId}/pending`,
  FINISH: (orderId) => `/manager/orders/${orderId}/finish`,

  // 테이블 비우기(현재 visit close, active=false)
  // POST /api/manager/tables/{tableId}/close-visit
  CLOSE_VISIT: (tableId) => `/manager/tables/${tableId}/close-visit`,

  // 부스의 테이블 목록 가져오기
  // GET /api/booths/{boothId}/tables
  GET_TABLES_BY_BOOTH: (boothId) => `/booths/${boothId}/tables`,

  // 해당 TableId의 최신 visit에 해당하는 주문 ID 목록
  // GET /api/tables/{tableId}/visits/latest/orders
  GET_LATEST_VISIT_ORDER_IDS: (tableId) =>
    `/tables/${tableId}/visits/latest/orders`,

  // 특정 부스-테이블의 주문 이력 전체
  // GET /api/booths/{boothId}/tables/{tableId}/orders
  GET_TABLE_ORDERS: (boothId, tableId) =>
    `/booths/${boothId}/tables/${tableId}/orders`,

  // (중복이지만, 구매자 API와 동일 경로) 주문 단건 조회
  GET_ORDER_DETAIL: (orderId) => `/orders/${orderId}`,

  // 테이블 생성 (프런트에서 body 없음)
  // POST /api/manager/booths/{boothId}/tables
  CREATE_TABLE: (boothId) => `/manager/booths/${boothId}/tables`,
};

// ---------------------------------------------------------------------
// 4) 메뉴 관리 (매니저)
// ---------------------------------------------------------------------
export const API_MANAGER_MENUS = {
  // 메뉴 추가
  // POST /api/manager/booths/{boothId}/menus
  // Body:
  // { boothId, name, price, available, previewImage, description, category }
  ADD_MENU: (boothId) => `/manager/booths/${boothId}/menus`,

  // 메뉴 삭제
  // DELETE /api/manager/booths/{boothId}/menus/{menuItemId}
  DELETE_MENU: (boothId, menuItemId) =>
    `/manager/booths/${boothId}/menus/${menuItemId}`,

  // 메뉴 수정 (부분 수정)
  // PATCH /api/manager/booths/{boothId}/menus/{menuItemId}
  UPDATE_MENU: (boothId, menuItemId) =>
    `/manager/booths/${boothId}/menus/${menuItemId}`,

  // 특정 메뉴의 총 주문량
  // GET /api/manager/booths/{boothId}/menus/{menuItemId}/metrics/total-orders
  GET_MENU_TOTAL_ORDERS: (boothId, menuItemId) =>
    `/manager/booths/${boothId}/menus/${menuItemId}/metrics/total-orders`,

  // 메뉴 판매 가능(available) 토글
  // POST /api/manager/menus/{menuItemId}/toggle-available
  TOGGLE_AVAILABLE: (menuItemId) =>
    `/manager/menus/${menuItemId}/toggle-available`,
};

// ---------------------------------------------------------------------
// 5) 매출 관리 (매니저)
// ---------------------------------------------------------------------
export const API_MANAGER_SALES = {
  // 부스 특정 날짜 판매 정보
  // GET /api/manager/booths/{boothId}/stats/date/{yyyy-MM-dd}
  GET_DATE_SALES: (boothId, yyyyMMdd) =>
    `/manager/booths/${boothId}/stats/date/${yyyyMMdd}`,

  // 부스 메뉴별 판매액 합계(기간 구분 없음, 스펙 그대로)
  // GET /api/manager/booths/{boothId}/stats/menu-sales
  GET_MENU_SALES: (boothId) => `/manager/booths/${boothId}/stats/menu-sales`,
};


// ---------------------------------------------------------------------
// 6) 부스 매니저 설정 (어드민)
// ---------------------------------------------------------------------
export const API_ADMIN_MANAGER = {
  // 매니저 생성 (최초 1회)
  // POST /api/admin/booths/{boothId}/manager
  CREATE_MANAGER: (boothId) => `/admin/booths/${boothId}/manager`,

  // 매니저 정보 조회
  // GET /api/admin/booths/{boothId}/manager
  GET_MANAGER: (boothId) => `/admin/booths/${boothId}/manager`,
};

// ---------------------------------------------------------------------
// 5-1) 통합 통계 (매니저)
// ---------------------------------------------------------------------
export const API_MANAGER_STATS_EXT = {
  // 1. 모든 booth의 특정 날짜 판매량 정보
  // GET /api/manager/booths/stats/date/{yyyy-MM-dd}
  GET_ALL_BOOTH_DATE_SALES: (yyyyMMdd) =>
    `/manager/booths/stats/date/${yyyyMMdd}`,

  // 2. 모든 부스의 특정 날짜의 판매 정보
  // GET /api/manager/order/stats/date/{yyyy-MM-dd}
  GET_ALL_BOOTH_ORDER_STATS: (yyyyMMdd) =>
    `/manager/order/stats/date/${yyyyMMdd}`,

  // 3. 특정 날짜의 모든 visit 시간
  // GET /api/manager/tableVisit/stats/date/{yyyy-MM-dd}
  GET_VISIT_TIMES_BY_DATE: (yyyyMMdd) =>
    `/manager/tableVisit/stats/date/${yyyyMMdd}`,
};