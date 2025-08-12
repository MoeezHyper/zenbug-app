import Report from "../models/reports.model.js";
import mongoose from "mongoose";
import supabase from "../middlewares/supabaseClient.js";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export const createReport = async (req, res) => {
  try {
    const { title, description, severity, name, email, projectName } = req.body;

    // Parse metadata safely
    let metadata = {};
    try {
      const rawMetadata = req.body.metadata;
      metadata =
        typeof rawMetadata === "string"
          ? JSON.parse(rawMetadata || "{}")
          : rawMetadata || {};
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid metadata format.",
      });
    }

    if (!title || !description || !metadata.url) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Handle file upload: either screenshot (image) or video (one at a time)
    let imageUrl = null;
    let videoUrl = null;
    const screenshotFile = req.files?.screenshot?.[0];
    const videoFile = req.files?.video?.[0];

    if (screenshotFile && videoFile) {
      return res.status(400).json({
        success: false,
        message: "Send either a screenshot or a video, not both.",
      });
    }

    if (screenshotFile) {
      if (!screenshotFile.mimetype.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          message: "Uploaded screenshot is not a valid image.",
        });
      }

      const ext = screenshotFile.originalname.split(".").pop();
      const fileName = `screenshot-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("screenshots")
        .upload(fileName, screenshotFile.buffer, {
          contentType: screenshotFile.mimetype,
        });
      if (uploadError) {
        console.warn("⚠️ Supabase upload failed:", uploadError.message);
      } else {
        const { data: publicData } = supabase.storage
          .from("screenshots")
          .getPublicUrl(fileName);
        imageUrl = publicData.publicUrl;
      }
    }

    if (videoFile) {
      if (!videoFile.mimetype.startsWith("video/")) {
        return res.status(400).json({
          success: false,
          message: "Uploaded file is not a valid video.",
        });
      }

      const ext = videoFile.originalname.split(".").pop();
      // Store videos at the root of the 'screenshots' bucket (no 'videos/' folder)
      const videoName = `video-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("screenshots")
        .upload(videoName, videoFile.buffer, {
          contentType: videoFile.mimetype,
          upsert: false,
        });
      if (uploadError) {
        console.warn("⚠️ Supabase upload failed:", uploadError.message);
      } else {
        const { data: publicData } = supabase.storage
          .from("screenshots")
          .getPublicUrl(videoName);
        videoUrl = publicData.publicUrl;
      }
    }

    // Save report
    const newReport = new Report({
      title,
      projectName,
      description,
      name,
      email,
      severity,
      metadata,
      imageUrl,
      videoUrl,
    });

    await newReport.save();

    // Email notification
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "moeezmalik03@gmail.com",
      subject: "🐞 New Bug Report Submitted",
      text: `
New bug report submitted:

Name: ${name || "N/A"}
Email: ${email || "N/A"}
Project: ${projectName || "N/A"}
Title: ${title}
Severity: ${severity || "Not specified"}

Description:
${description}

Submitted from: ${metadata.url}
Browser: ${metadata.browser}
OS: ${metadata.os}
Viewport: ${metadata.viewport}
IP: ${metadata.ip || "N/A"}
Location: ${metadata.location || "N/A"}
${imageUrl ? `\nScreenshot: ${imageUrl}` : ""}
      `,
    });

    res.status(201).json({ success: true, data: newReport });
  } catch (error) {
    console.error("❌ Error in createReport:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getReport = async (req, res) => {
  try {
    let query = {};

    // If user is not admin and has a specific project assignment, filter reports
    if (
      req.user.username !== "admin" &&
      req.user.project &&
      req.user.project !== "all"
    ) {
      query.projectName = req.user.project;
    }

    const report = await Report.find(query);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error("Error in fetching reports:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateReport = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }

  try {
    const updatedReport = await Report.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedReport) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    res.status(200).json({ success: true, data: updatedReport });
  } catch (error) {
    console.error("Error updating report:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteReport = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid report ID" });
  }

  try {
    const report = await Report.findById(id);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    // Extract clean filenames
    const cleanFileName = (url) => {
      if (!url) return null;
      const parts = url.split("/");
      let fileName = parts[parts.length - 1];
      // Remove codec/query parameters
      fileName = fileName.split(";")[0].split("?")[0];
      return fileName;
    };

    const imageFileName = cleanFileName(report.imageUrl);
    const videoFileName = cleanFileName(report.videoUrl);

    // Delete DB record
    await Report.findByIdAndDelete(id);

    // Delete image from Supabase
    if (imageFileName) {
      await supabase.storage.from("screenshots").remove([imageFileName]);
    }

    // Delete video from Supabase
    if (videoFileName) {
      await supabase.storage.from("screenshots").remove([videoFileName]);
    }

    res
      .status(200)
      .json({ success: true, message: "Report, image, and video deleted" });
  } catch (error) {
    console.error("Error deleting report:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProjectNames = async (req, res) => {
  try {
    const projectNames = await Report.distinct("projectName");
    // Filter out null/undefined values and add "all" option
    const validProjects = projectNames.filter(
      (name) => name && name.trim() !== ""
    );
    const projects = ["all", ...validProjects];

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error("Error fetching project names:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
