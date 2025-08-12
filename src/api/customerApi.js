import { API_PUBLIC, BASE_URL as BASE } from "./api.js";
import axios from "axios";


// BASE_URL 안전 기본값
const BASE_URL = BASE || "http://localhost:8080/api";

// --------------------------------------------------
// axios 인스턴스
// --------------------------------------------------
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// dev 에러 로깅
if (process.env.NODE_ENV !== "production") {
  client.interceptors.response.use(
    (res) => res,
    (err) => {
      const url = `${err?.config?.baseURL || ""}${err?.config?.url || ""}`;
      // eslint-disable-next-line no-console
      console.warn(
        `[API ERROR] ${err?.response?.status || ""} ${url}`,
        err?.response?.data || err?.message
      );
      return Promise.reject(err);
    }
  );
}

// --------------------------------------------------
// 간단 가드
// --------------------------------------------------
function assertNumber(name, v) {
  if (v === null || v === undefined || Number.isNaN(Number(v)))
    throw new Error(`'${name}'(number) 값이 유효하지 않습니다: ${v}`);
}
function assertPositiveInt(name, v) {
  assertNumber(name, v);
  if (Number(v) <= 0) throw new Error(`'${name}'는 양수여야 합니다: ${v}`);
}
function assertString(name, v) {
  if (typeof v !== "string" || !v.trim())
    throw new Error(`'${name}'(string) 값이 유효하지 않습니다: ${v}`);
}

// --------------------------------------------------
// API 함수 (api.js의 API_PUBLIC 사용)
// --------------------------------------------------

/** 부스 메뉴 목록 조회 */
export async function listMenusByBooth(boothId) {
  assertPositiveInt("boothId", boothId);
  const { data } = await client.get(API_PUBLIC.LIST_MENUS_BY_BOOTH(boothId));
  return data; // Array<MenuItem>
}

/** 단일 메뉴 조회 (/booth/menus … booth 단수 주의) */
export async function getMenuDetail(boothId, menuItemId) {
  assertPositiveInt("boothId", boothId);
  assertPositiveInt("menuItemId", menuItemId);
  const { data } = await client.get(API_PUBLIC.GET_MENU_DETAIL(boothId, menuItemId));
  return data; // MenuItem
}

/** 부스 계좌 정보 조회 */
export async function getBoothAccount(boothId) {
  assertPositiveInt("boothId", boothId);
  const { data } = await client.get(API_PUBLIC.GET_BOOTH_ACCOUNT(boothId));
  return data; // { bank, account, accountHolder }
}

/** 주문 생성 */
export async function createOrder(payload) {
  if (!payload || typeof payload !== "object")
    throw new Error("payload가 비어있습니다.");

  const { boothId, tableNo, items, payment } = payload;

  assertPositiveInt("boothId", boothId);
  assertPositiveInt("tableNo", tableNo);

  if (!Array.isArray(items) || items.length === 0)
    throw new Error("'items' 배열이 비어있습니다.");

  items.forEach((it, i) => {
    assertPositiveInt(`items[${i}].foodId`, it.foodId);
    assertString(`items[${i}].name`, it.name);
    assertNumber(`items[${i}].price`, it.price);
    assertPositiveInt(`items[${i}].quantity`, it.quantity);
    // imageUrl은 선택(optional)
  });

  if (!payment || typeof payment !== "object")
    throw new Error("'payment' 정보가 필요합니다.");
  assertString("payment.payerName", payment.payerName);
  assertNumber("payment.amount", payment.amount);

  const { data } = await client.post(API_PUBLIC.CREATE_ORDER(), payload);
  return data; // { orderId, status, amount, createdAt }
}

/** 주문 단건 조회 */
export async function getOrderDetail(orderId) {
  assertPositiveInt("orderId", orderId); // /orders/null 같은 실수 방지
  const { data } = await client.get(API_PUBLIC.GET_ORDER_DETAIL(orderId));
  return data; // Order
}

/** 실시간 주문 상태 업데이트 (SSE) */
export function openOrderStream(boothId, onMessage, onError) {
  assertPositiveInt("boothId", boothId);
  const url = `${BASE_URL}${API_PUBLIC.STREAM_ORDER_UPDATES_SSE(boothId)}`;

  const source = new EventSource(url, { withCredentials: false });

  source.onmessage = (e) => {
    if (typeof onMessage === "function") onMessage(e);
  };
  source.onerror = (e) => {
    if (typeof onError === "function") onError(e);
    // 필요 시 재연결/백오프는 브라우저 기본 동작에 맡김
  };

  return {
    source,
    close: () => source.close(),
  };
}

// --------------------------------------------------
// 묶어서 기본 export도 제공 (선호에 따라 사용)
// --------------------------------------------------
const customerApi = {
  client,
  listMenusByBooth,
  getMenuDetail,
  getBoothAccount,
  createOrder,
  getOrderDetail,
  openOrderStream,
  EP: API_PUBLIC,
  BASE_URL,
};

export default customerApi;