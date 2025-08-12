// src/pages/manager/SalesManagePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/common/manager/AppLayout.jsx";
import StatCard from "../../components/manager/sales/StatCard.jsx";
import SalesBarChart from "../../components/manager/sales/SalesBarChart.jsx";
import { formatKRW } from "../../utils/format.js";
import {
  getMenuSales,
  getTodayStats,
  getDateSales,
} from "../../api/manager/managerDashBoardApi.js";

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;
const Row = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;
const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const DateBox = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  input {
    height: 36px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0 10px;
  }
`;

// TodayStatsResponse.topItems -> 차트용 포맷
const toBarItems = (topItems = []) =>
  topItems.map(({ menuItemId, name, amount }) => ({
    menuItemId,
    name,
    totalSales: Number(amount || 0),
  }));

// 응답이 { items: [...] } 또는 [...] 둘 다 수용
const normalizeTotal = (resp) => {
  const arr = Array.isArray(resp) ? resp : resp?.items;
  return (arr || []).map(({ menuItemId, name, totalSales }) => ({
    menuItemId,
    name,
    totalSales: Number(totalSales || 0),
  }));
};

const isToday = (yyyyMMdd) => {
  const today = new Date().toISOString().slice(0, 10);
  return yyyyMMdd === today;
};

export default function SalesManagePage() {
  const { boothId } = useParams(); // /manager/:boothId/sales
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)); // 표시용
  const [summary, setSummary] = useState({
    totalSales: 0,
    orderNumbers: 0,
    peakHour: null,
  });
  const [menuToday, setMenuToday] = useState([]); // 선택일 Top N (오늘일 때만 채움)
  const [menuTotal, setMenuTotal] = useState([]); // 전체(누적)

  const load = async () => {
    // 항상 전체(누적) 가져오기
    const total = await getMenuSales(boothId);
    setMenuTotal(normalizeTotal(total));

    if (isToday(date)) {
      // 오늘: 오늘 전용 API(peakHour/TopN 지원)
      const t = await getTodayStats(boothId, 10);
      setSummary({
        totalSales: Number(t?.totalAmount ?? 0),
        orderNumbers: Number(t?.totalOrders ?? 0),
        peakHour: t?.peakHour ?? null,
      });
      setMenuToday(toBarItems(t?.topItems || []));
    } else {
      // 과거/미래 날짜: 일자 요약만 (TopN 없음)
      const s = await getDateSales(boothId, date);
      setSummary({
        totalSales: Number(s?.totalSales ?? 0),
        orderNumbers: Number(s?.orderNumbers ?? 0),
        peakHour: null, // 해당 API에 없음
      });
      setMenuToday([]); // 선택일 TopN 데이터가 없으니 비움(차트는 전체만 그려짐)
    }
  };

  useEffect(() => {
    load();
  }, [boothId, date]);

  // 상단 메시지: 전체 합계 vs 선택일 합계
  const topMessage = useMemo(() => {
    const daySum = menuToday.reduce((a, b) => a + (b.totalSales || 0), 0);
    // 선택일이 오늘이 아닐 수 있으므로 카드의 합계를 우선 사용 (topItems가 비어도 정확)
    const selectedDayTotal = summary.totalSales || daySum;
    const totalSum = menuTotal.reduce((a, b) => a + (b.totalSales || 0), 0);
    const share =
      totalSum > 0 ? Math.round((selectedDayTotal / totalSum) * 100) : 0;
    return `선택일 매출 ${formatKRW(selectedDayTotal)} (전체 누적 ${formatKRW(
      totalSum
    )}의 ${share}%)`;
  }, [summary.totalSales, menuToday, menuTotal]);

  return (
    <AppLayout title="매출 관리">
      <Section>
        <Top>
          <h2 style={{ margin: "0 0 8px 0" }}>통계 자료</h2>
          <DateBox>
            <span style={{ color: "#6b7280", fontSize: 13 }}>날짜</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </DateBox>
        </Top>

        <div style={{ color: "#374151", marginBottom: 6 }}>{topMessage}</div>

        <Row>
          <StatCard
            title={`매출(${isToday(date) ? "오늘" : "선택일"})`}
            value={summary.totalSales}
            isMoney
          />
          <StatCard
            title={`주문 건수(${isToday(date) ? "오늘" : "선택일"})`}
            value={summary.orderNumbers}
          />
          {isToday(date) && summary.peakHour != null && (
            <StatCard title="피크 타임" value={`${summary.peakHour}시`} />
          )}
        </Row>

        <h3 style={{ margin: "18px 0 6px" }}>
          메뉴별 판매액 — 전체(누적)
          {isToday(date) ? " vs 오늘(Top 10)" : " (선택일 Top N 데이터 없음)"}
        </h3>
        <Row>
          {/* itemsYesterday: 전체(누적), itemsToday: 오늘(또는 선택일 TopN이 없으면 빈 배열) */}
          <SalesBarChart itemsToday={menuToday} itemsYesterday={menuTotal} />
        </Row>
      </Section>
    </AppLayout>
  );
}
