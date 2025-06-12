import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/', 
  requireAuth = false 
}) => {
  const { isLoggedIn } = useAuth();

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