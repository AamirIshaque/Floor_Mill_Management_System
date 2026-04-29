import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/auth/user.model.js";
import Permission from "../../models/auth/permission.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const TOKEN_TTL = "7d";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    const emailNorm = email.toLowerCase();
    const existing = await User.findOne({ email: emailNorm });
    if (existing) return res.status(400).json({ message: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    // register endpoint always creates lowest role 'user'
    const user = await User.create({ name, email: emailNorm, passwordHash, role: 'user' });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// Admin-only: update a user's role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!id || !role) return res.status(400).json({ message: 'id and role are required' });
    if (!['admin','manager','operator','user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('name email role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update role', error: err.message });
  }
};

// Admin-only: block/unblock a user
export const updateUserBlocked = async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;
    if (!id || typeof blocked !== 'boolean') return res.status(400).json({ message: 'id and blocked status are required' });
    const user = await User.findByIdAndUpdate(id, { blocked }, { new: true }).select('name email role blocked');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update blocked status', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailNorm = (email || '').toLowerCase();
    console.log('[AUTH] Login attempt', { email: emailNorm });
    const user = await User.findOne({ email: emailNorm });
    console.log('[AUTH] User found?', !!user);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    
    // Check if user is blocked
    if (user.blocked) {
      return res.status(403).json({ message: "Your account has been blocked by admin. Contact with them to restore access." });
    }
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log('[AUTH] Password match?', ok);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const me = async (req, res) => {
  try {
    // Add timeout to prevent hanging on database issues
    const userQuery = User.findById(req.userId).select("name email role");
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    );

    const user = await Promise.race([userQuery, timeoutPromise]);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch permissions for user's role (with timeout)
    const permissionsQuery = Permission.find({ role: user.role.toLowerCase() });
    const permissionsTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Permissions timeout')), 3000)
    );

    const permissions = await Promise.race([permissionsQuery, permissionsTimeout]).catch(() => []);
    const permMap = {};
    permissions.forEach(perm => {
      permMap[perm.path] = perm.hasAccess;
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: permMap
    });
  } catch (err) {
    console.error('Auth me error:', err.message);
    // Return unauthorized instead of server error to trigger login redirect
    res.status(401).json({ message: "Authentication required" });
  }
};

// Admin-only: create a user with specific role
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password and role are required" });
    }
    if (!['admin','manager','operator','user'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    // Prevent admins from creating other admin users
    if (role === 'admin') {
      // Get current user making the request
      const currentUser = await User.findById(req.userId);
      if (currentUser && currentUser.role === 'admin') {
        return res.status(403).json({ message: "Admins cannot create other admin users" });
      }
    }
    
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Failed to create user", error: err.message });
  }
};

// Admin-only: list users
export const listUsers = async (_req, res) => {
  try {
    const users = await User.find().select('name email role blocked createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to list users", error: err.message });
  }
};

// Admin-only: delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminPassword } = req.body;
    
    if (!id) return res.status(400).json({ message: 'User ID is required' });
    if (!adminPassword) return res.status(400).json({ message: 'Admin password is required' });
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent deleting yourself
    if (req.userId === id) return res.status(400).json({ message: 'Cannot delete your own account' });
    
    // Verify admin password
    const admin = await User.findById(req.userId);
    if (!admin) return res.status(404).json({ message: 'Admin user not found' });
    
    const passwordValid = await bcrypt.compare(adminPassword, admin.passwordHash);
    if (!passwordValid) return res.status(401).json({ message: 'Incorrect admin password' });
    
    // Delete the user
    await User.findByIdAndDelete(id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password", error: err.message });
  }
};
