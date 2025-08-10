import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import { paths } from '../routes/paths.js';

export default function OrderHistoryPage() {
  const { boothId } = useParams();
  const navigate = useNavigate();

  return (
    <Page>
      <Header
        title="나의 주문내역"
        leftIcon={<span style={{ fontSize: 20 }}>←</span>}
        onLeft={() => navigate(-1)}
        rightIcon={<span />}
      />
      <Body>
        <Placeholder>주문 내역 페이지(임시)</Placeholder>
        <GoMenu onClick={() => navigate(paths.menu(boothId))}>메뉴로</GoMenu>
      </Body>
    </Page>
  );
}

const Page = styled.div`
  max-width: 560px;
  margin: 0 auto;
`;

const Body = styled.div`
  padding: 16px;
`;

const Placeholder = styled.div`
  padding: 24px;
  border: 1px dashed #ccc;
  border-radius: 12px;
  text-align: center;
  color: #666;
`;

const GoMenu = styled.button`
  margin-top: 16px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #fafafa;
  padding: 0 16px;
  cursor: pointer;
`;
