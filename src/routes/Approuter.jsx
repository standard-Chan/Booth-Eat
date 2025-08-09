import { Routes, Route, Navigate } from 'react-router-dom';
import BoothLayout from '../ui/BoothLayout.jsx';
import MenuPage from '../pages/MenuPage.jsx';
import CartPage from '../pages/CartPage.jsx';
import OrderConfirmPage from '../pages/OrderConfirmPage.jsx';
import OrderPendingPage from '../pages/OrderPendingPage.jsx';
import OrderCompletePage from '../pages/OrderCompletePage.jsx';
import NotFound from '../ui/NotFound.jsx';

export default function AppRouter() {
  return (
    <Routes>
      {/* 루트 접근 시(예: /) 데모용으로 부스 1로 리다이렉트. 실제로는 부스 선택 페이지 연결 권장 */}
      <Route path="/" element={<Navigate to="/booths/1/menu" replace />} />

      {/* boothId가 포함된 레이아웃 라우트 */}
      <Route path="/booths/:boothId" element={<BoothLayout />}>
        <Route path="menu" element={<MenuPage />} />
        <Route path="order" element={<CartPage />} />
        <Route path="order/confirm" element={<OrderConfirmPage />} />
        <Route path="order/pending/:orderId" element={<OrderPendingPage />} />
        <Route path="order/complete/:orderId" element={<OrderCompletePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
