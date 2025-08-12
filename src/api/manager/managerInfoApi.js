import axios from "axios";
import { BASE_URL, API_ADMIN_MANAGER } from "../api.js";

// axios 인스턴스 (쿠키 포함)
const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 공통 에러 핸들러 (주문 API에서 쓰던 패턴 동일)
function handleApiError(err) {
  const status = err?.response?.status;
  const msg =
    err?.response?.data?.message ||
    err?.message ||
    "Unknown error while calling admin manager API";
  const wrapped = new Error(`[${status || "ERR"}] ${msg}`);
  wrapped.status = status;
  wrapped.cause = err;
  throw wrapped;
}

/**
 * 매니저 생성 (최초 1회)
 * POST /api/admin/booths/{boothId}/manager
 * @param {number} boothId
 * @param {{
 *  username: string,
 *  accountBank: string,
 *  accountNo: string,
 *  accountHolder: string
 * }} payload
 * @returns {Promise<void>} 201 CREATED 기대
 */
export async function createManager(boothId, payload) {
  try {
    const url = API_ADMIN_MANAGER.CREATE_MANAGER(boothId);
    const res = await client.patch(url, payload);
    return res.data; // 보통 빈 바디거나 생성 정보가 올 수 있음
  } catch (err) {
    handleApiError(err);
  }
}

/**
 * 매니저 정보 조회
 * GET /api/admin/booths/{boothId}/manager
 * @param {number} boothId
 * @returns {Promise<{
 *   managerId:number, boothId:number, username:string, role:string,
 *   accountBank:string, accountNo:string, accountHolder:string
 * }>}
 */
export async function getManager(boothId) {
  try {
    const url = API_ADMIN_MANAGER.GET_MANAGER(boothId);
    const res = await client.get(url);
    return res.data;
  } catch (err) {
    handleApiError(err);
  }
}

// 필요 시 기본 export로 모아 사용하기 편하게
const adminManagerApi = {
  createManager,
  getManager,
};

export default adminManagerApi;
