import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { pathname } = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const isAdminArea = pathname.startsWith("/admin");

  return (
    <header className="bg-asphalt-950 text-concrete-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-wide">
          <span className="text-hazard-400">Pothole</span>Track
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className={pathname === "/" ? "text-hazard-400" : "hover:text-hazard-400"}>
            Map
          </Link>
          <Link to="/report" className={pathname === "/report" ? "text-hazard-400" : "hover:text-hazard-400"}>
            Report a Pothole
          </Link>
          <Link to="/stats" className={pathname === "/stats" ? "text-hazard-400" : "hover:text-hazard-400"}>
            Stats
          </Link>
          {isAdminArea && isAuthenticated ? (
            <button onClick={logout} className="hover:text-hazard-400">
              Log out
            </button>
          ) : (
            <Link to="/admin/login" className="hover:text-hazard-400">
              Admin
            </Link>
          )}
        </nav>
      </div>
      <div className="lane-divider" />
    </header>
  );
}
