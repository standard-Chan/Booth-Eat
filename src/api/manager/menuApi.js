// src/api/manager/menuApi.js

// 임시 데이터 ------------------------
let MENUS = [
  {
    menuItemId: 1,
    name: '치즈버거',
    description: '고소한 치즈와 두툼한 패티',
    price: 5000,
    category: 'FOOD',
    previewImage: '/images/sample1.jpg', // public에 넣거나 base64
    available: true,
  },
  {
    menuItemId: 2,
    name: '오징어 튀김',
    description: '오징어',
    price: 7000,
    category: 'FOOD',
    previewImage: '/images/sample2.jpg',
    available: true,
  },
  {
    menuItemId: 3,
    name: '김치볶음밥',
    description: '불맛 살짝',
    price: 6000,
    category: 'FOOD',
    previewImage: '/images/sample3.jpg',
    available: true,
  },
  {
    menuItemId: 4,
    name: '오뎅탕',
    description: '국물 진함',
    price: 4000,
    category: 'FOOD',
    previewImage: '/images/sample4.jpg',
    available: false,
  },
];

let ORDER_QTY = {
  1: 21,
  2: 26,
  3: 21,
  4: 15,
};

let _autoId = 100;
const genId = () => ++_autoId;
const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// -----------------------------------

export async function fetchMenus(boothId) {
  // boothId는 지금은 무시
  await delay();
  return MENUS.map(m => ({ ...m })); // 복사본
}

export async function fetchOrderQty(menuItemId) {
  await delay();
  return { menuItemId, totalOrderQuantity: ORDER_QTY[menuItemId] ?? 0 };
}

export async function createMenu(boothId, { name, price, description, available, previewImage }) {
  await delay();
  const id = genId();
  MENUS.unshift({
    menuItemId: id,
    name,
    price: Number(price),
    description: description ?? '',
    category: 'FOOD',
    previewImage: typeof previewImage === 'string'
      ? previewImage
      : (previewImage instanceof File ? URL.createObjectURL(previewImage) : null),
    available: available ?? true,
  });
  ORDER_QTY[id] = 0;
  return true;
}

export async function updateMenu(menuItemId, { name, price, description, previewImage }) {
  await delay();
  MENUS = MENUS.map(m => m.menuItemId === menuItemId ? ({
    ...m,
    name: name ?? m.name,
    price: price != null ? Number(price) : m.price,
    description: description ?? m.description,
    previewImage: previewImage
      ? (typeof previewImage === 'string'
        ? previewImage
        : (previewImage instanceof File ? URL.createObjectURL(previewImage) : m.previewImage))
      : m.previewImage,
  }) : m);
  return true;
}

export async function deleteMenu(menuItemId) {
  await delay();
  MENUS = MENUS.filter(m => m.menuItemId !== menuItemId);
  delete ORDER_QTY[menuItemId];
  return true;
}

export async function setAvailable(menuItemId, available) {
  await delay();
  MENUS = MENUS.map(m => m.menuItemId === menuItemId ? ({ ...m, available }) : m);
  return true;
}


/*
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
    menu_item: menuItemId, // (백엔드 필드 철자 확인 필요)
    available,
  }));
  if (!res.ok) throw new Error('판매 상태 변경 실패');
  return true;
}
*/