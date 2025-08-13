import mongoose from "mongoose";

const loginSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },
    projects: {
      type: [String],
      default: ["all"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "Projects array cannot be empty",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Login = mongoose.model("Login", loginSchema);
export default Login;
