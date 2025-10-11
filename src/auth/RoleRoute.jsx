import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleRoute({ allow, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}
