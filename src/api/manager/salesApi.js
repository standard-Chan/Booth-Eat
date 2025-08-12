// 매출 관리 API 래퍼 (axios)
// - 오늘의 메뉴 랭킹은 사용하지 않음
import axios from "axios";
import { BASE_URL, API_MANAGER_SALES } from "../api.js";

const http = axios.create({
  baseURL: BASE_URL,        // e.g. http://localhost:8080/api
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const parseErr = (e) => {
  if (e.response) {
    const { status, data } = e.response;
    const msg = (data && (data.message || data.error)) || "Request failed";
    return new Error(`[${status}] ${msg}`);
  }
  if (e.request) return new Error("No response from server");
  return new Error(e.message || "Unknown error");
};

/** 1) 특정 날짜 일일 요약 */
export async function fetchBoothDailySummary(boothId, yyyyMMdd) {
  if (boothId == null) throw new Error("boothId가 필요합니다.");
  if (!yyyyMMdd) throw new Error("yyyy-MM-dd 형식의 날짜가 필요합니다.");
  try {
    const url = API_MANAGER_SALES.GET_DATE_SALES(boothId, yyyyMMdd);
    const { data } = await http.get(url);
    // API 명세에 맞춰 그대로 리턴 (date, totalSales, orderNumbers)
    return data;
  } catch (e) {
    throw parseErr(e);
  }
}

/** 2) 메뉴별 판매액 합계 */
export async function fetchMenuSales(boothId) {
  if (boothId == null) throw new Error("boothId가 필요합니다.");
  try {
    const url = API_MANAGER_SALES.GET_MENU_SALES(boothId);
    const { data } = await http.get(url);
    // [{ menuItemId, name, totalSales }, ...]
    return Array.isArray(data) ? data : [];
  } catch (e) {
    throw parseErr(e);
  }
}

/** 3) 데모용: 어제 시리즈 생성 (안정적인 10~25% 감소/증가 랜덤, item별 고정) */
export function makeYesterdaySeries(todayList = []) {
  // menuItemId 기준으로 결정적 난수 → 변동폭 고정
  const hash = (n) => {
    let x = Number(n) || 0;
    x = ((x << 13) ^ x) >>> 0;
    return (1.0 - ((x * (x * x * 15731 + 789221) + 1376312589) & 0x7fffffff) / 0x7fffffff);
  };
  return todayList.map((it) => {
    const h = Math.abs(hash(it.menuItemId)) ; // 0~1
    const delta = 0.10 + (h * 0.15);          // 10% ~ 25%
    const sign = h > 0.5 ? -1 : 1;            // 절반 확률로 감소/증가
    const y = Math.max(0, Math.round(it.totalSales * (1 + sign * delta)));
    return { ...it, totalSales: y };
  });
}
