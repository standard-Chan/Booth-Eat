import { Routes, Route, Navigate } from "react-router-dom";
import BoothLayout from "../components/BoothLayout.jsx";
import MenuPage from "../pages/customer/MenuPage.jsx";
import CartPage from "../pages/customer/CartPage.jsx";
import OrderConfirmPage from "../pages/customer/OrderConfirmPage.jsx";
import OrderPendingPage from "../pages/customer/OrderPendingPage.jsx";
import OrderCompletePage from "../pages/customer/OrderCompletePage.jsx";
import OrderHistoryPage from "../pages/customer/OrderHistoryPage.jsx";
import NotFound from "../components/NotFound.jsx";


export default function AppRouter() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/booths/1/menu" replace />} />

        {/* boothId가 포함된 레이아웃 라우트 */}

        <Route path="/booths/:boothId" element={<BoothLayout />}>
          <Route path="menu" element={<MenuPage />} />
          <Route path="order" element={<CartPage />} />
          <Route path="order/confirm" element={<OrderConfirmPage />} />
          <Route path="order/pending/:orderId" element={<OrderPendingPage />} />
          <Route path="order/complete/:orderId" element={<OrderCompletePage />} />
          <Route path="orderHistory" element={<OrderHistoryPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
