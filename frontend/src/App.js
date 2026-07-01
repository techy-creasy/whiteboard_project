import { Routes, Route, Navigate } from "react-router-dom";
import CanvasPage from "./components/CanvasPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated } from "./utils/auth";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Profile: where users create/open/delete their canvases */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* A specific saved canvas */}
      <Route
        path="/:canvasId"
        element={
          <ProtectedRoute>
            <CanvasPage />
          </ProtectedRoute>
        }
      />

      {/* Root just sends people to the right place */}
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated() ? "/profile" : "/login"} replace />
        }
      />
    </Routes>
  );
}

export default App;
