import About from "../models/About.js";

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isStringArray = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isStatsArray = (value) =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      isNonEmptyString(item.num) &&
      isNonEmptyString(item.label)
  );

const isCurrentlyArray = (value) =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      isNonEmptyString(item.label) &&
      isNonEmptyString(item.text)
  );

export const getAbout = async (_req, res) => {
  try {
    const about = await About.findOne().sort({ createdAt: -1 });
    if (!about) {
      return res.status(404).json({ message: "About data not found" });
    }
    return res.status(200).json(about);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateAbout = async (req, res) => {
  try {
    const { title, description, tags, stats, currently } = req.body || {};

    if (!isNonEmptyString(title)) {
      return res.status(400).json({ message: "title is required" });
    }
    if (!isNonEmptyString(description)) {
      return res.status(400).json({ message: "description is required" });
    }
    if (!isStringArray(tags)) {
      return res.status(400).json({ message: "tags must be an array of strings" });
    }
    if (!isStatsArray(stats)) {
      return res
        .status(400)
        .json({ message: "stats must be an array of { num, label } objects" });
    }
    if (!isCurrentlyArray(currently)) {
      return res
        .status(400)
        .json({ message: "currently must be an array of { label, text } objects" });
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      tags: tags.map((tag) => tag.trim()).filter(Boolean),
      stats: stats.map((item) => ({
        num: item.num.trim(),
        label: item.label.trim(),
      })),
      currently: currently.map((item) => ({
        label: item.label.trim(),
        text: item.text.trim(),
      })),
    };

    const latest = await About.findOne().sort({ createdAt: -1 });

    const about = latest
      ? await About.findByIdAndUpdate(latest._id, payload, {
          new: true,
          runValidators: true,
        })
      : await About.create(payload);

    return res.status(200).json(about);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
