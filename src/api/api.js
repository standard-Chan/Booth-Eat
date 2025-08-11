// src/const/api.js

// 환경별 Base URL
export const BASE_URL = 'http://localhost:8080/api'; // 실제 서버 (배포 시 https://modney.shop/api)

// ========================
// 부스 & 메뉴 관련
// ========================
export const API_MENU = {
  // 1. 부스 메뉴 목록 조회
  GET_BOOTH_MENUS: (boothId) => `/booths/${boothId}/menuItems`,

  // 2. 단일 메뉴 조회
  GET_MENU_DETAIL: (boothId, menuItemId) => `/booths/${boothId}/menuItems/${menuItemId}`,

  // 3. 부스 계좌 정보 조회
  GET_BOOTH_ACCOUNT: (boothId) => `/booths/${boothId}/account`,

  // 4. 메뉴 추가
  CREATE_MENU: `/menus`,

  // 5. 메뉴 삭제
  DELETE_MENU: (menuItemId) => `/menus/${menuItemId}`,

  // 6. 메뉴 수정
  UPDATE_MENU: (menuItemId) => `/menus/${menuItemId}`,

  // 7. 부스의 특정 메뉴 총 주문량
  GET_MENU_TOTAL_ORDERS: (menuItemId) => `/menus/${menuItemId}/total-orders`,

  // 8. 메뉴 판매 상태 변경
  SET_MENU_AVAILABLE: (menuItemId) => `/menus/${menuItemId}/available`,
};

// ========================
// 주문 관련
// ========================
export const API_ORDER = {
  // 1. 주문 생성
  CREATE_ORDER: `/orders`,

  // 2. 주문 조회
  GET_ORDER: (orderId) => `/orders/${orderId}`,

  // 3. 주문 상태 변경
  UPDATE_ORDER_STATUS: `/orders/status`,

  // 4. 테이블 비우기(완료처리)
  CLEAR_TABLE: `/orders/clear`,

  // 5. 해당 booth의 테이블 정보
  GET_TABLES_BY_BOOTH: (boothId) => `/tables?boothId=${boothId}`,

  // 6. TableId의 최신 visit에 해당하는 주문 ID 목록
  GET_LATEST_ORDER_IDS_BY_TABLE: (tableId) => `/tables/${tableId}/latest-orders`,

  // 7. OrderId로 주문 상세 정보
  GET_ORDER_DETAIL: (orderId) => `/orders/${orderId}/detail`,

  // 8. 해당 테이블의 주문 내역
  GET_ORDERS_BY_TABLE: (boothId, tableId) => `/orders?boothId=${boothId}&tableId=${tableId}`,

  // 9. 테이블 생성
  CREATE_TABLE: `/tables`,
};

// ========================
// 매출 관리 관련
// ========================
export const API_SALES = {
  // 1. 부스 특정 날짜 판매 정보
  GET_SALES_BY_DATE: (boothId, date) => `/sales?boothId=${boothId}&date=${date}`,

  // 2. 부스 메뉴별 판매량
  GET_MENU_SALES: (boothId) => `/sales/menu?boothId=${boothId}`,
};
