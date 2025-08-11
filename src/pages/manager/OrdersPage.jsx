// src/pages/ManagerOrderPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import orderApi, {
  getTablesByBooth,
  getLatestVisitOrderIds,
  getOrderDetail,
  approveOrder,
  rejectOrder,
  closeVisit,
  createTable,
  setOrderStatus,
} from "../../api/manager/orderApi.js";
import AppLayout from "../../components/common/manager/AppLayout.jsx";
import OrderCard from "../../components/manager/OrderCard.jsx";
import OrderHistoryModal from "../../components/manager/OrderHistoryModal.jsx";

/* ========== utils ========== */
function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function byCreatedAtAsc(a, b) {
  return +new Date(a?.createdAt || 0) - +new Date(b?.createdAt || 0);
}
function byCreatedAtDesc(a, b) {
  return +new Date(b?.createdAt || 0) - +new Date(a?.createdAt || 0);
}

/** 같은 visit의 여러 주문을 카드 하나로 합치기 */
function combineOrdersForCard(table, orders = []) {
  if (!table?.active || !orders.length) {
    return {
      tableNo: table?.tableNumber ?? "-",
      timeText: "",
      active: false,
      items: [],
      customerName: "",
      addAmount: 0,
      totalAmount: 0,
      orderStatus: null,
    };
  }

  // 시간: 가장 처음 주문 시각
  const sortedAsc = [...orders].sort(byCreatedAtAsc);
  const first = sortedAsc[0];
  const firstAmount = (first?.payment?.amount ?? first?.totalAmount ?? 0) || 0;

  // 상태/액션: 가장 최근 주문 기준
  const latest = [...orders].sort(byCreatedAtDesc)[0];
  const latestStatus = (latest?.status || "PENDING").toUpperCase();

  // 총 금액 합계
  const totalAmount = orders.reduce(
    (sum, o) => sum + ((o?.payment?.amount ?? o?.totalAmount ?? 0) || 0),
    0
  );

  // 추가 주문 금액(첫 주문 제외 합)
  const addAmount = Math.max(totalAmount - firstAmount, 0);

  // 아이템 병합 (이름 기준)
  const itemMap = new Map();
  orders.forEach((o) => {
    (o?.items || []).forEach((it) => {
      const key = it.name ?? `${it.foodId}-${it.name}`;
      const prev = itemMap.get(key) || { name: it.name, qty: 0 };
      prev.qty += it.quantity ?? 0;
      itemMap.set(key, prev);
    });
  });
  const mergedItems = Array.from(itemMap.values());

  // 주문자 이름: 최신 결제 정보 기준 (없으면 "-")
  const customerName =
    latest?.payment?.payerName ??
    first?.payment?.payerName ??
    "";

  return {
    tableNo: table.tableNumber,
    timeText: formatTime(first?.createdAt),
    active: true,
    orderStatus: latestStatus, // PENDING | APPROVED | REJECTED | FINISHED
    items: mergedItems,
    customerName: customerName || "-",
    addAmount,
    totalAmount,
  };
}

/* 가장 최근 PENDING 주문 찾아서 반환 */
function pickLatestPending(orders = []) {
  return [...orders].filter((o) => (o?.status || "").toUpperCase() === "PENDING").sort(byCreatedAtDesc)[0];
}

/* ========== component ========== */
export default function ManagerOrderPage() {
  const { boothId } = useParams();
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]); // [{tableId, tableNumber, active}, ...]
  // 테이블별 주문 상세 "배열" 저장: { [tableId]: OrderDetail[] }
  const [ordersByTable, setOrdersByTable] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  // 상세/영수증 모달
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyTable, setHistoryTable] = useState(null); // { tableId, tableNumber }

  /** 전체 로딩: 테이블 → 각 테이블의 orderIds[] → 모든 주문 상세 */
  const load = useCallback(async () => {
    if (!boothId) return;
    setLoading(true);
    try {
      // 1) 테이블 목록
      const tableList = await getTablesByBooth(boothId);
      const safeTables = Array.isArray(tableList) ? tableList : [];
      setTables(safeTables);

      // 2) 테이블별 latest visit의 모든 orderIds
      const idsByTable = await Promise.all(
        safeTables.map(async (t) => {
          try {
            const ids = await getLatestVisitOrderIds(t.tableId); // e.g., [124, 125]
            return { tableId: t.tableId, ids: Array.isArray(ids) ? ids : [] };
          } catch {
            return { tableId: t.tableId, ids: [] };
          }
        })
      );

      // 3) 각 테이블의 orderIds 전부 상세 조회
      const detailPairs = await Promise.all(
        idsByTable.map(async ({ tableId, ids }) => {
          if (!ids.length) return { tableId, details: [] };
          const details = await Promise.all(
            ids.map(async (oid) => {
              try {
                return await getOrderDetail(oid); // 플랫 구조
              } catch {
                return null;
              }
            })
          );
          return { tableId, details: details.filter(Boolean) };
        })
      );

      // 상태 저장
      const map = {};
      detailPairs.forEach(({ tableId, details }) => (map[tableId] = details));
      setOrdersByTable(map);
    } finally {
      setLoading(false);
    }
  }, [boothId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  /* ===== 액션 핸들러 ===== */

  // 가장 최근 PENDING 주문 승인
  const handleApprove = async (tableId) => {
    const list = ordersByTable[tableId] || [];
    const target = pickLatestPending(list);
    if (!target?.orderId && !target?.id) return;
    await approveOrder(target.orderId ?? target.id);
    setRefreshKey((v) => v + 1);
  };

  // 가장 최근 PENDING 주문 거절
  const handleReject = async (tableId) => {
    const list = ordersByTable[tableId] || [];
    const target = pickLatestPending(list);
    if (!target?.orderId && !target?.id) return;
    await rejectOrder(target.orderId ?? target.id);
    setRefreshKey((v) => v + 1);
  };

  // 테이블 비우기(visit 종료)
  const handleClear = async (tableId) => {
    const ok = window.confirm("정말로 비우시겠습니까?");
    if (!ok) return;
    await closeVisit(tableId);
    setRefreshKey((v) => v + 1);
  };

  // (옵션) 최신 주문 FINISHED 처리 — 필요 시 사용
  const handleFinish = async (tableId) => {
    const list = ordersByTable[tableId] || [];
    const latest = [...list].sort(byCreatedAtDesc)[0];
    if (!latest?.orderId && !latest?.id) return;
    await setOrderStatus(latest.orderId ?? latest.id, "FINISHED");
    setRefreshKey((v) => v + 1);
  };

  const handleReceiptClick = (tableId) => {
    const t = tables.find((x) => x.tableId === tableId);
    if (!t) return;
    setHistoryTable({ tableId: t.tableId, tableNumber: t.tableNumber });
    setHistoryOpen(true);
  };

  const handleCreateTable = async () => {
    await createTable(boothId);
    setRefreshKey((v) => v + 1);
  };

  // 카드 데이터 합성
  const cards = useMemo(() => {
    return (tables || []).map((t) => {
      const combined = combineOrdersForCard(t, ordersByTable[t.tableId] || []);
      return { table: t, cardProps: combined };
    });
  }, [tables, ordersByTable]);

  return (
    <AppLayout title="주문 관리">
      <TopBar>
        <Left>
          <H1>부스 #{boothId} 주문 현황</H1>
          {!loading && <CountText>총 {tables.length}개 테이블</CountText>}
        </Left>
        <Right>
          <CreateBtn onClick={handleCreateTable}>테이블 새로 생성</CreateBtn>
          <RefreshBtn onClick={() => setRefreshKey((v) => v + 1)}>
            새로고침
          </RefreshBtn>
        </Right>
      </TopBar>

      {loading ? (
        <LoaderWrap>불러오는 중...</LoaderWrap>
      ) : (
        <Grid>
          {cards.map(({ table, cardProps }) => (
            <OrderCard
              key={table.tableId}
              {...cardProps}
              onApprove={() => handleApprove(table.tableId)}
              onReject={() => handleReject(table.tableId)}
              onClear={() => handleClear(table.tableId)}
              onReceiptClick={() => handleReceiptClick(table.tableId)}
            />
          ))}
        </Grid>
      )}

      {/* 상세/영수증 팝업 (이미 테이블 전체 이력 보여줌) */}
      <OrderHistoryModal
        open={historyOpen}
        boothId={boothId}
        tableId={historyTable?.tableId}
        tableNumber={historyTable?.tableNumber}
        onClose={() => setHistoryOpen(false)}
      />
    </AppLayout>
  );
}

/* ========== styled ========== */
const TopBar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
`;
const Left = styled.div``;
const Right = styled.div`
  display: flex;
  gap: 10px;
`;
const H1 = styled.h2`
  font-size: 20px;
  margin: 0;
`;
const CountText = styled.p`
  margin: 4px 0 0 0;
  color: #888;
  font-size: 13px;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
`;
const LoaderWrap = styled.div`
  padding: 60px 0;
  text-align: center;
  color: #666;
`;
const ButtonBase = styled.button`
  border: 0;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
`;
const CreateBtn = styled(ButtonBase)`
  background: #111;
  color: #fff;
`;
const RefreshBtn = styled(ButtonBase)`
  background: #f1f3f5;
  color: #111;
`;
