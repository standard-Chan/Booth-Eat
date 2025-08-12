// src/api/manager/menuApi.js
const BASE = '/api'; // TODO: 백엔드 준비되면 실제 베이스 경로로 변경

// 공통 옵션
const jsonOpts = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(body),
});

export async function fetchMenus(boothId) {
  const res = await fetch(`${BASE}/booths/${boothId}/menus`, { credentials: 'include' });
  if (!res.ok) throw new Error('메뉴 목록 조회 실패');
  return res.json(); // [{menuItemId, name, ...}]
}

// 각 메뉴 총 주문량
export async function fetchOrderQty(menuItemId) {
  const res = await fetch(`${BASE}/menus/${menuItemId}/total-orders`, { credentials: 'include' });
  if (!res.ok) throw new Error('주문량 조회 실패');
  return res.json(); // { menuItemId, totalOrderQuantity }
}

// 메뉴 추가 (이미지 포함 가능)
export async function createMenu(boothId, { name, price, description, available, previewImage }) {
  const fd = new FormData();
  fd.append('boothId', boothId);
  fd.append('name', name);
  fd.append('price', price);
  fd.append('available', available);
  if (description) fd.append('description', description);
  if (previewImage) fd.append('previewImage', previewImage); // File 또는 Blob

  const res = await fetch(`${BASE}/menus`, {
    method: 'POST',
    credentials: 'include',
    body: fd,
  });
  if (!res.ok) throw new Error('메뉴 추가 실패');
  // created 201
  return true;
}

// 메뉴 수정 (이미지 바뀌면 FormData, 아니면 JSON)
export async function updateMenu(menuItemId, { name, price, description, previewImage }) {
  const useForm = previewImage instanceof File;
  if (useForm) {
    const fd = new FormData();
    fd.append('menu_item', menuItemId);
    if (name != null) fd.append('name', name);
    if (price != null) fd.append('price', price);
    if (description != null) fd.append('description', description);
    fd.append('previewImage', previewImage);
    const res = await fetch(`${BASE}/menus/${menuItemId}`, { method: 'PATCH', credentials: 'include', body: fd });
    if (!res.ok) throw new Error('메뉴 수정 실패');
    return true;
  } else {
    const res = await fetch(`${BASE}/menus/${menuItemId}`, jsonOpts('PATCH', {
      menu_item: menuItemId,
      name, price, description,
    }));
    if (!res.ok) throw new Error('메뉴 수정 실패');
    return true;
  }
}

export async function deleteMenu(menuItemId) {
  const res = await fetch(`${BASE}/menus/${menuItemId}`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error('메뉴 삭제 실패');
  return true; // OK 200
}

export async function setAvailable(menuItemId, available) {
  const res = await fetch(`${BASE}/menus/${menuItemId}/available`, jsonOpts('POST', {
    menu_item: menuItemId,
    available,
  }));
  if (!res.ok) throw new Error('판매 상태 변경 실패');
  return true;
}
