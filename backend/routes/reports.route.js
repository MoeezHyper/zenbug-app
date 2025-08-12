import express from "express";
import {
  createReport,
  deleteReport,
  getReport,
  updateReport,
  getProjectNames,
} from "../controllers/reports.controller.js";
import { apiKeyAuth } from "../middlewares/apiKeyAuth.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import multer from "multer";
const upload = multer();

const router = express.Router();

// Accept either a screenshot (image) or a video (one at a time)
router.post(
  "/",
  apiKeyAuth,
  upload.fields([
    { name: "screenshot", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  createReport
);
router.get("/", authenticate, getReport);
router.get("/projects", authenticate, getProjectNames);
router.patch("/:id", authenticate, updateReport);
router.delete("/:id", authenticate, deleteReport);

export default router;
