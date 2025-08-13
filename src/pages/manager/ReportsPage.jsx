// src/pages/manager/ManagerReportsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/common/manager/AppLayout.jsx";
import { callGpt5NanoBrowser } from "../../api/gpt.js";

// ✅ 통합 통계 API
import {
  getAllBoothDateSales,
  getAllBoothOrderStats,
  getVisitTimesByDate,
} from "../../api/manager/managerStatsApi.js";

/* ========= 유틸 ========= */
const KRW = (n = 0) =>
  (typeof n === "number" ? n : Number(n || 0)).toLocaleString("ko-KR") + "원";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pct = (a, b) => { if (!b) return 0; return ((a - b) / b) * 100; };
const fmtPct = (p) => `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`;

function getDates7(today = new Date()) {
  const arr = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}
function sumBooth(orders = []) { return orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0); }
const avg = (arr = []) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const median = (arr = []) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const percentile = (arr = [], p = 0.9) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const idx = Math.min(s.length - 1, Math.max(0, Math.ceil(p * s.length) - 1));
  return s[idx];
};

/** KPI 계산 (빈 데이터 안전 처리) */
function computeKPIs(weekSales, currentBoothId) {
  const dates = Object.keys(weekSales).sort();
  if (dates.length === 0) {
    return {
      dates: [],
      todayKey: "",
      ydayKey: "",
      myToday: 0,
      myYesterday: 0,
      changePct: 0,
      weekAvg: 0,
      rankToday: 0,
      totalBooths: 0,
      todayTotals: [],
      predicted: 0,
    };
  }

  const todayKey = dates[dates.length - 1];
  const ydayKey = dates[dates.length - 2] || dates[0];

  const todayTotals = Object.entries(weekSales[todayKey] || {}).map(([bid, arr]) => ({ boothId: bid, total: sumBooth(arr) }));
  todayTotals.sort((a, b) => b.total - a.total);

  const myToday = todayTotals.find((x) => String(x.boothId) === String(currentBoothId))?.total || 0;
  const myYesterday = sumBooth((weekSales[ydayKey] || {})[String(currentBoothId)] || []);
  const weekMyTotals = dates.map((d) => sumBooth((weekSales[d] || {})[String(currentBoothId)] || []));
  const weekAvg = weekMyTotals.reduce((a, b) => a + b, 0) / (weekMyTotals.length || 1);

  const rankToday = todayTotals.findIndex((x) => String(x.boothId) === String(currentBoothId)) + 1 || 0;
  const totalBooths = todayTotals.length;

  const last3 = weekMyTotals.slice(-3);
  const ma3 = last3.reduce((a, b) => a + b, 0) / (last3.length || 1);
  const trend = pct(myToday, myYesterday);
  const predicted = Math.round(ma3 * (1 + (trend / 100) * 0.3));

  return { dates, todayKey, ydayKey, myToday, myYesterday, changePct: pct(myToday, myYesterday), weekAvg, rankToday, totalBooths, todayTotals, predicted };
}

/** GPT 프롬프트 */
function buildPrompt(kind, weekSales, boothId, kpis) {
  const compact = JSON.stringify(weekSales);
  const header =
    `너는 푸드 페스티벌 데이터 애널리스트다. 아래는 최근 7일간 날짜별 { "YYYY-MM-DD": { "boothId": [주문들...] } } 구조의 원본 JSON 이다.\n` +
    `특히 현재 분석 대상 부스는 boothId=${boothId} 이다. 반드시 "전체 부스"와 "해당 부스"를 비교해서 결론을 내라.\n\n` +
    `보조 정보(KPI):\n` +
    `- 오늘 내 부스 매출: ${kpis.myToday} / 어제: ${kpis.myYesterday} / 변화율: ${fmtPct(kpis.changePct)}\n` +
    `- 내 부스 주간 평균: ${Math.round(kpis.weekAvg)} / 오늘 순위: ${kpis.rankToday}/${kpis.totalBooths}\n` +
    `- 내일 예상 매출(내부 추정치): ~${kpis.predicted}\n\n` +
    `원본 JSON(7일):\n${compact}\n\n`;

  const common =
    `출력 규칙:\n- "전체 vs 내 부스" 관점 비교를 최우선.\n- 항목형 요약으로 간결하게.\n- 정량(금액/수량/순위/변화율) 근거를 포함.\n- 개선 액션은 2~4개 정도, 바로 실행 가능한 톤으로.\n\n`;

  if (kind === "slow") return header + `요청: "현재 판매 부진 메뉴의 특징과 원인"을 찾아라. 전체 대비 내 부스의 상대적 약점을 강조하라.\n` + common + `섹션:\n- 판매 부진 TOP 3 (메뉴/근거)\n- 공통 특징 요약\n- 개선 액션(가격·세트·동선·프로모션)\n`;
  if (kind === "best") return header + `요청: "현재 베스트셀러 메뉴"를 전체와 내 부스 중심으로 정리하라. 내 부스 확장 아이디어를 제시하라.\n` + common + `섹션:\n- 전체 TOP 5\n- 내 부스 강세 메뉴 & 시간대\n- 확장 아이디어 3가지\n`;
  if (kind === "taste") return header + `요청: "현재 대중의 취향(맛·구성·가격대)"을 전체 vs 내 부스로 요약해라.\n` + common + `섹션:\n- 맛/조합 트렌드\n- 선호 가격대 구간\n- 내 부스와의 갭 & 코칭 포인트\n`;
  if (kind === "trend") return header + `요청: "기간별 판매 추이 요약과 내일 판매량 예측"을 작성해라. 내 부스 중심 코칭 톤.\n` + common + `섹션:\n- 요일/시간대 힌트 요약\n- 내 부스 추세 & 리스크\n- 내일 예측(낙관/보수)\n- 실행 체크리스트(2~4개)\n`;
  return header + common + `요청: 간단 요약.`;
}

/* ========= styled ========= */
const PageGrid = styled.div`display:grid; gap:16px;`;

/* 읽기용 폰트 스택 */
const READING_STACK = `'Pretendard', 'Inter', 'Noto Sans KR', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', Arial, sans-serif`;

const SummaryCardGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 12px;
  @media (max-width: 980px) { grid-template-columns: 1fr; }
`;
const ExtraCardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 980px) { grid-template-columns: 1fr; }
`;
const Card = styled.div`
  border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px; background: #fff;
  font-family: ${READING_STACK};
`;
const Title = styled.h3`
  margin:0 0 8px; font-size:18px; font-weight:700; color:#111827; font-family:${READING_STACK};
`;
const Sub = styled.p`margin:0; color:#6b7280; font-size:13px; font-family:${READING_STACK};`;
const Big = styled.div`font-size:22px; font-weight:800; margin-top:10px; color:#111827; font-family:${READING_STACK};`;
const Delta = styled.span`
  margin-left:8px; font-weight:700; color:${(p)=> (p.pos ? "#065f46" : "#991b1b")};
  background:${(p)=> (p.pos ? "#ecfdf5" : "#fef2f2")}; border:1px solid ${(p)=> (p.pos ? "#a7f3d0" : "#fecaca")};
  padding:2px 8px; border-radius:999px; font-size:12px; font-family:${READING_STACK};
`;

/* 미니 스파크바 */
const Spark = styled.div`display:grid; grid-auto-flow:column; gap:6px; align-items:end; height:72px; margin-top:8px;`;
const Bar = styled.div`
  width:14px; border-radius:6px; background:#e5e7eb; position:relative; overflow:hidden;
  &:after{ content:""; position:absolute; bottom:0; left:0; right:0; height:${(p)=>p.h||0}%; background:#111827; }
`;
const KTable = styled.table`
  width:100%; border-collapse:collapse; font-size:13px; margin-top:8px; font-family:${READING_STACK};
  th, td { border-bottom:1px solid #f3f4f6; padding:8px 4px; text-align:left; }
  th { color:#6b7280; font-weight:600; }
`;

/* 아코디언 */
const Acc = styled.div`border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; background:#fff; font-family:${READING_STACK};`;
const AccItem = styled.div`border-top:1px solid #f3f4f6; &:first-child{border-top:none;}`;
const AccBtn = styled.button`
  width:100%; display:flex; justify-content:space-between; align-items:center;
  padding:14px 16px; background:#fff; border:none; cursor:pointer; font-size:15px; font-weight:700; color:#111827;
  font-family:${READING_STACK}; letter-spacing:0.2px;
  &:hover{ background:#f9fafb; }
`;
const AccPanel = styled.div`
  padding:16px 18px; border-top:1px dashed #eee; background:#fcfcfc;
`;

/* ✅ 가독성 좋은 본문 텍스트 전용 */
const AiText = styled.div`
  font-family: ${READING_STACK};
  font-size: 15px;
  line-height: 1.75;
  letter-spacing: 0.1px;
  color: #111827;
  white-space: pre-wrap;
  word-break: keep-all;
  max-width: 72ch;
  b, strong { font-weight: 800; }
  i, em { color: #374151; }
  p { margin: 0 0 10px; }
  ul, ol { margin: 8px 0 12px 20px; }
  li { margin: 4px 0; }
  h4 { margin: 12px 0 6px; font-size: 15px; font-weight: 800; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background:#f3f4f6; padding:0 4px; border-radius:6px; }
`;

const Row = styled.div`display:flex; gap:8px; align-items:center; flex-wrap:wrap;`;
const Input = styled.input`
  width: 320px; height: 40px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family:${READING_STACK};
`;
const Backdrop = styled.div`
  position: fixed; inset: 0; background: rgba(255,255,255,0.55);
  display:flex; align-items:center; justify-content:center; z-index:40; backdrop-filter: blur(1px);
`;
const Spinner = styled.div`
  width:44px; height:44px; border-radius:50%;
  border:4px solid #e5e7eb; border-top-color:#111827; animation: spin 1s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;
const Ghost = styled.button`
  height:36px; padding:0 12px; border-radius:10px; border:1px solid #e5e7eb; background:#fff; cursor:pointer; font-size:13px; color:#111827; font-family:${READING_STACK};
`;

/* ========= 컴포넌트 ========= */
export default function ManagerReportsPage() {
  const { boothId: boothIdParam } = useParams();
  const boothId = String(boothIdParam || "1");

  // ✅ API로 채울 주간 데이터 (날짜별 → { boothId: [orders...] })
  const [weekSales, setWeekSales] = useState({});
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  // 전체 합산(오늘) & 방문시간 통계(오늘)
  const [todayTotals, setTodayTotals] = useState({ totalSalse: 0, orderNumbers: 0 });
  const [visitStats, setVisitStats] = useState({ list: [], avg: 0, median: 0, p90: 0 });

  // OpenAI 키: 최초 1회 입력 후 localStorage에 저장되면 입력창 숨김
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("OPENAI_API_KEY") || "");
  useEffect(() => { localStorage.setItem("OPENAI_API_KEY", apiKey || ""); }, [apiKey]);
  useEffect(() => {
    if (process.env.REACT_APP_OPEN) setApiKey(process.env.REACT_APP_OPEN);
  }, []);
  const hasKey = Boolean(apiKey);

  // ✅ 최근 7일 데이터 로드 (+ 오늘 집계/방문시간)
  useEffect(() => {
    let alive = true;
    (async () => {
      setDataLoading(true);
      setDataError("");
      try {
        const dates = getDates7();
        // 7일치 병렬 호출
        const results = await Promise.all(dates.map((d) => getAllBoothDateSales(d)));
        // 정상화: boothId 키는 문자열로 강제
        const normalized = {};
        dates.forEach((date, idx) => {
          const byBooth = results[idx] || {};
          const dayObj = {};
          Object.entries(byBooth).forEach(([bid, arr]) => {
            dayObj[String(bid)] = Array.isArray(arr) ? arr : [];
          });
          normalized[date] = dayObj;
        });
        if (!alive) return;
        setWeekSales(normalized);

        // 가장 최근 날짜(오늘 기준)로 ②/③ 호출
        const latestDate = dates[dates.length - 1];
        const [totals, visits] = await Promise.all([
          getAllBoothOrderStats(latestDate),
          getVisitTimesByDate(latestDate),
        ]);

        if (!alive) return;

        const list = Array.isArray(visits)
          ? visits.map((n) => Number(n) || 0).filter((n) => n >= 0)
          : [];

        setTodayTotals(totals || { totalSalse: 0, orderNumbers: 0 });
        setVisitStats({
          list,
          avg: avg(list),
          median: median(list),
          p90: percentile(list, 0.9),
        });
      } catch (e) {
        if (alive) setDataError(e?.message || "주간/집계 데이터를 불러오지 못했습니다.");
      } finally {
        if (alive) setDataLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const kpis = useMemo(() => computeKPIs(weekSales, boothId), [weekSales, boothId]);

  // GPT 호출 상태
  const [loading, setLoading] = useState(false);
  const [openIdx, setOpenIdx] = useState(-1);
  const [answers, setAnswers] = useState({}); // kind -> text
  const [error, setError] = useState("");

  const weekRows = useMemo(() => {
    if (!kpis.dates.length) return [];
    return kpis.dates.map((d) => {
      const mine = sumBooth((weekSales[d] || {})[boothId] || []);
      const allTotals = Object.values(weekSales[d] || {}).map((arr) => sumBooth(arr));
      const allAvg = (allTotals.reduce((a, b) => a + b, 0) / (allTotals.length || 1)) | 0;
      return { date: d, my: mine, allAvg };
    });
  }, [kpis.dates, weekSales, boothId]);
  const maxForSpark = Math.max(...weekRows.map((r) => r.my), 1);

  async function run(kind, idxToOpen) {
    if (!apiKey) { setError("OpenAI API 키를 입력해주세요."); return; }
    if (!kpis.dates.length) { setError("데이터가 아직 준비되지 않았습니다."); return; }
    setError("");
    setOpenIdx(idxToOpen);
    setLoading(true);
    try {
      const prompt = buildPrompt(kind, weekSales, boothId, kpis);
      const text = await callGpt5NanoBrowser(prompt, apiKey);
      setAnswers((prev) => ({ ...prev, [kind]: text || "(빈 응답)" }));
    } catch (e) {
      setError(e?.message || "분석 호출 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const deltaPos = kpis.changePct >= 0;
  const totalSalesAll = (todayTotals && (todayTotals.totalSalse ?? todayTotals.totalSales)) || 0;
  const visitMax = Math.max(...visitStats.list, 1);

  return (
    <AppLayout title="비즈니스 리포트">
      {(loading || dataLoading) && (<Backdrop><Spinner /></Backdrop>)}
      <PageGrid>
        {/* 상단 제어 */}
        <Row>
          {!hasKey && (
            <Input
              type="password"
              placeholder="API Key 입력"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
            />
          )}
          {dataError && <Sub style={{ color:"#b91c1c" }}>{dataError}</Sub>}
          {kpis.dates.length > 0 && (
            <Sub>데이터 범위: {kpis.dates[0]} ~ {kpis.dates[kpis.dates.length - 1]}</Sub>
          )}
        </Row>

        {/* 요약 카드 (내 부스 중심) */}
        <SummaryCardGrid>
          <Card>
            <Title>매출 요약</Title>
            <Sub>
              {kpis.dates.length
                ? <>오늘은 어제보다 <b>{fmtPct(kpis.changePct)}</b> {deltaPos ? "상승" : "하락"}했어요.</>
                : "데이터 로딩 중 또는 데이터가 없습니다."
              }
            </Sub>
            <Big>
              {KRW(kpis.myToday)} {kpis.dates.length ? <Delta pos={deltaPos}>{fmtPct(kpis.changePct)}</Delta> : null}
            </Big>

            <Sub style={{ marginTop: 10 }}>최근 7일 매출 (내 부스)</Sub>
            <Spark>
              {weekRows.map((r) => (
                <Bar key={r.date} h={Math.round((r.my / maxForSpark) * 100)} title={`${r.date} / ${KRW(r.my)}`} />
              ))}
            </Spark>
          </Card>

          <Card>
            <Title>내일 예상 매출</Title>
            <Sub>최근 추세와 이동평균 기반 단순 추정</Sub>
            <Big>{KRW(kpis.predicted)}</Big>
            <KTable>
              <tbody>
                <tr><th>어제</th><td>{KRW(kpis.myYesterday)}</td></tr>
                <tr><th>주간 평균</th><td>{KRW(Math.round(kpis.weekAvg))}</td></tr>
                <tr><th>오늘 변화율</th><td>{fmtPct(kpis.changePct)}</td></tr>
              </tbody>
            </KTable>
          </Card>

          <Card>
            <Title>오늘 우리 부스 포지션</Title>
            <Big>{kpis.rankToday} / {kpis.totalBooths}위</Big>
            <Sub style={{ marginTop: 10 }}>오늘 전체 부스 매출 TOP</Sub>
            <KTable>
              <tbody>
                {(kpis.todayTotals || []).slice(0, 5).map((r, i) => (
                  <tr key={r.boothId}>
                    <th>#{i + 1} 부스 {r.boothId}</th>
                    <td>{KRW(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </KTable>
          </Card>
        </SummaryCardGrid>

        {/* 추가 카드 (전체 합산 & 방문시간) */}
        <ExtraCardGrid>
          <Card>
            <Title>오늘 전체 합산 (모든 부스)</Title>
            <Sub>모든 부스의 총 매출/주문수</Sub>
            <Big>{KRW(totalSalesAll)}</Big>
            <KTable>
              <tbody>
                <tr><th>총 주문 수</th><td>{(todayTotals?.orderNumbers || 0).toLocaleString("ko-KR")} 건</td></tr>
              </tbody>
            </KTable>
          </Card>

          <Card>
            <Title>오늘 식사 시간 평균 (분)</Title>
            <Sub>주문한 시간 ~ 식사를 끝낸 시간</Sub>
            <KTable>
              <tbody>
                <Big>{Math.round(visitStats.avg) || 0} 분</Big>
              </tbody>
            </KTable>

            <Spark>
              {visitStats.list.slice(0, 24).map((m, i) => (
                <Bar key={i} h={Math.round((m / visitMax) * 100)} title={`${m}분`} />
              ))}
            </Spark>
          </Card>
        </ExtraCardGrid>

        {/* AI Recommendations */}
        <div>
          <Title style={{ marginBottom: 8 }}>AI Recommendations</Title>
          <Acc>
            <AccItem>
              <AccBtn onClick={() => run("slow", 0)}>
                <span>① 판매 부진 메뉴 분석</span><span>자세히 보기</span>
              </AccBtn>
              {openIdx === 0 && (
                <AccPanel>{error ? <Sub style={{ color: "#b91c1c" }}>{error}</Sub> : (
                  <AiText>{answers["slow"] || "분석을 실행 중이거나 아직 결과가 없습니다."}</AiText>
                )}</AccPanel>
              )}
            </AccItem>

            <AccItem>
              <AccBtn onClick={() => run("best", 1)}>
                <span>② 베스트셀러 메뉴</span><span>자세히 보기</span>
              </AccBtn>
              {openIdx === 1 && (
                <AccPanel>{error ? <Sub style={{ color: "#b91c1c" }}>{error}</Sub> : (
                  <AiText>{answers["best"] || "분석을 실행 중이거나 아직 결과가 없습니다."}</AiText>
                )}</AccPanel>
              )}
            </AccItem>

            <AccItem>
              <AccBtn onClick={() => run("taste", 2)}>
                <span>③ 대중 취향 요약</span><span>자세히 보기</span>
              </AccBtn>
              {openIdx === 2 && (
                <AccPanel>{error ? <Sub style={{ color: "#b91c1c" }}>{error}</Sub> : (
                  <AiText>{answers["taste"] || "분석을 실행 중이거나 아직 결과가 없습니다."}</AiText>
                )}</AccPanel>
              )}
            </AccItem>

            <AccItem>
              <AccBtn onClick={() => run("trend", 3)}>
                <span>④ 기간별 추이 & 예측</span><span>자세히 보기</span>
              </AccBtn>
              {openIdx === 3 && (
                <AccPanel>{error ? <Sub style={{ color: "#b91c1c" }}>{error}</Sub> : (
                  <AiText>{answers["trend"] || "분석을 실행 중이거나 아직 결과가 없습니다."}</AiText>
                )}</AccPanel>
              )}
            </AccItem>
          </Acc>
        </div>
      </PageGrid>
    </AppLayout>
  );
}
