// src/pages/manager/MenusPage.jsx
import React, { useEffect, useState } from "react";
import AppLayout from "../../components/common/manager/AppLayout.jsx";

export default function ManagerMenusPage() {
  return (
    <AppLayout title="비즈니스 리포트">
      <div
        style={{
          height: 520,
          border: "1px dashed #ddd",
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          color: "#999",
        }}
      >
        비즈니스 리포트 화면 (임시)
      </div>
    </AppLayout>
  );
}
