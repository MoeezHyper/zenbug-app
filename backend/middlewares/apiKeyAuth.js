export const apiKeyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const serverKey = process.env.API_KEY;

  if (!authHeader || !authHeader.startsWith("ApiKey ")) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Missing or invalid Authorization header",
      });
  }

  const clientKey = authHeader.split(" ")[1];

  if (clientKey !== serverKey) {
    return res.status(403).json({ success: false, message: "Invalid API key" });
  }

  next();
};
