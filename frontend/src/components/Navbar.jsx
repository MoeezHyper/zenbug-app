import logo from "../assets/logo2.png";
import { RxDashboard } from "react-icons/rx";
import { GrLogout } from "react-icons/gr";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      navigate("/");
    }, 1200);
  };

  return (
    <section>
      {/* Mobile menu toggle button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white bg-zinc-800 p-2 rounded-md shadow-md"
        >
          <HiOutlineMenuAlt3 size={24} />
        </button>
      </div>

      {/* BACKGROUND OVERLAY (mobile only, when menu open) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-screen w-[100px] max-md:w-[70px] z-40 transition-transform duration-300
      ${menuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:block
      bg-zinc-800/80 backdrop-blur-md`}
      >
        <div className="flex flex-col px-2 py-5 justify-between items-center min-h-screen">
          {/* Logo */}
          <div className="flex flex-col justify-center items-center hover:cursor-pointer transition-all duration-300 ease-in-out hover:drop-shadow-[0_0_15px_white]">
            <img
              src={logo}
              alt="logo"
              className="w-[30px] h-[35px] max-md:w-[20px] max-md:h-[25px] max-md:mt-17"
            />
            <div className="text-center">
              <p className="text-[13px] max-md:text-[9px] mt-1 font-audiowide text-gray-100">
                ZENBUG
              </p>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-col items-center justify-between text-center gap-10 text-white">
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/dashboard");
              }}
              className="group hover:cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <RxDashboard className="size-[30%] transition-all duration-300 group-hover:filter group-hover:drop-shadow-[0_0_6px_white]" />
                <p className="font-varela text-[11px] mt-2 uppercase max-md:text-[9px]">
                  Dashboard
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="hover:cursor-pointer group"
              disabled={loggingOut}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <GrLogout
                  className={`transition-[filter] duration-300 ml-1 group-hover:filter group-hover:drop-shadow-[0_0_6px_white] ${
                    loggingOut ? "size-[27%]" : "size-[40%]"
                  }`}
                />
                <p
                  className={`font-varela mt-2 uppercase ${
                    loggingOut
                      ? "text-[9px] max-md:text-[8px]"
                      : "text-[11px] max-md:text-[9px]"
                  }`}
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Navbar;
