import slugify from "slugify";
import crypto from "crypto";

const randomSuffix = (size = 6) =>
  crypto.randomBytes(size).toString("hex").slice(0, size);

export const generateUniqueSlug = async (Model, title, excludeId = null) => {
  let base = slugify(title || "", { lower: true, strict: true, trim: true });
  if (!base) {
    base = `post-${randomSuffix()}`;
  }

  let slug = base;
  let exists = await Model.findOne({ slug }).select("_id").lean();
  if (exists && excludeId && String(exists._id) === String(excludeId)) {
    return slug;
  }

  while (exists) {
    slug = `${base}-${randomSuffix()}`;
    exists = await Model.findOne({ slug }).select("_id").lean();
    if (exists && excludeId && String(exists._id) === String(excludeId)) {
      return slug;
    }
  }

  return slug;
};
