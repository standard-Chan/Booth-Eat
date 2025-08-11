// src/pages/manager/MenusPage.jsx  (= ManagerOrdersPage)
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/common/manager/AppLayout.jsx";
import OrderCard from "../../components/manager/OrderCard.jsx";
import OrderHistoryModal from "../../components/manager/OrderHistoryModal.jsx"; 
import { loadCards } from "../../services/ordersService.js";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

export default function ManagerOrdersPage() {
  const { boothId } = useParams();
  const [cards, setCards] = useState([]);
  const [popup, setPopup] = useState(null); // { tableNumber } | null

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await loadCards(boothId ?? 1);
      if (mounted) setCards(data);
    })();
    return () => { mounted = false; };
  }, [boothId]);

  return (
    <AppLayout title="주문 관리">
      <Grid>
        {cards.map((c) => (
          <OrderCard
            key={c.tableNumber}
            tableNo={c.tableNumber}
            timeText={c.timeText}
            active={c.active}
            orderStatus={c.orderStatus}
            items={c.items || []}
            customerName={c.customerName}
            addAmount={c.addAmount || 0}
            totalAmount={c.totalAmount || 0}
            onApprove={() => console.log(`approve visit ${c.visitId} (table ${c.tableNumber})`)}
            onReject={() => console.log(`reject visit ${c.visitId} (table ${c.tableNumber})`)}
            onClear={() => console.log(`clear visit ${c.visitId} (table ${c.tableNumber})`)}
            onReceiptClick={() => setPopup({ tableNumber: c.tableNumber })}
          />
        ))}
      </Grid>

      {/* ✅ 주문 내역 팝업 */}
      <OrderHistoryModal
        open={!!popup}
        boothId={boothId ?? 1}
        tableNumber={popup?.tableNumber}
        onClose={() => setPopup(null)}
        onClearTable={(visitId) => {
          // TODO: 실제 "테이블 비우기(visit 완료처리)" API 호출
          console.log("테이블 비우기 visitId:", visitId);
          setPopup(null);
        }}
      />
    </AppLayout>
  );
}
