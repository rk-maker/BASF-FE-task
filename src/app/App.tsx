import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import LoginPage from "@/features/auth/LoginPage";
import StoreComparisonPage from "@/features/comparison/StoreComparisonPage";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import OverviewPage from "@/features/overview/OverviewPage";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const user = useSelector((s: RootState) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="comparison" element={<StoreComparisonPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
