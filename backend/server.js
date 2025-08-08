import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import reportRoutes from "./routes/reports.route.js";
import loginRoutes from "./routes/login.route.js";

dotenv.config();

const app = express();
connectDB();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (origin, callback) => callback(null, origin || "*"),
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  })
);

app.use(express.json());

app.use("/api/feedback", reportRoutes);
app.use("/api/auth", loginRoutes);

if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Server started at http://localhost:${PORT}`);
});

export default app;
