export const adminOnly = (req, res, next) => {
  // Check if user is authenticated and is admin
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No user found" });
  }

  if (req.user.username !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: Admin access required" });
  }

  next();
};
