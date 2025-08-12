import { toURL, API_MANAGER_MENUS } from "../api.js";

/** 공통 응답 핸들러 */
async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    let detail;
    try {
      detail = isJson ? await res.json() : await res.text();
    } catch {
      detail = null;
    }
    const message =
      (detail && (detail.message || detail.error || JSON.stringify(detail))) ||
      `HTTP ${res.status} ${res.statusText}`;
    const err = new Error(message);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }

  if (res.status === 204) return null;
  return isJson ? res.json() : res.text();
}

/** 헤더 (JSON용) */
const jsonHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

/**
 * 메뉴 추가
 * - previewImage 가 File/Blob 이면 FormData 업로드
 * - 아니면 JSON 전송
 * @param {number|string} boothId
 * @param {{
 *   name:string,
 *   price:number,
 *   available?:boolean,
 *   previewImage?:string|File|Blob|null,
 *   description?:string|null,
 *   category?:'FOOD'|'DRINK'|string
 * }} data
 */
export async function addMenu(boothId, data) {
  const url = toURL(API_MANAGER_MENUS.ADD_MENU(boothId));

  // File/Blob 이면 FormData 사용
  const useForm =
    data?.previewImage instanceof File || data?.previewImage instanceof Blob;

  const options = {
    method: 'POST',
    credentials: 'include',
  };

  if (useForm) {
    const fd = new FormData();
    fd.append('boothId', data.boothId);
    fd.append('name', data.name);
    fd.append('price', String(data.price));
    if (typeof data.available === 'boolean') fd.append('available', String(data.available));
    if (data.description != null) fd.append('description', data.description);
    if (data.category != null) fd.append('category', data.category);
    fd.append('previewImage', data.previewImage);
    options.body = fd; // Content-Type 자동 설정 (multipart/form-data)
  } else {
    options.headers = jsonHeaders;
    options.body = JSON.stringify({
      boothId: data.boothId,
      name: data.name,
      price: data.price,
      available: data.available ?? true,
      previewImage: data.previewImage ?? null,
      description: data.description ?? null,
      category: data.category ?? 'FOOD',
    });
  }

  const res = await fetch(url, options);
  return handleResponse(res);
}

/**
 * 메뉴 삭제
 * @param {number|string} boothId
 * @param {number|string} menuItemId
 */
export async function deleteMenu(boothId, menuItemId) {
  const url = toURL(API_MANAGER_MENUS.DELETE_MENU(boothId, menuItemId));
  const res = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return handleResponse(res); // 보통 200/204
}

/**
 * 메뉴 수정 (부분 수정)
 * @param {number|string} boothId
 * @param {number|string} menuItemId
 * @param {Partial<{name:string, price:number, available:boolean, previewImage:string|File|Blob|null, description:string|null, category:string}>} patch
 */
export async function updateMenu(boothId, menuItemId, patch) {
  const url = toURL(API_MANAGER_MENUS.UPDATE_MENU(boothId, menuItemId));

  // 파일이면 FormData, 아니면 JSON
  const useForm =
    patch?.previewImage instanceof File || patch?.previewImage instanceof Blob;

  const options = {
    method: 'PATCH',
    credentials: 'include',
  };

  if (useForm) {
    const fd = new FormData();
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined) return;
      if (k === 'price' && typeof v === 'number') fd.append(k, String(v));
      else fd.append(k, v);
    });
    options.body = fd;
  } else {
    options.headers = jsonHeaders;
    options.body = JSON.stringify(patch);
  }

  const res = await fetch(url, options);
  return handleResponse(res);
}

/**
 * 특정 메뉴의 총 주문량
 * @param {number|string} boothId
 * @param {number|string} menuItemId
 * @returns {Promise<{menuItemId:number,totalOrderQuantity:number}>}
 */
export async function getMenuTotalOrders(boothId, menuItemId) {
  const url = toURL(API_MANAGER_MENUS.GET_MENU_TOTAL_ORDERS(boothId, menuItemId));
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return handleResponse(res);
}

/**
 * 메뉴 판매 가능(available) 토글
 * @param {number|string} menuItemId
 * @param {boolean} [nextAvailable]  // 지정 시 그 값으로 세팅, 미지정 시 서버에서 토글
 * @returns {Promise<{menuItemId:number, available:boolean}>}
 */
export async function toggleMenuAvailable(menuItemId, nextAvailable) {
  const url = toURL(API_MANAGER_MENUS.TOGGLE_AVAILABLE(menuItemId));
  const body =
    typeof nextAvailable === 'boolean' ? { available: nextAvailable } : undefined;

  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: body ? jsonHeaders : { Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(res);
}

// 편의 export
export default {
  addMenu,
  deleteMenu,
  updateMenu,
  getMenuTotalOrders,
  toggleMenuAvailable,
};
