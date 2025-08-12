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
const Toggle = styled.div`
  display: inline-flex;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  > button {
    padding: 6px 10px;
    font-size: 13px;
    border: none;
    background: #fff;
    cursor: pointer;
  }
  > button.active {
    background: #111827;
    color: #fff;
  }
`;

// 오늘 응답(items[{ qty, amount }])을 차트용으로 변환
const mapTodayItemsToBars = (items = [], metric = "amount") =>
  items.map(({ menuItemId, name, qty, amount }) => ({
    menuItemId,
    name,
    totalSales: Number(metric === "qty" ? qty || 0 : amount || 0),
  }));

// 누적 응답이 { items: [...] } 또는 [...] 둘 다 수용
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
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // 상단 카드 요약
  const [summary, setSummary] = useState({
    totalSales: 0, // 금액 합
    totalQty: 0,   // 수량 합(오늘만)
    orderNumbers: 0,
    peakHour: null,
  });

  // 오늘/선택일 차트 데이터
  const [chartMetric, setChartMetric] = useState("amount"); // 'amount' | 'qty'
  const [todayRawItems, setTodayRawItems] = useState([]);   // getTodayStats().items 보관
  const [menuToday, setMenuToday] = useState([]);           // 오늘(또는 선택일 TopN) 차트용
  const [menuTotal, setMenuTotal] = useState([]);           // 전체(누적) 차트용

  const load = async () => {
    // 항상 전체(누적) 가져오기
    const total = await getMenuSales(boothId);
    setMenuTotal(normalizeTotal(total));

    if (isToday(date)) {
      // 오늘: 금액/수량 합계를 items에서 직접 계산
      const t = await getTodayStats(boothId, 10);
      const items = Array.isArray(t?.items) ? t.items : [];
      const totalAmount = items.reduce((s, it) => s + Number(it.amount || 0), 0);
      const totalQty = items.reduce((s, it) => s + Number(it.qty || 0), 0);
      
      setSummary({
        totalSales: totalAmount,
        totalQty,
        orderNumbers: Number(items.length ?? 0), // 없으면 0
        peakHour: t?.peakHour ?? null,
      });

      setTodayRawItems(items);
      setMenuToday(mapTodayItemsToBars(items, chartMetric)); // 현재 토글 기준으로 변환
    } else {
      // 과거/미래 날짜: 일자 요약만
      const s = await getDateSales(boothId, date);
      setSummary({
        totalSales: Number(s?.totalSales ?? 0),
        totalQty: 0, // 선택일 수량 정보는 없음
        orderNumbers: Number(s?.orderNumbers ?? 0),
        peakHour: null,
      });
      setTodayRawItems([]);
      setMenuToday([]); // 선택일 TopN 없음
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boothId, date]);

  // 차트 토글이 바뀌면 오늘 데이터만 재매핑
  useEffect(() => {
    if (!isToday(date)) return;
    setMenuToday(mapTodayItemsToBars(todayRawItems, chartMetric));
  }, [chartMetric, todayRawItems, date]);

  // 상단 메시지: 전체 합계 대비 선택일(오늘) 비율 (금액 기준)
  const topMessage = useMemo(() => {
    const totalSum = menuTotal.reduce((a, b) => a + (b.totalSales || 0), 0);
    const selectedDayTotal = Number(summary.totalSales || 0);
    const share =
      totalSum > 0 ? Math.round((selectedDayTotal / totalSum) * 100) : 0;
    return `선택일 매출 ${formatKRW(selectedDayTotal)} (전체 누적 ${formatKRW(
      totalSum
    )}의 ${share}%)`;
  }, [summary.totalSales, menuTotal]);

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
          {/* <StatCard
            title={`주문 건수(${isToday(date) ? "오늘" : "선택일"})`}
            value={summary.orderNumbers}
          /> */}
          {isToday(date) && (
            <StatCard
              title="판매량(오늘)"
              value={summary.totalQty}
            />
          )}
          {isToday(date) && summary.peakHour != null && (
            <StatCard title="피크 타임" value={`${summary.peakHour}시`} />
          )}
        </Row>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <h3 style={{ margin: "18px 0 6px" }}>
            메뉴별 {chartMetric === "amount" ? "매출액" : "판매량"} — 전체(누적)
            {isToday(date) ? " vs 오늘(Top 10)" : " (선택일 Top N 데이터 없음)"}
          </h3>
          {isToday(date) && (
            <Toggle>
              <button
                className={chartMetric === "amount" ? "active" : ""}
                onClick={() => setChartMetric("amount")}
              >
                금액(₩)
              </button>
              <button
                className={chartMetric === "qty" ? "active" : ""}
                onClick={() => setChartMetric("qty")}
              >
                수량(개)
              </button>
            </Toggle>
          )}
        </div>

        <Row>
          {/* itemsToday: 오늘(Top10) — 금액/수량 토글 반영
              itemsYesterday: 전체(누적) — 금액 기준 */}
          <SalesBarChart itemsToday={menuToday} itemsYesterday={menuTotal} />
        </Row>
      </Section>
    </AppLayout>
  );
}
