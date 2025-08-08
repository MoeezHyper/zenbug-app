import express from "express";
import {
  createReport,
  deleteReport,
  getReport,
  updateReport,
} from "../controllers/reports.controller.js";
import { apiKeyAuth } from "../middlewares/apiKeyAuth.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import multer from "multer";
const upload = multer();

const router = express.Router();

router.post("/", apiKeyAuth, upload.single("screenshot"), createReport);
router.get("/", authenticate, getReport);
router.patch("/:id", authenticate, updateReport);
router.delete("/:id", authenticate, deleteReport);

export default router;
