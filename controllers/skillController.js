import mongoose from "mongoose";
import Skill from "../models/Skill.js";

// Helpers
const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const normalizePoints = (points) => {
  if (!Array.isArray(points)) return null;
  return points.map((p) => String(p).trim()).filter(Boolean);
};

const parseOrder = (value) => {
  if (value === undefined) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

// CREATE
export const createSkill = async (req, res) => {
  console.log("🔥 Incoming Body:", req.body); // DEBUG

  try {
    const { title, points, order } = req.body || {};

    // Validate title
    if (!isNonEmptyString(title)) {
      return res.status(400).json({ message: "title is required" });
    }

    // Validate points
    const normalizedPoints = normalizePoints(points);
    if (!normalizedPoints) {
      return res.status(400).json({
        message: "points must be an array of strings",
      });
    }

    // Validate order
    const parsedOrder = parseOrder(order);
    if (parsedOrder === null) {
      return res.status(400).json({
        message: "order must be a number",
      });
    }

    // Create skill
    const skill = await Skill.create({
      title: title.trim(),
      points: normalizedPoints,
      ...(parsedOrder !== undefined ? { order: parsedOrder } : {}),
    });

    console.log("✅ Skill Created:", skill); // DEBUG

    return res.status(201).json(skill);
  } catch (error) {
    console.error("❌ Create Skill Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// GET ALL
export const getSkills = async (_req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1, createdAt: 1 });
    return res.status(200).json(skills);
  } catch (error) {
    console.error("❌ Get Skills Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid skill ID" });
    }

    const { title, points, order } = req.body || {};
    const updates = {};

    if (title !== undefined) {
      if (!isNonEmptyString(title)) {
        return res.status(400).json({
          message: "title must be a non-empty string",
        });
      }
      updates.title = title.trim();
    }

    if (points !== undefined) {
      const normalizedPoints = normalizePoints(points);
      if (!normalizedPoints) {
        return res.status(400).json({
          message: "points must be an array of strings",
        });
      }
      updates.points = normalizedPoints;
    }

    if (order !== undefined) {
      const parsedOrder = parseOrder(order);
      if (parsedOrder === null) {
        return res.status(400).json({
          message: "order must be a number",
        });
      }
      updates.order = parsedOrder;
    }

    const skill = await Skill.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    return res.status(200).json(skill);
  } catch (error) {
    console.error("❌ Update Skill Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid skill ID" });
    }

    const skill = await Skill.findByIdAndDelete(id);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    return res.status(200).json({
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Skill Error:", error);
    return res.status(500).json({ message: error.message });
  }
};