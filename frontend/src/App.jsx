import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function PublicOnlyRoute({ children }) {
  const { user } = useContext(AuthContext);
  // If already logged in, redirect to dashboard
  return user ? <Navigate to="/" /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard is open to everyone (guest + logged in) */}
        <Route path="/" element={<Dashboard />} />

        {/* Public-only Routes (redirect if already logged in) */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
