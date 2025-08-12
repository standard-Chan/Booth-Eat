// src/components/common/manager/Header.jsx
import React from "react";
import styled from "styled-components";

export default function Header({ title = "주문 관리" }) {
  return (
    <HeaderBar>
      <Title>{title}</Title>
      <Right>
        {/* <Bell aria-label="알림">🔔</Bell> */}
        {/* <Avatar
        /> */}
      </Right>
    </HeaderBar>
  );
}

const HeaderBar = styled.header`
  /* sticky는 레이아웃에서 처리 */
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: #ffffffcc;
  backdrop-filter: saturate(180%) blur(8px);
  border-bottom: 1px solid #eee;
  width: 100%;
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
    background: #ff5a5a;
  }
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  object-fit: cover;
`;
