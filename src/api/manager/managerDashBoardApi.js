// src/services/managerDashboardApi.js
// 매니저 대시보드/통계 + 매출 관리 전용 API 클라이언트 (axios)
// - cookies(세션) 사용을 가정해 withCredentials: true
// - 오늘의 메뉴 랭킹 API는 포함하지 않음(요청사항)

import axios from "axios";
import { BASE_URL, API_MANAGER_STATS, API_MANAGER_SALES } from "../api.js";



// 공용 axios 인스턴스
const http = axios.create({
  baseURL: BASE_URL,       // ex) http://localhost:8080/api
  withCredentials: true,   // 서버 세션/쿠키 사용하는 경우
  headers: {
    "Content-Type": "application/json",
  },
});

// 공용 에러 핸들러
function parseAxiosError(err) {
  if (err.response) {
    const { status, data } = err.response;
    const message =
      (data && (data.message || data.error || JSON.stringify(data))) ||
      "Request failed";
    return new Error(`[${status}] ${message}`);
  }
  if (err.request) {
    return new Error("No response from server");
  }
  return new Error(err.message || "Unknown error");
}

/** 오늘 기준 현황(승인건만)
 * GET /api/manager/stats/today?boothId={id}&top={n}
 * @param {number|string} boothId
 * @param {number} [top]  상위 n개
 */
export async function getTodayStats(boothId, limit) {
  if (boothId == null) throw new Error("boothId가 필요합니다.");
  try {
    const url = API_MANAGER_STATS.GET_TODAY_MENU_RANKING(boothId, limit);
    const { data } = await http.get(url);
    return data;
  } catch (err) {
    throw parseAxiosError(err);
  }
}

/** (디버그용) 테이블 컨텍스트
 * GET /api/dev/table-context?boothId={id}&tableNo={no}
 * @param {number|string} boothId
 * @param {number|string} tableNo
 */
export async function getTableContextDebug(boothId, tableNo) {
  if (boothId == null) throw new Error("boothId가 필요합니다.");
  if (tableNo == null) throw new Error("tableNo가 필요합니다.");
  try {
    const url = API_MANAGER_STATS.GET_TABLE_CONTEXT_DEBUG(boothId, tableNo);
    const { data } = await http.get(url);
    return data;
  } catch (err) {
    throw parseAxiosError(err);
  }
}

/** 특정 날짜 매출 정보
 * GET /api/manager/booths/{boothId}/stats/date/{yyyy-MM-dd}
 * @param {number|string} boothId
 * @param {string} yyyyMMdd  예) "2025-08-11"
 */
export async function getDateSales(boothId, yyyyMMdd) {
  if (boothId == null) throw new Error("boothId가 필요합니다.");
  if (!yyyyMMdd) throw new Error("yyyy-MM-dd 형식의 날짜가 필요합니다.");
  try {
    const url = API_MANAGER_SALES.GET_DATE_SALES(boothId, yyyyMMdd);
    const { data } = await http.get(url);
    return data;
  } catch (err) {
    throw parseAxiosError(err);
  }
}

/** 부스 메뉴별 판매액 합계(기간 구분 없음, 스펙 그대로)
 * GET /api/manager/booths/{boothId}/stats/menu-sales
 * @param {number|string} boothId
 */
export async function getMenuSales(boothId) {
  if (boothId == null) throw new Error("boothId가 필요합니다.");
  try {
    const url = API_MANAGER_SALES.GET_MENU_SALES(boothId);
    const { data } = await http.get(url);
    return data;
  } catch (err) {
    throw parseAxiosError(err);
  }
}

// ---- 사용 예시 ----
// import { getTodayStats, getTableContextDebug, getDateSales, getMenuSales } from "@/services/managerDashboardApi";
// const today = await getTodayStats(1, 5);
// const debug = await getTableContextDebug(1, 7);
// const daily = await getDateSales(1, "2025-08-11");
// const menu = await getMenuSales(1);
