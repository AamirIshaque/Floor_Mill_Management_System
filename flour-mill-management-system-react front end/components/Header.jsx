import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import { useAuth } from '../context/AuthProvider';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    if (currentPath === '/') return 'Dashboard';
    for (const section of NAV_ITEMS) {
      for (const item of section.items) {
        if (item.path === currentPath) {
          return item.name;
        }
      }
    }
    return 'Flour Mill';
  };
  return (
    <header className="h-20 bg-white shadow-md flex items-center justify-between px-6 z-10">
      {/* Left Section */}
      <div className="flex items-center">
        {/* Hamburger Button - only visible on mobile */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="md:hidden mr-4 text-slate-700 focus:outline-none"
          >
            {/* Simple hamburger icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Page Title */}
        <h2 className="text-0.75xl font-semibold text-slate-700 ml-2 md:ml-0">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right Section (User Info) */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="font-semibold text-sm text-slate-800">{user?.name || user?.email || 'User'}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role || ''}</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/auth/login'); }}
          className="text-xs text-red-500 border border-red-500 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
