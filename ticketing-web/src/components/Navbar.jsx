import { Link, useNavigate } from "react-router-dom";
import { Ticket, LogOut, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-amber-400"
        >
          <Ticket className="w-6 h-6" />
          <span>FlashTix</span>
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium">
          <Link to="/" className="hover:text-amber-400 transition">
            Katalog Event
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/my-orders" className="hover:text-amber-400 transition">
                Tiket Saya
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}

              <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <User className="w-4 h-4 text-amber-400" />
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="hover:text-amber-400 transition">
                Masuk
              </Link>
              <Link
                to="/register"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-1.5 rounded-lg transition"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
