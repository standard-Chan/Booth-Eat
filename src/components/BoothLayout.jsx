import React, { useMemo } from 'react';
import { Outlet, useParams, Navigate, Link } from 'react-router-dom';
import { paths } from '../routes/paths.js';

export default function BoothLayout() {
  const { boothId } = useParams();
  const isValid = useMemo(() => {
    // 숫자만 허용 (필요시 더 엄격히 검증)
    return /^\d+$/.test(String(boothId || ''));
  }, [boothId]);

  if (!isValid) {
    // 잘못된 boothId면 기본 부스로 보낸다(혹은 부스 선택 페이지로 이동)
    return <Navigate to="/booths/1/menu" replace />;
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px' }}>
      {/* 데모용 상단 네비게이션 */}
      <Outlet />
    </div>
  );
}
