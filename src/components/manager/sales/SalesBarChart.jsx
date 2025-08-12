// src/components/manager/sales/SalesBarChart.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { formatKRW } from "../../../utils/format.js";

const Wrap = styled.div`
  width: 100%;
  height: 340px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 12px 16px 6px;
  position: relative;
`;

// 간단한 툴팁
const Tooltip = styled.div`
  position: absolute;
  pointer-events: none;
  transform: translate(-50%, -120%);
  background: #111827;
  color: #fff;
  font-size: 12px;
  padding: 8px 10px;
  border-radius: 8px;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  z-index: 2;
`;

/**
 * today / total(=기존 yesterday) 시리즈 병합
 * itemsToday: [{menuItemId, name, totalSales}]
 * itemsYesterday: [{menuItemId, name, totalSales}]  ← 전체 누적을 여기에 담아 전달
 */
function mergeSeries(today = [], yesterday = []) {
  const byId = new Map();
  today.forEach((it) =>
    byId.set(it.menuItemId, {
      name: it.name,
      today: it.totalSales || 0,
      yesterday: 0,
    })
  );
  yesterday.forEach((it) => {
    const cur = byId.get(it.menuItemId) || {
      name: it.name,
      today: 0,
      yesterday: 0,
    };
    cur.yesterday = it.totalSales || 0; // ← 의미상 "전체" 값
    byId.set(it.menuItemId, cur);
  });
  return Array.from(byId.values());
}

// 라벨 너무 길면 말줄임
const ellipsis = (s = "", max = 6) =>
  s.length > max ? s.slice(0, max) + "…" : s;

export default function SalesBarChart({
  itemsToday = [],
  itemsYesterday = [],
}) {
  // itemsYesterday 는 “전체(누적)” 시리즈로 취급
  const data = useMemo(
    () => mergeSeries(itemsToday, itemsYesterday),
    [itemsToday, itemsYesterday]
  );

  const ref = useRef(null);
  const [size, setSize] = useState({ w: 600, h: 300 });

  // 반응형 사이즈
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setSize({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const margin = { top: 16, right: 16, bottom: 58, left: 56 };
  const innerW = Math.max(0, size.w - margin.left - margin.right);
  const innerH = Math.max(0, size.h - margin.top - margin.bottom);

  const maxVal = useMemo(() => {
    const vals = data.flatMap((d) => [d.today, d.yesterday]); // yesterday=전체
    return Math.max(1, ...vals);
  }, [data]);

  const yScale = (v) => innerH - (v / maxVal) * innerH;

  // ▼ 막대 두께 줄임
  const groupGap = 18; // 그룹 간격 조금 넓힘
  const groupW = data.length > 0 ? innerW / data.length : 0;
  // 두 막대 + 막대간격(4px)을 고려해 각 막대의 최대 폭을 10px로 제한
  const barInnerGap = 4;
  const barW = Math.min(10, Math.max(6, (groupW - groupGap - barInnerGap) / 2));

  // 툴팁 상태
  const [tip, setTip] = useState(null);

  const yTicks = 4;
  const tickVals = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxVal * i) / yTicks)
  );

  return (
    <Wrap ref={ref}>
      {tip && (
        <Tooltip style={{ left: tip.x, top: tip.y }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{tip.name}</div>
          <div>전체: {formatKRW(tip.yesterday)}</div>
          <div>오늘: {formatKRW(tip.today)}</div>
        </Tooltip>
      )}

      <svg width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`}>
        {/* grid & axes */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* 가로 그리드 */}
          {tickVals.map((v, i) => (
            <line
              key={`grid-${i}`}
              x1={0}
              x2={innerW}
              y1={yScale(v)}
              y2={yScale(v)}
              stroke="#e5e7eb"
              strokeDasharray="3 3"
            />
          ))}

          {/* Y축 눈금/라벨 */}
          {tickVals.map((v, i) => (
            <g key={`ytick-${i}`} transform={`translate(0, ${yScale(v)})`}>
              <text x={-10} y={4} textAnchor="end" fontSize="11" fill="#6b7280">
                {formatKRW(v)}
              </text>
            </g>
          ))}

          {/* 막대들 */}
          {data.map((d, idx) => {
            const gx = idx * groupW + groupGap / 2;
            const yH = innerH - yScale(d.yesterday); // 전체
            const tH = innerH - yScale(d.today); // 오늘

            const yesterdayX = gx;
            const todayX = gx + barW + barInnerGap; // 막대 사이 간격 축소

            const yesterdayY = yScale(d.yesterday);
            const todayY = yScale(d.today);

            return (
              <g key={idx}>
                {/* 전체 막대 (연한 오렌지) */}
                <rect
                  x={yesterdayX}
                  y={yesterdayY}
                  width={barW}
                  height={Math.max(0, yH)}
                  rx="5"
                  fill="#f8c7a8"
                  onMouseEnter={(e) =>
                    setTip({
                      x: e.clientX - ref.current.getBoundingClientRect().left,
                      y: e.clientY - ref.current.getBoundingClientRect().top,
                      name: d.name,
                      today: d.today,
                      yesterday: d.yesterday,
                    })
                  }
                  onMouseMove={(e) =>
                    setTip(
                      (t) =>
                        t && {
                          ...t,
                          x:
                            e.clientX -
                            ref.current.getBoundingClientRect().left,
                          y:
                            e.clientY - ref.current.getBoundingClientRect().top,
                        }
                    )
                  }
                  onMouseLeave={() => setTip(null)}
                />
                {/* 오늘 막대 (진한 오렌지) */}
                <rect
                  x={todayX}
                  y={todayY}
                  width={barW}
                  height={Math.max(0, tH)}
                  rx="5"
                  fill="#f97316"
                  onMouseEnter={(e) =>
                    setTip({
                      x: e.clientX - ref.current.getBoundingClientRect().left,
                      y: e.clientY - ref.current.getBoundingClientRect().top,
                      name: d.name,
                      today: d.today,
                      yesterday: d.yesterday,
                    })
                  }
                  onMouseMove={(e) =>
                    setTip(
                      (t) =>
                        t && {
                          ...t,
                          x:
                            e.clientX -
                            ref.current.getBoundingClientRect().left,
                          y:
                            e.clientY - ref.current.getBoundingClientRect().top,
                        }
                    )
                  }
                  onMouseLeave={() => setTip(null)}
                />

                {/* X 라벨 */}
                <text
                  x={gx + (barW * 2 + barInnerGap) / 2}
                  y={innerH + 18}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#374151"
                >
                  {ellipsis(d.name, 6)}
                </text>
              </g>
            );
          })}

          {/* X축 */}
          <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="#e5e7eb" />
        </g>

        {/* 범례 */}
        <g transform={`translate(${margin.left}, ${margin.top - 4})`}>
          <rect x={0} y={-8} width={12} height={12} rx={2} fill="#f8c7a8" />
          <text x={18} y={2} fontSize="12" fill="#6b7280">
            전체
          </text>
          <rect x={54} y={-8} width={12} height={12} rx={2} fill="#f97316" />
          <text x={72} y={2} fontSize="12" fill="#6b7280">
            오늘
          </text>
        </g>
      </svg>
    </Wrap>
  );
}
