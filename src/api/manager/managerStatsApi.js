// src/services/managerStatsApi.js
// "통합 통계(모든 부스/방문시간)" 전용 API 클라이언트
// - axios 공용 인스턴스 사용(withCredentials: true)
// - 단순 호출용 유틸만 노출

import axios from "axios";
import { BASE_URL, API_MANAGER_STATS_EXT } from "../api.js";

// 공용 axios 인스턴스
const http = axios.create({
  baseURL: BASE_URL,      // ex) http://localhost:8080/api
  withCredentials: true,  // 서버 세션/쿠키 사용하는 경우
  headers: { "Content-Type": "application/json" },
});

// 공용 에러 핸들러
function parseAxiosError(err) {
  if (err?.response) {
    const { status, data } = err.response;
    const message =
      (data && (data.message || data.error || JSON.stringify(data))) ||
      "Request failed";
    return new Error(`[${status}] ${message}`);
  }
  if (err?.request) return new Error("No response from server");
  return new Error(err?.message || "Unknown error");
}

/** 1) 모든 booth의 특정 날짜 판매량 정보
 * GET /api/manager/booths/stats/date/{yyyy-MM-dd}
 * @param {string} yyyyMMdd  예) "2025-08-12"
 * @returns {Promise<Object>} 예시: { "1": [ { orderId, boothId, totalAmount, createdAt, orderItems:[...] } ], ... }
 */
export async function getAllBoothDateSales(yyyyMMdd) {
  if (!yyyyMMdd) throw new Error("yyyy-MM-dd 형식의 날짜가 필요합니다.");
  try {
    const url = API_MANAGER_STATS_EXT.GET_ALL_BOOTH_DATE_SALES(yyyyMMdd);
    const { data } = await http.get(url);
    return data;
  } catch (err) {
    throw parseAxiosError(err);
  }
}

/** 2) 모든 부스의 특정 날짜 판매 집계(총매출/주문수)
 * GET /api/manager/order/stats/date/{yyyy-MM-dd}
 * @param {string} yyyyMMdd  예) "2025-08-12"
 * @returns {Promise<{ totalSalse:number, orderNumbers:number }>}
 */
export async function getAllBoothOrderStats(yyyyMMdd) {
  if (!yyyyMMdd) throw new Error("yyyy-MM-dd 형식의 날짜가 필요합니다.");
  try {
    const url = API_MANAGER_STATS_EXT.GET_ALL_BOOTH_ORDER_STATS(yyyyMMdd);
    const { data } = await http.get(url);
    return data;
  } catch (err) {
    throw parseAxiosError(err);
  }
}

/** 3) 특정 날짜의 식사 시간 (분 단위)
 * GET /api/manager/tableVisit/stats/date/{yyyy-MM-dd}
 * @param {string} yyyyMMdd  예) "2025-08-12"
 * @returns {Promise<number[]>} 예시: [13, 25, 72, 42, 26]
 */
export async function getVisitTimesByDate(yyyyMMdd) {
  if (!yyyyMMdd) throw new Error("yyyy-MM-dd 형식의 날짜가 필요합니다.");
  try {
    const url = API_MANAGER_STATS_EXT.GET_VISIT_TIMES_BY_DATE(yyyyMMdd);
    const { data } = await http.get(url);
    return data;
  } catch (err) {
    throw parseAxiosError(err);
  }
}

// ---- 사용 예시 ----
// import { getAllBoothDateSales, getAllBoothOrderStats, getVisitTimesByDate } from "@/services/managerStatsApi";
// const dailyByBooth = await getAllBoothDateSales("2025-08-12");
// const dailyTotal   = await getAllBoothOrderStats("2025-08-12");
// const visitTimes   = await getVisitTimesByDate("2025-08-12");
