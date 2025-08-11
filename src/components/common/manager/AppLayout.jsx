// src/components/common/manager/AppLayout.jsx
import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

const Global = createGlobalStyle`
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    font-family: 'Pretendard', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial,
      'Apple SD Gothic Neo', 'Noto Sans KR', '맑은 고딕', 'Malgun Gothic', sans-serif;
    background:#fff; color:#111320;
  }
`;

const Shell = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr; /* 좌: 사이드바, 우: 컨텐츠 */
  grid-template-rows: 72px 1fr;     /* 상: 헤더, 하: 본문 */
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  min-height: 100vh;
`;

const SidebarArea = styled.div`
  grid-area: sidebar;
`;

const HeaderArea = styled.div`
  grid-area: header;
  position: sticky;
  top: 0;
  z-index: 10; /* 콘텐츠 위에 올라오게 */
`;

const Main = styled.main`
  grid-area: main;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  padding: 28px;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
`;

export default function AppLayout({ title, children }) {
  return (
    <>
      <Global />
      <Shell>
        <SidebarArea>
          <Sidebar />
        </SidebarArea>

        <HeaderArea>
          <Header title={title} />
        </HeaderArea>

        <Main>
          <Content>{children}</Content>
        </Main>
      </Shell>
    </>
  );
}
