import { Routes, Route } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Login from "./pages/Login";
import ReportDetail from "./pages/ReportDetail";
import Navbar from "./components/Navbar";
import logoz from "./assets/logoz.png";

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
    <div className=" bg-black/95 text-white min-h-screen relative">
      <div className="fixed bottom-4 right-4 z-10">
        <img
          src={logoz}
          alt="Logo zendev"
          className="w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,1)]"
        />
      </div>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />
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
