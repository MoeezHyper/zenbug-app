import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loggingIn, setLoggingIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTimeout(() => {
          localStorage.setItem("token", data.token);
          navigate("/dashboard");
        }, 1200);
      } else {
        alert(data.message || "Login failed");
        setLoggingIn(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error");
      setLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center text-white px-4">
      <div className="items-center justify-center flex -mt-50 mb-10">
        <img
          src={logo}
          alt="logo"
          className="py-10 w-[100px] h-[190px] max-md:w-[80px] max-md:h-[170px] hover:cursor-pointer opacity-80 mr-5 rounded-full drop-shadow-[0_0_20px_white]"
        />
        <div className="flex flex-col text-center">
          <p className="text-[42px] max-md:text-[36px] font-audiowide">
            ZENBUG
          </p>
          <p className="ml-2 text-[14px] max-md:text-[11px] font-montserrat tracking-[9px] max-md:tracking-[8px]">
            ADMIN PANEL
          </p>
        </div>
      </div>
      <div className="w-full max-w-sm max-md:max-w-[350px] p-8 bg-neutral-900 rounded-2xl shadow-2xl backdrop-blur-md border border-neutral-800">
        {message ? (
          <p className="text-center mb-4 text-red-500 font-semibold text-lg font-montserrat">
            ⚠️ {message}
          </p>
        ) : (
          <h2 className="text-center text-2xl font-semibold text-white font-montserrat mb-6">
            Welcome back
          </h2>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-zinc-800 text-white rounded-md outline-none focus:ring-2 focus:ring-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 mb-2 bg-zinc-800 text-white rounded-md outline-none focus:ring-2 focus:ring-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className={`w-full py-2 rounded-md font-semibold transition-all cursor-pointer ${
              loggingIn
                ? "bg-gray-500 text-white cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            {loggingIn ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
