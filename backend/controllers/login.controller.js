import Login from "../models/login.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const Register = async (req, res) => {
  const { username, password, email, project, projects } = req.body;

  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ success: false, message: "All fields required" });
  }

  try {
    const existingUser = await Login.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle both old and new API formats
    let userProjects;
    if (projects && Array.isArray(projects) && projects.length > 0) {
      userProjects = projects;
    } else if (project) {
      userProjects = [project];
    } else {
      userProjects = ["all"];
    }

    const user = new Login({
      username,
      email,
      password: hashedPassword,
      projects: userProjects,
    });
    await user.save();

    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const Loginuser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Username and password required" });
  }

  try {
    const user = await Login.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await Login.find({}, { password: 0 }); // Exclude password field
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Get users error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { project, projects } = req.body;

  // Accept either projects array or single project
  if (!projects && !project) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Project or projects field is required",
      });
  }

  try {
    let userProjects;

    // Handle projects array (preferred format)
    if (projects && Array.isArray(projects) && projects.length > 0) {
      userProjects = projects;
    }
    // Handle single project (legacy format)
    else if (project) {
      userProjects = [project];
    }

    const updatedUser = await Login.findByIdAndUpdate(
      id,
      { projects: userProjects },
      { new: true, select: { password: 0 } } // Exclude password from response
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Update user error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
