import express from "express";
import { createAccount, listAccounts, getAccount, updateAccount, deleteAccount } from "../../controllers/accounts/accounts.controller.js";

const router = express.Router();

router.post("/", createAccount);
router.get("/", listAccounts);
router.get("/:id", getAccount);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

export default router;
