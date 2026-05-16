import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-2xl font-bold text-emerald-500">
          FreelanceHub
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-emerald-500 transition">
            Browse
          </Link>
          {isAuthenticated && user?.role === "freelancer" && (
            <>
              <Link to="/my-gigs" className="text-gray-600 hover:text-emerald-500 transition">
                My Gigs
              </Link>
              <Link to="/gigs/create" className="text-gray-600 hover:text-emerald-500 transition">
                Create Gig
              </Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link to="/orders" className="text-gray-600 hover:text-emerald-500 transition">
                Orders
              </Link>
              <Link to="/messages" className="text-gray-600 hover:text-emerald-500 transition">
                Messages
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium text-sm">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-red-500 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-emerald-500 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;