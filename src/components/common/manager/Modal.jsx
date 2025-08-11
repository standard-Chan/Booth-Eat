// src/components/common/manager/Modal.jsx
import React from 'react';
import styled from 'styled-components';

export default function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={(e) => e.stopPropagation()}>
        <Head>
          <h3>{title}</h3>
          <Close onClick={onClose} aria-label="닫기">✕</Close>
        </Head>
        <Body>{children}</Body>
      </Sheet>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.35);
  display: grid; place-items: center;
  z-index: 1000;
`;
const Sheet = styled.div`
  width: min(720px, 92vw);
  max-height: 80vh;
  overflow: auto;
  background: #fff; border-radius: 16px; border: 1px solid #eee;
`;
const Head = styled.div`
  display:flex; justify-content:space-between; align-items:center;
  padding:16px 18px; border-bottom:1px solid #eee;
  h3 { margin:0; font-size:18px; font-weight:800; }
`;
const Close = styled.button`
  border:0; background:transparent; cursor:pointer; font-size:18px;
`;
const Body = styled.div` padding:18px; `;
