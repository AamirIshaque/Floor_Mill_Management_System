import Permission from '../../models/auth/permission.model.js';

// Save permissions (bulk update)
export const savePermissions = async (req, res) => {
  try {
    const { permissions } = req.body; // { role: string, path: string, hasAccess: boolean }[]
    
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Permissions must be an array' });
    }
    
    // Use bulk operations for efficiency
    const bulkOps = permissions.map(perm => ({
      updateOne: {
        filter: { role: perm.role, path: perm.path },
        update: { $set: { hasAccess: perm.hasAccess } },
        upsert: true
      }
    }));
    
    await Permission.bulkWrite(bulkOps);
    res.json({ message: 'Permissions saved successfully' });
  } catch (err) {
    console.error('Save permissions error:', err);
    res.status(500).json({ message: 'Failed to save permissions', error: err.message });
  }
};

// Get all permissions
export const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch permissions', error: err.message });
  }
};

// Get permissions for a specific role
export const getPermissionsByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const permissions = await Permission.find({ role: role.toLowerCase() });
    
    // Convert to object map { path: hasAccess }
    const permMap = {};
    permissions.forEach(perm => {
      permMap[perm.path] = perm.hasAccess;
    });
    
    res.json(permMap);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch role permissions', error: err.message });
  }
};

// Initialize default permissions (run once)
export const initializePermissions = async (req, res) => {
  try {
    const { allPaths } = req.body; // Array of all paths from NAV_ITEMS
    
    if (!Array.isArray(allPaths) || allPaths.length === 0) {
      return res.status(400).json({ message: 'allPaths array is required' });
    }
    
    const roles = ['admin', 'manager', 'operator', 'user'];
    const bulkOps = [];
    
    // Create permissions for all paths and all roles
    roles.forEach(role => {
      allPaths.forEach(path => {
        let hasAccess = false;
        
        // Admin always has full access
        if (role === 'admin') {
          hasAccess = true;
        }
        // Manager has dashboard and reports by default
        else if (role === 'manager') {
          hasAccess = path === '/' || path.includes('report');
        }
        // Operator has dashboard and forms
        else if (role === 'operator') {
          hasAccess = path === '/' || path.includes('form') || path.includes('entry') || path.includes('voucher');
        }
        // User has only dashboard
        else if (role === 'user') {
          hasAccess = path === '/';
        }
        
        bulkOps.push({
          updateOne: {
            filter: { role, path },
            update: { $set: { hasAccess } },
            upsert: true
          }
        });
      });
    });
    
    await Permission.bulkWrite(bulkOps);
    
    res.json({ 
      message: 'Default permissions initialized',
      count: bulkOps.length 
    });
  } catch (err) {
    console.error('Initialize permissions error:', err);
    res.status(500).json({ message: 'Failed to initialize permissions', error: err.message });
  }
};
