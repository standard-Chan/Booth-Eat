// src/api/manager/salesApi.js
// 실제 API 붙일 때 delay()와 아래 목 데이터만 걷어내고 fetch로 교체하면 됨.

const delay = (ms=200) => new Promise(r=>setTimeout(r, ms));

/** 1) 특정 날짜 매출 요약 */
export async function fetchBoothDailySummary(boothId, date /* 'YYYY-MM-DD' */) {
  await delay();
  // 임시 값
  return {
    date,
    totalSales: 684000,
    orderNumbers: 44,
  };
}

/** 2) 부스의 메뉴별 판매액(총액 기준) */
export async function fetchMenuSales(boothId) {
  await delay();
  // 임시 값: name, totalSales(원)
  return [
    { menuItemId: 1, name: '오징어 튀김', totalSales: 98000 },
    { menuItemId: 2, name: '떡볶이',     totalSales: 140000 },
    { menuItemId: 3, name: '김치볶음밥', totalSales: 90000 },
    { menuItemId: 4, name: '오뎅탕',     totalSales: 210000 },
    { menuItemId: 5, name: '사이다',     totalSales: 85000 },
  ];
}

/** (옵션) 어제값: 데모용 비교 막대 생성 */
export function makeYesterdaySeries(todayList) {
  // 어제는 70%~95% 사이로 랜덤 스케일
  return todayList.map(it => ({
    ...it,
    totalSales: Math.round(it.totalSales * (0.7 + Math.random() * 0.25)),
  }));
}
