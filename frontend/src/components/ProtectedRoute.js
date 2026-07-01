import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

// Wrap any route element with this. No token -> straight to /login,
// and we remember nothing about where they were headed (simplest case).
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
