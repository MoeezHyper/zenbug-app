import express from "express";
import { Register, Loginuser } from "../controllers/login.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

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

export default router;
