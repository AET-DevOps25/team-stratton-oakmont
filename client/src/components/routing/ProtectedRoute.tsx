import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/",
  requireAuth = false,
}) => {
  const { isLoggedIn, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  // If route requires authentication and user is not logged in
  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If route is for non-authenticated users (login/signup) and user is logged in
  if (!requireAuth && isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
