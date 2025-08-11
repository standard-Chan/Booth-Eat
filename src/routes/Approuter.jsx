// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import BoothLayout from "../components/BoothLayout.jsx";
import MenuPage from "../pages/customer/MenuPage.jsx";
import CartPage from "../pages/customer/CartPage.jsx";
import OrderConfirmPage from "../pages/customer/OrderConfirmPage.jsx";
import OrderPendingPage from "../pages/customer/OrderPendingPage.jsx";
import OrderCompletePage from "../pages/customer/OrderCompletePage.jsx";
import OrderHistoryPage from "../pages/customer/OrderHistoryPage.jsx";
import NotFound from "../components/NotFound.jsx";

// manager pages
import ManagerOrdersPage from "../pages/manager/OrdersPage.jsx";
import ManagerReportsPage from "../pages/manager/ReportsPage.jsx";
import ManagerSettingsPage from "../pages/manager/SettingsPage.jsx";
import MenuManagePage from "../pages/manager/MenuManagePage.jsx";
import SalesManagePage from "../pages/manager/SalesManagePage.jsx";

export default function AppRouter() {
  return (
    <Routes>
      {/* 기본: 고객용 메뉴로 */}
      <Route path="/" element={<Navigate to="/booths/1/tables/1/menu" replace />} />

      {/* customer 영역 */}
      <Route path="/booths/:boothId/tables/:tableId" element={<BoothLayout />}>
        <Route path="menu" element={<MenuPage />} />
        <Route path="order" element={<CartPage />} />
        <Route path="order/confirm" element={<OrderConfirmPage />} />
        <Route path="order/pending/:orderId" element={<OrderPendingPage />} />
        <Route path="order/complete/:orderId" element={<OrderCompletePage />} />
        <Route path="orderHistory" element={<OrderHistoryPage />} />
      </Route>

      {/* manager 영역 */}
      <Route path="/manager" element={<Navigate to="/manager/booths/1/orders" replace />} />
      <Route path="/manager/booths/:boothId/orders" element={<ManagerOrdersPage />} />
      <Route path="/manager/booths/:boothId/menus" element={<MenuManagePage />} />
      <Route path="/manager/booths/:boothId/sales" element={<SalesManagePage />} />
      <Route path="/manager/booths/:boothId/reports" element={<ManagerReportsPage />} />
      <Route path="/manager/booths/:boothId/settings" element={<ManagerSettingsPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
