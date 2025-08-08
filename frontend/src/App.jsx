import { Routes, Route } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ReportDetail from "./pages/ReportDetail";
import Navbar from "./components/Navbar";

const App = () => {
  const navigate = useNavigate();
  const hideNavbarRoutes = ["/"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "token" && !e.newValue) {
        navigate("/");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [navigate]);

  return (
    <div className=" bg-black/90 text-white min-h-screen">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:id"
          element={
            <ProtectedRoute>
              <ReportDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
