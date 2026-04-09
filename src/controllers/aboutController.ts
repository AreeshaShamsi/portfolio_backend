import { Request, Response } from "express";
import About from "../models/About.js";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const normalizeStringArray = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  return value.map((item) => String(item).trim()).filter(Boolean);
};

const isValidStats = (value: unknown): boolean => {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      isNonEmptyString((item as { num?: unknown }).num) &&
      isNonEmptyString((item as { label?: unknown }).label)
  );
};

const isValidCurrently = (value: unknown): boolean => {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      isNonEmptyString((item as { label?: unknown }).label) &&
      isNonEmptyString((item as { text?: unknown }).text)
  );
};

export const getAbout = async (_req: Request, res: Response) => {
  try {
    const about = await About.findOne().sort({ updatedAt: -1, createdAt: -1 });
    if (!about) {
      return res.status(404).json({ message: "About section not found" });
    }
    return res.status(200).json(about);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ message });
  }
};

export const updateAbout = async (req: Request, res: Response) => {
  try {
    const { eyebrow, headline, body, tags, stats, currently } = req.body || {};

    if (!isNonEmptyString(eyebrow)) {
      return res.status(400).json({ message: "eyebrow is required" });
    }
    if (!isNonEmptyString(headline)) {
      return res.status(400).json({ message: "headline is required" });
    }
    if (!isNonEmptyString(body)) {
      return res.status(400).json({ message: "body is required" });
    }

    const normalizedTags = normalizeStringArray(tags);
    if (normalizedTags === null) {
      return res.status(400).json({ message: "tags must be an array of strings" });
    }

    if (!isValidStats(stats)) {
      return res
        .status(400)
        .json({ message: "stats must be an array of { num, label } objects" });
    }

    if (!isValidCurrently(currently)) {
      return res
        .status(400)
        .json({ message: "currently must be an array of { label, text } objects" });
    }

    const latest = await About.findOne().sort({ updatedAt: -1, createdAt: -1 });

    const updatedAbout = latest
      ? await About.findByIdAndUpdate(
          latest._id,
          {
            eyebrow: eyebrow.trim(),
            headline: headline.trim(),
            body: body.trim(),
            tags: normalizedTags,
            stats,
            currently,
          },
          { new: true, runValidators: true }
        )
      : await About.create({
          eyebrow: eyebrow.trim(),
          headline: headline.trim(),
          body: body.trim(),
          tags: normalizedTags,
          stats,
          currently,
        });

    return res.status(200).json(updatedAbout);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ message });
  }
};
