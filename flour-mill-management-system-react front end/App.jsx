import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/auth/Login';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';
import { DataProvider } from './context/DataProvider';
import { AuthProvider } from './context/AuthProvider';
import { routes } from './routes.config'; // Import centralized route config

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/auth/login';

  console.log('App: Rendering', {
    pathname: location.pathname,
    isLogin
  });

  // Force navigation to login after 3 seconds if still on root
  useEffect(() => {
    const timer = setTimeout(() => {
      if (location.pathname === '/' || location.pathname === '') {
        console.log('App: Forcing navigation to login');
        navigate('/auth/login', { replace: true });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [location.pathname, navigate]);

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      <AuthProvider>
        {!isLogin && <Sidebar />}
        <div className={`flex-1 flex flex-col overflow-hidden`}>
          {!isLogin && <Header />}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6">
            <DataProvider>
              <Routes>
                {/* Login Route */}
                <Route path="/auth/login" element={<Login />} />

                {/* Dynamic Routes from Config */}
                {routes.map((route) => {
                  // Determine the wrapper component based on roles
                  let element = route.element;

                  if (route.roles) {
                    // If roles are specified, wrap in RequireRole
                    element = (
                      <RequireRole roles={route.roles}>
                        {route.element}
                      </RequireRole>
                    );
                  } else {
                    // Otherwise, just require authentication
                    element = (
                      <RequireAuth>
                        {route.element}
                      </RequireAuth>
                    );
                  }

                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={element}
                    />
                  );
                })}

                {/* Default Redirects */}
                <Route path="/" element={<Navigate to="/auth/login" />} />
                <Route path="*" element={<Navigate to="/auth/login" />} />
              </Routes>
            </DataProvider>
          </main>
        </div>
      </AuthProvider>
    </div>
  );
};

export default App;