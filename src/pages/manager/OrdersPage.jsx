// src/pages/manager/MenusPage.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/common/manager/AppLayout.jsx";
import OrderCard from "../../components/manager/OrderCard.jsx";
import Modal from "../../components/common/manager/Modal.jsx";
import { loadCards } from "../../services/ordersService.js";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

export default function ManagerOrdersPage() {
  const { boothId } = useParams();
  const [cards, setCards] = useState([]);
  const [receiptFor, setReceiptFor] = useState(null);

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
            onReceiptClick={() => setReceiptFor(c.tableNumber)}
          />
        ))}
      </Grid>

      <Modal
        open={!!receiptFor}
        title={`테이블 ${receiptFor} 주문 내역 (임시)`}
        onClose={() => setReceiptFor(null)}
      >
        나중에 실제 내역을 리스트업 할 영역입니다.
      </Modal>
    </AppLayout>
  );
}
