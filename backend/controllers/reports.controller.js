import Report from "../models/reports.model.js";
import mongoose from "mongoose";
import supabase from "../middlewares/supabaseClient.js";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export const createReport = async (req, res) => {
  try {
    const { title, description, severity } = req.body;

    // Parse metadata from string to object
    const metadata = JSON.parse(req.body.metadata || "{}");

    if (!title || !description || !metadata.url) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Handle screenshot upload
    let imageUrl = null;
    const file = req.file; // available from multer middleware

    if (file) {
      // Optional: validate mimetype
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          message: "Uploaded file is not a valid image.",
        });
      }

      const fileName = `screenshot-${Date.now()}.png`;

      const { data, error } = await supabase.storage
        .from("screenshots")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        console.warn("⚠️ Supabase upload failed:", error.message);
      } else {
        const publicUrl = supabase.storage
          .from("screenshots")
          .getPublicUrl(fileName).data.publicUrl;

        imageUrl = publicUrl;
      }
    }

    // Save report
    const newReport = new Report({
      title,
      description,
      severity,
      metadata,
      imageUrl,
    });

    await newReport.save();

    // Email notification
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "moeezmalik03@gmail.com",
      subject: "🐞 New Bug Report Submitted",
      text: `
New bug report submitted:

Title: ${title}
Severity: ${severity || "Not specified"}

Description:
${description}

Submitted from: ${metadata.url}
Browser: ${metadata.browser}
OS: ${metadata.os}
Viewport: ${metadata.viewport}
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
    const report = await Report.find({});
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

    const imageUrl = report.imageUrl;
    let fileName = null;

    if (imageUrl) {
      const parts = imageUrl.split("/");
      fileName = parts[parts.length - 1];
    }

    await Report.findByIdAndDelete(id);

    if (fileName) {
      const { error } = await supabase.storage
        .from("screenshots")
        .remove([fileName]);

      if (error) {
        console.warn("Failed to delete Supabase file:", error.message);
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Report and image deleted" });
  } catch (error) {
    console.error("Error deleting report:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
