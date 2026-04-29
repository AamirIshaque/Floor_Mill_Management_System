import express from "express";
import { login, register, me, createUser, listUsers, changePassword, updateUserRole, updateUserBlocked, deleteUser } from "../../controllers/auth/auth.controller.js";
import { savePermissions, getPermissions, getPermissionsByRole, initializePermissions } from "../../controllers/auth/permission.controller.js";
import { requireAuth, requireRole, requireRoles } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/status", (_req, res) => res.json({ authenticated: false, message: "Not authenticated" }));
router.get("/me", requireAuth, me);
router.post("/change-password", requireAuth, changePassword);

// Admin and Manager user management
router.post("/create-user", requireAuth, requireRoles(['admin', 'manager']), createUser);
router.get("/users", requireAuth, requireRoles(['admin', 'manager']), listUsers);
router.put("/users/:id/role", requireAuth, requireRoles(['admin', 'manager']), updateUserRole);
router.put("/users/:id/blocked", requireAuth, requireRoles(['admin', 'manager']), updateUserBlocked);
router.delete("/users/:id", requireAuth, requireRole('admin'), deleteUser);

// Admin and Manager permission management
router.post("/permissions", requireAuth, requireRoles(['admin', 'manager']), savePermissions);
router.get("/permissions", requireAuth, requireRoles(['admin', 'manager']), getPermissions);
router.get("/permissions/:role", requireAuth, requireRoles(['admin', 'manager']), getPermissionsByRole);
router.post("/permissions/initialize", requireAuth, requireRoles(['admin', 'manager']), initializePermissions);

export default router;
