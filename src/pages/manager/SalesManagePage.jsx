import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import AppLayout from '../../components/common/manager/AppLayout.jsx';
import StatCard from '../../components/manager/sales/StatCard.jsx';
import SalesBarChart from '../../components/manager/sales/SalesBarChart.jsx';
import { formatKRW } from '../../utils/format.js';
import {
  fetchBoothDailySummary,
  fetchMenuSales,
  makeYesterdaySeries,
} from '../../api/manager/salesApi.js';

const Section = styled.section` display:flex; flex-direction:column; gap:14px; `;
const Row = styled.div` display:flex; gap:12px; flex-wrap:wrap; `;
const Top = styled.div` display:flex; justify-content:space-between; align-items:center; `;
const DateBox = styled.div`
  display:flex; gap:8px; align-items:center;
  input{ height:36px; border:1px solid #e5e7eb; border-radius:8px; padding:0 10px; }
`;

export default function SalesManagePage() {
  const { boothId } = useParams(); // 경로: /manager/:boothId/sales
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [summary, setSummary] = useState({ totalSales: 0, orderNumbers: 0 });
  const [menuToday, setMenuToday] = useState([]);
  const [menuY, setMenuY] = useState([]);

  const load = async () => {
    const s = await fetchBoothDailySummary(boothId, date);
    const t = await fetchMenuSales(boothId);
    setSummary(s);
    setMenuToday(t);
    setMenuY(makeYesterdaySeries(t)); // 데모용(어제 비교)
  };

  useEffect(() => { load(); }, [boothId, date]);

  const topMessage = useMemo(() => {
    // 데모: 어제 대비 증감 메시지
    const yTotal = menuY.reduce((a,b)=>a+b.totalSales,0);
    const tTotal = menuToday.reduce((a,b)=>a+b.totalSales,0);
    const diff = tTotal - yTotal;
    const sign = diff >= 0 ? '늘었어요' : '줄었어요';
    return `오늘은 어제보다 ${formatKRW(Math.abs(diff))} 매출이 ${sign}!`;
  }, [menuToday, menuY]);

  return (
    <AppLayout title="매출 관리">
      <Section>
        <Top>
          <h2 style={{margin:'0 0 8px 0'}}>통계 자료</h2>
          <DateBox>
            <span style={{color:'#6b7280', fontSize:13}}>날짜</span>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
          </DateBox>
        </Top>
        <div style={{color:'#374151', marginBottom:6}}>{topMessage}</div>

        <Row>
          <StatCard title="매출" value={summary.totalSales} isMoney />
          <StatCard title="주문 건수" value={summary.orderNumbers} />
          {/* 필요하면 카드 더 추가 */}
        </Row>

        <h3 style={{margin:'18px 0 6px'}}>메뉴별 판매액</h3>
        <Row>
          <SalesBarChart itemsToday={menuToday} itemsYesterday={menuY} />
        </Row>
      </Section>
    </AppLayout>
  );
}
