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


function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function toCardProps(table, latestOrder) {
  if (!table?.active || !latestOrder) {
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

  const { customerOrder, orderItems, paymentInfo } = latestOrder;
  return {
    tableNo: table.tableNumber,
    timeText: formatTime(customerOrder?.created_at),
    active: true,
    orderStatus: customerOrder?.status ?? "PENDING",
    items: (orderItems || []).map((it) => ({ name: it.name, qty: it.quantity ?? it.qty ?? 0 })),
    customerName: paymentInfo?.payer_name || "",
    addAmount: 0,
    totalAmount: customerOrder?.total_amount ?? 0,
  };
}

export default function ManagerOrderPage() {
  const { boothId } = useParams();
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [latestOrdersByTable, setLatestOrdersByTable] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  // 상세/영수증 모달 상태
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyTable, setHistoryTable] = useState(null); // { tableId, tableNumber }

  const load = useCallback(async () => {
    if (!boothId) return;
    setLoading(true);
    try {
      const tableList = await getTablesByBooth(boothId);
      setTables(tableList || []);

      const idsTasks = tableList.map(async (t) => {
        try {
          const { orderIds = [] } = await getLatestVisitOrderIds(t.tableId);
          const lastOrderId = orderIds.length ? orderIds[orderIds.length - 1] : null;
          return { tableId: t.tableId, lastOrderId };
        } catch {
          return { tableId: t.tableId, lastOrderId: null };
        }
      });
      const idPairs = await Promise.all(idsTasks);

      const detailTasks = idPairs.map(async ({ tableId, lastOrderId }) => {
        if (!lastOrderId) return { tableId, detail: null };
        try {
          const detail = await getOrderDetail(lastOrderId);
          return { tableId, detail };
        } catch {
          return { tableId, detail: null };
        }
      });
      const details = await Promise.all(detailTasks);

      const map = {};
      details.forEach(({ tableId, detail }) => (map[tableId] = detail));
      setLatestOrdersByTable(map);
    } finally {
      setLoading(false);
    }
  }, [boothId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleApprove = async (tableId) => {
    const detail = latestOrdersByTable[tableId];
    if (!detail?.customerOrder?.order_id) return;
    await approveOrder(detail.customerOrder.order_id);
    setRefreshKey((v) => v + 1);
  };

  const handleReject = async (tableId) => {
    const detail = latestOrdersByTable[tableId];
    if (!detail?.customerOrder?.order_id) return;
    await rejectOrder(detail.customerOrder.order_id);
    setRefreshKey((v) => v + 1);
  };

  const handleClear = async (tableId) => {
    const ok = window.confirm("정말로 비우시겠습니까?");
    if (!ok) return;
    await closeVisit(tableId);
    setRefreshKey((v) => v + 1);
  };

  const handleFinish = async (tableId) => {
    const detail = latestOrdersByTable[tableId];
    if (!detail?.customerOrder?.order_id) return;
    await setOrderStatus(detail.customerOrder.order_id, "FINISHED");
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

  const cards = useMemo(() => {
    return (tables || []).map((t) => ({
      table: t,
      cardProps: toCardProps(t, latestOrdersByTable[t.tableId]),
    }));
  }, [tables, latestOrdersByTable]);

  return (
    <AppLayout title="주문 관리">
      <TopBar>
        <Left>
          <H1>부스 #{boothId} 주문 현황</H1>
          {!loading && <CountText>총 {tables.length}개 테이블</CountText>}
        </Left>
        <Right>
          <CreateBtn onClick={handleCreateTable}>테이블 새로 생성</CreateBtn>
          <RefreshBtn onClick={() => setRefreshKey((v) => v + 1)}>새로고침</RefreshBtn>
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
