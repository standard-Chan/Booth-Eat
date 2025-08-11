// src/components/common/Header.jsx
import React from "react";
import styled from "styled-components";

export default function Header({ title = "주문 관리" }) {
  return (
    <HeaderBar>
      <Title>{title}</Title>
      <Right>
        <Bell aria-label="알림">🔔</Bell>
        {/* 임시 아바타 이미지 — 프로젝트에 맞게 교체 가능 */}
        <Avatar
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop"
          alt="avatar"
        />
      </Right>
    </HeaderBar>
  );
}

const HeaderBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: #ffffffcc;
  backdrop-filter: saturate(180%) blur(8px);
  border-bottom: 1px solid #eee;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #111320;
  letter-spacing: -0.02em;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Bell = styled.button`
  height: 44px;
  width: 44px;
  border-radius: 999px;
  border: 1px solid #eee;
  background: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 10px;
    right: 10px;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #ff5a5a; /* 알림 점 */
  }
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  object-fit: cover;
`;
