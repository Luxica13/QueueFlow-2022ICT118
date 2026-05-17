import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminQueuesPage from "./pages/admin/AdminQueuesPage";
import AdminDeskPage from "./pages/admin/AdminDeskPage";
import UserHomePage from "./pages/user/UserHomePage";
import JoinQueuePage from "./pages/user/JoinQueuePage";
import MyTokenPage from "./pages/user/MyTokenPage";
import { useAuth } from "./context/AuthContext";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <p className="empty-state">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Navigate to={user.role === "admin" ? "/admin" : "/app"} replace />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="queues" element={<AdminQueuesPage />} />
          <Route path="desk" element={<AdminDeskPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="user" />}>
        <Route path="/app" element={<UserLayout />}>
          <Route index element={<UserHomePage />} />
          <Route path="join" element={<JoinQueuePage />} />
          <Route path="my-token" element={<MyTokenPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
