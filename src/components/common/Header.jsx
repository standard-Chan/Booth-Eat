import React from 'react';
import styled from 'styled-components';

export default function Header({ title = 'Menu', leftIcon, rightIcon, onLeft, onRight }) {
  return (
    <Wrap>
      <IconBox onClick={onLeft}>{leftIcon ?? <span style={{fontSize:18}}>🧾</span>}</IconBox>
      <Title>{title}</Title>
      <IconBox onClick={onRight}>{rightIcon ?? <span style={{fontSize:18}}>🛒</span>}</IconBox>
    </Wrap>
  );
}

const Wrap = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  padding: 12px 8px;
  border-bottom: 1px solid #f2f2f2;
`;

const IconBox = styled.button`
  height: 40px;
  width: 40px;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

const Title = styled.h1`
  margin: 0;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
`;
