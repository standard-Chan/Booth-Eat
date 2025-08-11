import React, { useMemo } from 'react';
import styled from 'styled-components';
import { formatKRW } from '../../../utils/format.js';

const Wrap = styled.div`
  background:#fff; border:1px solid #eee; border-radius:18px; padding:18px;
`;

const Head = styled.div`
  display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;
`;
const Title = styled.h3` margin:0; font-size:18px; `;
const Small = styled.span` color:#6b7280; font-size:13px; `;

const Legend = styled.div`
  display:flex; gap:12px; align-items:center;
  span{ display:inline-flex; align-items:center; gap:6px; font-size:12px; color:#6b7280; }
  i{ display:inline-block; width:10px; height:10px; border-radius:3px; }
`;

export default function SalesBarChart({ itemsToday, itemsYesterday, height=260 }) {
  const { max, seriesToday, seriesY } = useMemo(() => {
    const maxV = Math.max(
      ...itemsToday.map(i=>i.totalSales),
      ...(itemsYesterday?.map(i=>i.totalSales) || [0])
    ) || 1;
    return {
      max: maxV,
      seriesToday: itemsToday,
      seriesY: itemsYesterday || [],
    };
  }, [itemsToday, itemsYesterday]);

  const width = Math.max(560, itemsToday.length * 120);
  const padding = { left: 40, right: 16, top: 16, bottom: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const xStep = chartW / (seriesToday.length || 1);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(r => Math.round(max * r / 1000) * 1000);

  const barW = 18;  // 어제/오늘 이중 막대
  const gap = 8;

  return (
    <Wrap>
      <Head>
        <div>
          <Title>메뉴별 판매액</Title>
          <Small>막대를 호버하면 금액이 보여요</Small>
        </div>
        <Legend>
          <span><i style={{background:'#f3d6c8'}}/>어제</span>
          <span><i style={{background:'#ff6a2b'}}/>오늘</span>
        </Legend>
      </Head>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* grid */}
        {yTicks.map((v, idx) => {
          const y = padding.top + chartH - (v / max) * chartH;
          return (
            <g key={idx}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f0f1f3"/>
              <text x={padding.left - 8} y={y} textAnchor="end" fontSize="10" fill="#9aa0a6">
                {v.toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* bars */}
        {seriesToday.map((it, i) => {
          const xBase = padding.left + xStep * i + xStep/2 - (barW*2 + gap)/2;
          const hToday = (it.totalSales / max) * chartH;
          const yToday = padding.top + chartH - hToday;

          const yItem = itemsYesterday?.find(y => y.menuItemId === it.menuItemId);
          const hY = yItem ? (yItem.totalSales / max) * chartH : 0;
          const yY = padding.top + chartH - hY;

          return (
            <g key={it.menuItemId}>
              {/* yesterday */}
              {yItem && (
                <rect x={xBase} y={yY} width={barW} height={hY} fill="#f3d6c8">
                  <title>{`${it.name} 어제: ${formatKRW(yItem.totalSales)}`}</title>
                </rect>
              )}
              {/* today */}
              <rect x={xBase + barW + gap} y={yToday} width={barW} height={hToday} fill="#ff6a2b">
                <title>{`${it.name} 오늘: ${formatKRW(it.totalSales)}`}</title>
              </rect>

              {/* x labels */}
              <text x={xBase + barW + gap/2} y={height - 12} textAnchor="middle" fontSize="11" fill="#666">
                {it.name}
              </text>
            </g>
          );
        })}
      </svg>
    </Wrap>
  );
}
