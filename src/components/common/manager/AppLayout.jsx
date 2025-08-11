// src/components/common/manager/AppLayout.jsx
import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

const Global = createGlobalStyle`
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { margin: 0; font-family: 'Pretendard', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', '맑은 고딕', 'Malgun Gothic', sans-serif; background:#fff; color:#111320;}
`;

const Shell = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
`;

const Main = styled.main`
  margin-left: 240px;
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
        <Sidebar />
        <Main>
          <Header title={title} />
          <Content>{children}</Content>
        </Main>
      </Shell>
    </>
  );
}
