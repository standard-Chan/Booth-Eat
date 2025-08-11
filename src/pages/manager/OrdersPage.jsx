import React from 'react';
import AppLayout from '../../components/common/manager/AppLayout.jsx';

export default function ManagerOrdersPage() {
  return (
    <AppLayout title="주문 관리">
      {/* TODO: 카드 그리드 자리 */}
      <div
        style={{
          height: 520,
          border: '1px dashed #ddd',
          borderRadius: 12,
          display: 'grid',
          placeItems: 'center',
          color: '#999',
        }}
      >
        주문 카드 영역 (임시)
      </div>
    </AppLayout>
  );
}
