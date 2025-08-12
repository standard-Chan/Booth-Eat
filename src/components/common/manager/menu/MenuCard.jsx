// src/components/manager/menu/MenuCard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { getMenuTotalOrders } from '../../../../api/manager/menuApi';


const Card = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 20px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Left = styled.div`
  display:flex; align-items:center; gap:14px;
`;

const StatusDot = styled.span`
  display:inline-block; width:9px; height:9px; border-radius:50%;
  background: ${({on}) => (on ? '#ff6a2b' : '#9aa0a6')};
`;

const Name = styled.div`
  font-weight: 700; font-size: 18px;
`;

const Meta = styled.div`
  color:#6b7280; font-size: 14px; display:flex; gap:18px;
  b { color:#111320; margin-right:6px; font-weight:600;}
`;

const Right = styled.div`
  display:flex; align-items:center; gap:8px;
`;

const GhostButton = styled.button`
  border:1px solid #e5e7eb; background:#f9fafb; border-radius:8px;
  padding:8px 10px; font-size:13px; cursor:pointer;
  &:hover{ background:#f3f4f6; }
`;

const IconBtn = styled.button`
  width:34px; height:34px; border:1px solid #e5e7eb; background:#fff; border-radius:8px; cursor:pointer;
  display:grid; place-items:center;
  &:hover{ background:#f9fafb; }
  svg{ width:16px; height:16px; }
`;

const Thumb = styled.img`
  width:48px; height:48px; object-fit:cover; border-radius:10px; border:1px solid #eee;
`;

export default function MenuCard({
  item,
  onEdit,
  onDelete,
  onToggleLocal, // (id, nextAvailable) → 페이지에서 API 호출/롤백 처리
}) {
  const [qty, setQty] = useState(0);
  const [loadingQty, setLoadingQty] = useState(false);

  const thumbSrc = useMemo(() => {
    if (!item.previewImage) return null;
    if (typeof item.previewImage === 'string') return item.previewImage;
    if (item.previewImage && item.previewImage.name) {
      return URL.createObjectURL(item.previewImage); // File/Blob
    }
    return null;
  }, [item.previewImage]);

  // Blob URL 정리
  useEffect(() => {
    return () => {
      if (thumbSrc && thumbSrc.startsWith('blob:')) URL.revokeObjectURL(thumbSrc);
    };
  }, [thumbSrc]);

  // 총 주문량 조회
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingQty(true);
      try {
        const res = await getMenuTotalOrders(item.boothId, item.menuItemId);
        if (!cancelled) setQty(res?.totalOrderQuantity ?? 0);
      } catch {
        if (!cancelled) setQty(0);
      } finally {
        if (!cancelled) setLoadingQty(false);
      }
    })();
    return () => { cancelled = true; };
  }, [item.boothId, item.menuItemId]);

  const handleToggle = () => {
    const next = !item.available;
    onToggleLocal(item.menuItemId, next); // 실제 서버 반영/롤백은 부모가 담당
  };

  return (
    <Card>
      <Left>
        <StatusDot on={item.available} />
        {thumbSrc && <Thumb src={thumbSrc} alt={item.name} />}
        <div>
          <Name>{item.name}</Name>
          <Meta>
            <span><b>주문량</b>{loadingQty ? '…' : `${qty} 개`}</span>
          </Meta>
        </div>
      </Left>

      <Right>
        <GhostButton onClick={handleToggle}>
          {item.available ? '판매 중지하기' : '판매 재개'}
        </GhostButton>

        <IconBtn onClick={() => onEdit(item)}>
          {/* 연필 아이콘 */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
          </svg>
        </IconBtn>

        <IconBtn onClick={() => onDelete(item)}>
          {/* 휴지통 아이콘 */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18"/><path d="M8 6V4h8v2"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </IconBtn>
      </Right>
    </Card>
  );
}
