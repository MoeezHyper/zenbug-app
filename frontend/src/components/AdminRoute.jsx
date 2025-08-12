import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(false);
  const [checked, setChecked] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/", {
        state: { message: "Please login again" },
        replace: true,
      });
      return;
    }

    const verifyToken = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const res = await fetch(`${apiUrl}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok && data.success) {
          // Check if user is admin
          if (data.user?.username === "admin") {
            setIsValid(true);
          } else {
            navigate("/dashboard", {
              state: { message: "Access denied: Admin only" },
              replace: true,
            });
          }
        } else {
          localStorage.removeItem("token");
          navigate("/", {
            state: { message: "Please login again" },
            replace: true,
          });
        }
      } catch {
        localStorage.removeItem("token");
        navigate("/", {
          state: { message: "Please login again" },
          replace: true,
        });
      } finally {
        setChecked(true);
      }
    };

    verifyToken();
  }, [token, navigate]);

  if (!checked) return null;

  return isValid ? children : null;
};

export default AdminRoute;
