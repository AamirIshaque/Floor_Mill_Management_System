import express from "express";
import { createOpeningStock, listOpeningStock } from "../../controllers/general/openingstock.controller.js";

const router = express.Router();
router.post("/", createOpeningStock);
router.get("/", listOpeningStock);
export default router;
