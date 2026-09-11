import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { initialized, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando sessão...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
