// src/components/manager/menu/MenuCard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import MenuEditorRow from './MenuEditorRow.jsx';
import { fetchOrderQty, setAvailable } from '../../../../api/manager/menuApi.js';

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
  onToggleLocal, // optimistic available toggle
}) {
  const [qty, setQty] = useState(0);
  const [loadingQty, setLoadingQty] = useState(false);

  const thumbSrc = useMemo(() => {
    if (!item.previewImage) return null;
    // 문자열이면 URL로, File이면 blob URL로
    if (typeof item.previewImage === 'string') return item.previewImage;
    if (item.previewImage && item.previewImage.name) {
      return URL.createObjectURL(item.previewImage);
    }
    return null;
  }, [item.previewImage]);

  useEffect(() => {
    let done = false;
    (async () => {
      setLoadingQty(true);
      try {
        const res = await fetchOrderQty(item.menuItemId);
        if (!done) setQty(res.totalOrderQuantity ?? 0);
      } catch (e) {
        if (!done) setQty(0);
      } finally {
        if (!done) setLoadingQty(false);
      }
    })();
    return () => { done = true; };
  }, [item.menuItemId]);

  const handleToggle = async () => {
    const next = !item.available;
    onToggleLocal(item.menuItemId, next);
    try {
      await setAvailable(item.menuItemId, next);
    } catch (e) {
      // 실패 시 되돌리기
      onToggleLocal(item.menuItemId, !next);
      alert(e.message);
    }
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
            {/* 예측 재고량 생략 */}
          </Meta>
        </div>
      </Left>

      <Right>
        <GhostButton onClick={handleToggle}>
          {item.available ? '판매 중지하기' : '판매 재개'}
        </GhostButton>

        <IconBtn onClick={() => onEdit(item)}>
          {/* 연필 아이콘 */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
        </IconBtn>

        <IconBtn onClick={() => onDelete(item)}>
          {/* 휴지통 아이콘 */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </IconBtn>
      </Right>
    </Card>
  );
}

// 인라인 수정용 행은 MenuEditorRow.jsx 사용
