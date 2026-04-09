import Hero from "../models/Hero.js";
const HERO_IMAGE_FIELDS = ["work", "me", "art"];

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (!["[", "{"].includes(trimmed[0])) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const normalizePayload = (body = {}) => {
  const parsed = Object.fromEntries(
    Object.entries(body).map(([key, value]) => [key, parseMaybeJson(value)])
  );

  if (parsed.images) parsed.images = parseMaybeJson(parsed.images);
  if (parsed.labels) parsed.labels = parseMaybeJson(parsed.labels);
  if (parsed.titleLine1 !== undefined) {
    parsed.titleLine1 = parseMaybeJson(parsed.titleLine1);
  }
  if (parsed.titleLine2 !== undefined) {
    parsed.titleLine2 = parseMaybeJson(parsed.titleLine2);
  }
  if (parsed.titleLine3 !== undefined) {
    parsed.titleLine3 = parseMaybeJson(parsed.titleLine3);
  }

  return parsed;
};

const normalizeStringArray = (value, fieldName, required = false) => {
  if (value === undefined || value === null) {
    if (required) return { error: `${fieldName} is required and must be an array` };
    return { value: undefined };
  }

  if (!Array.isArray(value)) {
    return { error: `${fieldName} must be an array` };
  }

  const cleaned = value.map((item) => String(item).trim()).filter(Boolean);
  return { value: cleaned };
};

const validateHeroInput = (payload, { isCreate = false } = {}) => {
  const {
    titleLine1,
    titleLine2,
    titleLine3,
    subtitle,
    ctaText,
    ctaLink,
    labels,
    images,
  } = payload;

  const line1 = normalizeStringArray(titleLine1, "titleLine1", isCreate);
  if (line1.error) return { error: line1.error };
  const line2 = normalizeStringArray(titleLine2, "titleLine2", isCreate);
  if (line2.error) return { error: line2.error };
  const line3 = normalizeStringArray(titleLine3, "titleLine3", isCreate);
  if (line3.error) return { error: line3.error };

  if (isCreate && (!subtitle || !String(subtitle).trim())) {
    return { error: "subtitle is required" };
  }

  if (ctaLink !== undefined && ctaLink !== null && ctaLink !== "") {
    if (!isValidHttpUrl(String(ctaLink).trim())) {
      return { error: "ctaLink must be a valid URL" };
    }
  } else if (isCreate) {
    return { error: "ctaLink is required" };
  }

  if (labels !== undefined) {
    if (typeof labels !== "object" || Array.isArray(labels) || labels === null) {
      return { error: "labels must be an object" };
    }
    for (const key of HERO_IMAGE_FIELDS) {
      if (labels[key] !== undefined && typeof labels[key] !== "string") {
        return { error: `labels.${key} must be a string` };
      }
    }
  }

  if (images !== undefined) {
    if (typeof images !== "object" || Array.isArray(images) || images === null) {
      return { error: "images must be an object" };
    }
    for (const key of HERO_IMAGE_FIELDS) {
      if (images[key] !== undefined && typeof images[key] !== "string") {
        return { error: `images.${key} must be a string URL` };
      }
    }
  }

  return {
    value: {
      titleLine1: line1.value,
      titleLine2: line2.value,
      titleLine3: line3.value,
      subtitle: subtitle !== undefined ? String(subtitle).trim() : undefined,
      ctaText: ctaText !== undefined ? String(ctaText).trim() : undefined,
      ctaLink: ctaLink !== undefined ? String(ctaLink).trim() : undefined,
      labels,
      images,
    },
  };
};

const getFileFromRequest = (files, key) => {
  return files?.[key]?.[0] || files?.[`${key}Image`]?.[0] || null;
};

const toPublicUploadUrl = (file) => `/uploads/hero/${file.filename}`;

const mergeDefined = (target, source) => {
  const output = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) output[key] = value;
  }
  return output;
};

export const createHeroContent = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const validated = validateHeroInput(payload, { isCreate: true });
    if (validated.error) {
      return res.status(400).json({ message: validated.error });
    }

    const images = {
      ...(validated.value.images || {}),
    };

    for (const key of HERO_IMAGE_FIELDS) {
      const imageFile = getFileFromRequest(req.files, key);
      if (imageFile) {
        images[key] = toPublicUploadUrl(imageFile);
      }
    }

    const hero = await Hero.create({
      titleLine1: validated.value.titleLine1 ?? [],
      titleLine2: validated.value.titleLine2 ?? [],
      titleLine3: validated.value.titleLine3 ?? [],
      subtitle: validated.value.subtitle || "",
      ctaText: validated.value.ctaText || "",
      ctaLink: validated.value.ctaLink || "",
      images: {
        work: images.work || "",
        me: images.me || "",
        art: images.art || "",
      },
      labels: {
        work: validated.value.labels?.work || "",
        me: validated.value.labels?.me || "",
        art: validated.value.labels?.art || "",
      },
    });

    return res.status(201).json(hero);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHeroContent = async (_req, res) => {
  try {
    const hero = await Hero.findOne().sort({ createdAt: -1 });
    if (!hero) {
      return res.status(404).json({ message: "No hero content found" });
    }

    return res.status(200).json(hero);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateHeroContent = async (req, res) => {
  try {
    const { id } = req.params;
    const hero = await Hero.findById(id);

    if (!hero) {
      return res.status(404).json({ message: "Hero content not found" });
    }

    const payload = normalizePayload(req.body);
    const validated = validateHeroInput(payload, { isCreate: false });
    if (validated.error) {
      return res.status(400).json({ message: validated.error });
    }

    const existing = hero.toObject();
    const updatedImages = {
      ...(existing.images || {}),
      ...(validated.value.images || {}),
    };

    for (const key of HERO_IMAGE_FIELDS) {
      const imageFile = getFileFromRequest(req.files, key);
      if (imageFile) {
        updatedImages[key] = toPublicUploadUrl(imageFile);
      }
    }

    const updates = mergeDefined({}, {
      titleLine1: validated.value.titleLine1,
      titleLine2: validated.value.titleLine2,
      titleLine3: validated.value.titleLine3,
      subtitle: validated.value.subtitle,
      ctaText: validated.value.ctaText,
      ctaLink: validated.value.ctaLink,
      labels:
        validated.value.labels !== undefined
          ? mergeDefined(existing.labels || {}, validated.value.labels)
          : undefined,
      images:
        req.files && Object.keys(req.files).length > 0
          ? updatedImages
          : validated.value.images !== undefined
          ? updatedImages
          : undefined,
    });

    const updatedHero = await Hero.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json(updatedHero);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
