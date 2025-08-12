import express from "express";
import {
  Register,
  Loginuser,
  getAllUsers,
  updateUser,
} from "../controllers/login.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/adminAuth.js";

const router = express.Router();

router.post("/register", Register);
router.post("/login", Loginuser);
router.get("/verify", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
    message: "Token is valid",
  });
});
router.get("/users", authenticate, adminOnly, getAllUsers);
router.patch("/users/:id", authenticate, adminOnly, updateUser);

export default router;
