import React, { useEffect } from 'react';
import styled from 'styled-components';

export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    // 스크롤 잠금
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Backdrop onClick={onClose}>
      <Panel role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {children}
      </Panel>
    </Backdrop>
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5); /* 어두운 배경 */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 95px 12px;
  z-index: 1000;
  overflow-y: auto;
`;

const Panel = styled.div`
  width: min(560px, 96vw);
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.24);
  position: relative;
`;
