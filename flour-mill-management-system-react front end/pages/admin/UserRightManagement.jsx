import React, { useState, useMemo, useEffect } from 'react';
import PageShell from '../../components/PageShell';
import { NAV_ITEMS } from '../../constants';
import apiFetch from '../../utils/apiFetch';
import { useAuth } from '../../context/AuthProvider';

const roleMap = {
  Administrator: 'admin',
  Manager: 'manager',
  'Data Entry': 'operator',
  User: 'user'
};

const displayRoleMap = {
  admin: 'Administrator',
  manager: 'Manager', 
  operator: 'Data Entry',
  user: 'User'
};

const shortRoleMap = {
  admin: 'Admin',
  manager: 'Manager',
  operator: 'Data Entry', 
  user: 'User'
};

const UserRightManagement = () => {
  const { user: currentUser } = useAuth();
  const isManager = currentUser?.role === 'manager';
  const isAdmin = currentUser?.role === 'admin';
  const displayRoles = isManager ? ['Manager', 'Data Entry'] : Object.keys(roleMap).filter(role => role !== 'User');
  
  // Helper function to check if current user can block a target user
  const canBlockUser = (targetUser) => {
    if (!currentUser) return false;
    
    // Cannot block yourself
    if (currentUser._id === targetUser._id) return false;
    
    const currentRole = currentUser.role;
    const targetRole = targetUser.role;
    
    if (currentRole === 'admin') {
      // Admin can block anyone except themselves
      return true;
    } else if (currentRole === 'manager') {
      // Manager can block users and operators, but not admins
      return targetRole === 'user' || targetRole === 'operator';
    }
    
    // Other roles cannot block anyone
    return false;
  };
  
  // Helper function to check if current user can delete a target user
  const canDeleteUser = (targetUser) => {
    if (!currentUser) return false;
    
    // Cannot delete yourself
    if (currentUser._id === targetUser._id) return false;
    
    // Only admins can delete users
    return currentUser.role === 'admin';
  };
  const initialPermissions = useMemo(() => {
    const permissions = {};
    NAV_ITEMS.flatMap((section) => section.items).forEach((item) => {
      permissions[item.path] = {
        Administrator: true,
        Manager: item.path.includes('report') || item.path === '/dashboard' || item.path.startsWith('/admin'),
        'Data Entry':
          item.path.includes('form') ||
          item.path.includes('entry') ||
          item.path.includes('voucher'),
        User: item.path === '/dashboard'
      };
      
      // Filter out roles that current user cannot manage
      if (isManager) {
        delete permissions[item.path].Administrator;
      }
    });
    return permissions;
  }, [isManager]);

  const [permissions, setPermissions] = useState(initialPermissions);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiFetch(`${API}/auth/users`);
      const data = await res.json();
      if (res.ok) setUsers(data);
      else setError(data.message || 'Failed to load users');
    } catch (e) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const res = await apiFetch(`${API}/auth/permissions`);
      const data = await res.json();
      if (res.ok) {
        // Check if any permissions exist
        if (data.length === 0) {
          setError('⚠️ No permissions found in database. Click "Initialize Defaults" to set up permissions.');
        }
        
        // Convert array to permission matrix
        const matrix = { ...initialPermissions };
        data.forEach(perm => {
          const displayRole = Object.keys(roleMap).find(key => roleMap[key] === perm.role);
          if (displayRole && matrix[perm.path]) {
            matrix[perm.path][displayRole] = perm.hasAccess;
          }
        });
        setPermissions(matrix);
      }
    } catch (e) {
      console.error('Failed to load permissions:', e);
    }
  };

  useEffect(() => { 
    loadUsers();
    if (isAdmin) {
      loadPermissions();
    }
  }, []);

  const handlePermissionChange = (path, role, isChecked) => {
    setPermissions((prev) => ({
      ...prev,
      [path]: {
        ...prev[path],
        [role]: isChecked,
      },
    }));
  };

  const handleSaveChanges = async () => {
    if (!isAdmin) return; // Only admins can save permissions
    
    try {
      setSaving(true);
      setError('');
      
      // Convert permissions matrix to array format
      const permArray = [];
      Object.entries(permissions).forEach(([path, roles]) => {
        Object.entries(roles).forEach(([displayRole, hasAccess]) => {
          // Only save permissions for roles that this user can manage
          if (isManager && !['Manager', 'Data Entry'].includes(displayRole)) return;
          
          const role = roleMap[displayRole];
          if (role) {
            permArray.push({ role, path, hasAccess });
          }
        });
      });
      
      const res = await apiFetch(`${API}/auth/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: permArray })
      });
      
      if (res.ok) {
        alert('✅ Permissions saved successfully! Users need to re-login to see changes.');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to save permissions');
      }
    } catch (e) {
      setError('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPermissions(initialPermissions);
    alert('Permissions have been reset to their default state.');
  };

  const handleInitialize = async () => {
    if (!confirm('Initialize default permissions in database? This will set up basic access for all roles for ALL menu items.')) return;
    
    try {
      setSaving(true);
      
      // Get all paths from NAV_ITEMS
      const allPaths = NAV_ITEMS.flatMap(section => section.items.map(item => item.path));
      
      const res = await apiFetch(`${API}/auth/permissions/initialize`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allPaths })
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(`✅ Default permissions initialized successfully! ${data.count} permissions created.`);
        await loadPermissions();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to initialize permissions');
      }
    } catch (e) {
      setError('Failed to initialize permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="User Right Management">
      <div className="bg-slate-50 p-4 sm:p-6 rounded-lg border border-slate-200">
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <p className="text-sm text-green-800">
            <strong>✅ Administrator Access:</strong> Only administrators can view and modify user permissions. 
            Managers can only view user accounts and manage blocking status.
            {isAdmin && (
              <> Check/uncheck permissions below, click "Save Changes", then users must re-login to see the changes.
              Unchecked menus will be hidden from the sidebar for that role.</>
            )}
          </p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isAdmin && (
          <>
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleInitialize}
                disabled={saving}
                className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 text-sm disabled:opacity-50"
              >
                Initialize Defaults
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-400 text-white rounded-md hover:bg-slate-500 text-sm"
              >
                Reset Form
              </button>
            </div>

            {/* ✅ Responsive Table */}
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow-sm ring-1 ring-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="sticky left-0 bg-slate-100 px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Feature
                        </th>
                        {displayRoles.map((role) => (
                          <th
                            key={role}
                            className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider"
                          >
                            {role}
                          </th>
                        ))}
                        <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                          <button
                            onClick={handleSaveChanges}
                            disabled={saving}
                            className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {NAV_ITEMS.map((section) => (
                        <React.Fragment key={section.title}>
                          <tr>
                            <td
                              colSpan={displayRoles.length + 2}
                              className="px-3 sm:px-4 py-2 bg-slate-200 text-sm font-semibold text-slate-700"
                            >
                              {section.title}
                            </td>
                          </tr>
                          {section.items.map((item) => (
                            <tr key={item.path} className="hover:bg-slate-50">
                              <td className="sticky left-0 bg-white hover:bg-slate-50 px-3 sm:px-6 py-3 whitespace-nowrap font-medium text-slate-800">
                                {item.name}
                              </td>
                              {displayRoles.map((role) => (
                                <td
                                  key={`${item.path}-${role}`}
                                  className="px-3 sm:px-6 py-3 text-center"
                                >
                                  <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary disabled:opacity-50"
                                    checked={permissions[item.path]?.[role] || false}
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        item.path,
                                        role,
                                        e.target.checked
                                      )
                                    }
                                    disabled={role === 'Administrator' || (role === 'Manager' && item.path === '/dashboard') || (role === 'User' && item.path !== '/dashboard')}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t mt-6">
              <button
                onClick={handleReset}
                type="button"
                className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSaveChanges}
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Save Changes
              </button>
            </div>
          </>
        )}

        {/* Users and Roles */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold text-slate-800">All Users</h3>
            <button
              onClick={() => loadUsers()}
              disabled={loading}
              className="px-3 py-1 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Created</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map(u => (
                  <tr key={u._id}>
                    <td className="px-3 py-2">{u.name}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">{shortRoleMap[u.role] || u.role}</td>
                    <td className="px-3 py-2 text-center">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        u.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {u.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {canBlockUser(u) && (
                        <button
                          onClick={async () => {
                            const newBlocked = !u.blocked;
                            try {
                              const res = await apiFetch(`${API}/auth/users/${u._id}/blocked`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ blocked: newBlocked })
                              });
                              if (res.ok) {
                                await loadUsers();
                                alert(`User ${newBlocked ? 'blocked' : 'unblocked'} successfully`);
                              } else {
                                const d = await res.json();
                                alert(d.message || 'Failed to update blocked status');
                              }
                            } catch {
                              alert('Server error while updating blocked status');
                            }
                          }}
                          className={`px-3 py-1 rounded text-sm font-medium mr-2 ${
                            u.blocked 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {u.blocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                      {canDeleteUser(u) && (
                        <button
                          onClick={async () => {
                            const password = prompt('Enter your admin password to confirm deletion:');
                            if (!password) {
                              alert('Password is required. Deletion cancelled.');
                              return;
                            }
                            
                            if (!confirm(`Are you sure you want to permanently delete user "${u.name}"? This action cannot be undone.`)) {
                              return;
                            }
                            
                            try {
                              const res = await apiFetch(`${API}/auth/users/${u._id}`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ adminPassword: password })
                              });
                              
                              if (res.status === 401) {
                                alert('Incorrect admin password. Deletion cancelled.');
                                return;
                              }
                              
                              if (res.ok) {
                                await loadUsers();
                                alert(`User "${u.name}" has been deleted successfully`);
                              } else {
                                const d = await res.json();
                                alert(d.message || 'Failed to delete user');
                              }
                            } catch {
                              alert('Server error while deleting user');
                            }
                          }}
                          className="px-3 py-1 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td className="px-3 py-4 text-slate-500" colSpan="6">{loading ? 'Loading users...' : 'No users'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PageShell>
  );
};

export default UserRightManagement;
