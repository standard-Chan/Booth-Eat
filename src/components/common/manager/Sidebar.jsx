// src/components/common/Sidebar.jsx
import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const { pathname } = useLocation();

  const menus = [
    { to: '/orders', label: '주문 관리', icon: 'ㅇㅇ' },
    { to: '/menus', label: '메뉴 관리', icon: '📖' },
    { to: '/sales', label: '매출 관리', icon: '👤' },
    { to: '/reports', label: '비즈니스 리포트', icon: '💬' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <SidebarWrap>
      <Brand>Booth-eat</Brand>

      <Section>
        {menus.map((m) => (
          <Item key={m.to} to={m.to} $active={pathname.startsWith(m.to)}>
            <Icon>{m.icon}</Icon>
            {m.label}
          </Item>
        ))}
      </Section>
    </SidebarWrap>
  );
}


const SidebarWrap = styled.aside`
  position: fixed;
  inset: 0 auto 0 0;
  width: 240px;
  background: #ffffff;
  border-right: 1px solid #eee;
  padding: 28px 20px;
  overflow-y: auto;
`;

const Brand = styled.h1`
  font-weight: 800;
  font-size: 28px;
  letter-spacing: -0.02em;
  color: #111320;
  margin: 0 0 36px;
`;

const Section = styled.div`
  display: grid;
  gap: 10px;
`;

const Item = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  border-radius: 12px;
  color: ${({ $active }) => ($active ? '#111320' : '#8a6e63')};
  background: ${({ $active }) => ($active ? '#f5f1ee' : 'transparent')};
  text-decoration: none;
  font-weight: 600;
  transition: background 0.15s ease;

  &:hover {
    background: #f7f7f7;
    color: #111320;
  }
`;

const Icon = styled.span`
  font-size: 20px;
  width: 24px;
  text-align: center;
`;

