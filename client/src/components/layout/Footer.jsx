import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 ">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-semibold mb-3">FreelanceHub</h3>
          <p className="text-sm">
            The marketplace for freelance services.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">Categories</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/?category=web-development" className="hover:text-white transition">Web Development</Link></li>
            <li><Link to="/?category=design" className="hover:text-white transition">Design</Link></li>
            <li><Link to="/?category=writing" className="hover:text-white transition">Writing</Link></li>
            <li><Link to="/?category=marketing" className="hover:text-white transition">Marketing</Link></li>
          </ul>
        </div>
        <div> 
          <h3 className="text-white font-semibold mb-3">For Freelancers</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/register" className="hover:text-white transition">Become a Seller</Link></li>
            <li><Link to="/my-gigs" className="hover:text-white transition">My Gigs</Link></li>
            <li><Link to="/orders" className="hover:text-white transition">Orders</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition">Help Center</Link></li>
            <li><Link to="/" className="hover:text-white transition">Terms of Service</Link></li>
            <li><Link to="/" className="hover:text-white transition">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-sm text-center">
        © 2025 FreelanceHub. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;