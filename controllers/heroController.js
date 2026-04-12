import Hero from "../models/Hero.js";

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || !["[", "{"].includes(trimmed[0])) return value;
  try { return JSON.parse(trimmed); } catch { return value; }
};

const normalizePayload = (body = {}) =>
  Object.fromEntries(Object.entries(body).map(([k, v]) => [k, parseMaybeJson(v)]));

const parseArray = (val) => {
  if (val === undefined) return undefined;
  if (Array.isArray(val)) {
    const cleaned = val.map((v) => String(v).trim()).filter(Boolean);
    return cleaned.length ? cleaned : undefined;
  }
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map((v) => String(v).trim()).filter(Boolean);
        return cleaned.length ? cleaned : undefined;
      }
    } catch {
      const cleaned = val.split(",").map((v) => v.trim()).filter(Boolean);
      return cleaned.length ? cleaned : undefined;
    }
  }
  return undefined;
};

export const createHeroContent = async (req, res) => {
  try {
    const body = normalizePayload(req.body);
    const hero = await Hero.create({
      titleLine1: parseArray(body.titleLine1) ?? [],
      titleLine2: parseArray(body.titleLine2) ?? [],
      titleLine3: parseArray(body.titleLine3) ?? [],
      subtitle:   body.subtitle || "",
      ctaText:    body.ctaText  || "",
      ctaLink:    body.ctaLink  || "",
      labels:     body.labels   || {},
    });
    return res.status(201).json(hero);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getHeroContent = async (_req, res) => {
  try {
    const hero = await Hero.findOne().sort({ createdAt: -1 });
    if (!hero) return res.status(404).json({ message: "No hero found" });
    return res.status(200).json(hero);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateHeroContent = async (req, res) => {
  try {
    const hero = await Hero.findById(req.params.id);
    if (!hero) return res.status(404).json({ message: "Hero not found" });

    const body       = normalizePayload(req.body);
    const updateData = {};

    const t1 = parseArray(body.titleLine1);
    const t2 = parseArray(body.titleLine2);
    const t3 = parseArray(body.titleLine3);
    if (t1) updateData.titleLine1 = t1;
    if (t2) updateData.titleLine2 = t2;
    if (t3) updateData.titleLine3 = t3;

    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.ctaText  !== undefined) updateData.ctaText  = body.ctaText;
    if (body.ctaLink  !== undefined) updateData.ctaLink  = body.ctaLink;
    if (body.labels   !== undefined) updateData.labels   = body.labels;

    const updated = await Hero.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    return res.status(200).json({ message: "Hero updated successfully", data: updated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};