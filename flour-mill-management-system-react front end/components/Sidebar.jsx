import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../constants";
import { useAuth } from "../context/AuthProvider";

const Sidebar = () => {
  const [openSections, setOpenSections] = useState(new Set(["Main"]));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  const toggleSection = (title) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      newSet.has(title) ? newSet.delete(title) : newSet.add(title);
      return newSet;
    });
  };

  /**
   * Determines if a navigation item should be visible to the current user.
   * Checks against user role and explicit permissions.
   */
  const shouldShowItem = (item, user) => {
    if (!user) return false;

    const role = String(user.role || '').toLowerCase();
    const permissions = user.permissions || {};

    // 1. Admin always has full access
    if (role === 'admin') return true;

    // 2. Admin section is restricted to admin/manager
    if (item.path.startsWith('/admin')) {
      return role === 'admin' || role === 'manager';
    }

    // 3. Check explicit permissions (if initialized)
    const hasAnyPermissions = Object.keys(permissions).length > 0;
    if (hasAnyPermissions) {
      // Strict mode: User must have explicit true permission for the path
      return permissions.hasOwnProperty(item.path) && permissions[item.path] === true;
    }

    // 4. Fallback: Role-based defaults (if no permissions set)
    // This ensures backward compatibility or default behavior for new users
    switch (role) {
      case 'manager':
        // Manager: Dashboard + Reports + Admin features
        return item.path === '/dashboard' || item.path.includes('report') || item.path.startsWith('/admin');
      case 'operator':
        // Operator: Dashboard + Forms/Entry + Vouchers
        return item.path === '/dashboard' || item.path.includes('form') || item.path.includes('entry') || item.path.includes('voucher');
      case 'user':
        // User: Only dashboard and user-specific pages
        return item.path === '/dashboard' || item.path.includes('user');
      default:
        return false;
    }
  };

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
  }, [isSidebarOpen]);

  if (loading) return null;

  return (
    <>
      {/* Hamburger Button (mobile only) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded-md shadow-md focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 text-slate-200 shadow-lg transform transition-transform duration-300 z-40
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static flex flex-col`}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between h-20 border-b border-slate-700 px-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-white tracking-wider">Flour Mill</h1>

          {/* Close button (mobile only) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable menu area */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          <ul className="py-4">
            {NAV_ITEMS.map((section) => {
              // Filter items based on user permissions
              const visibleItems = (section.items || []).filter((item) => shouldShowItem(item, user));

              if (visibleItems.length === 0) return null;

              return (
                <li key={section.title} className="px-4 py-2">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex justify-between items-center text-left text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    {section.title.toUpperCase()}
                    <svg
                      className={`w-4 h-4 transition-transform ${openSections.has(section.title) ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openSections.has(section.title) && (
                    <ul className="mt-2 pl-2 border-l border-slate-700">
                      {visibleItems.map((item) => (
                        <li key={item.path}>
                          <NavLink
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-2 px-3 my-1 rounded-md text-sm transition-all duration-200 ${isActive
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-slate-300 hover:bg-slate-700 hover:text-white"
                              }`
                            }
                          >
                            {item.icon}
                            <span className="truncate">{item.name}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Overlay (mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
