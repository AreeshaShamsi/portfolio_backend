import Blog from "../models/Blog.js";
import { generateUniqueSlug } from "../utils/slug.js";
import { toHtml } from "../utils/markdown.js";
import mongoose from "mongoose";

const parsePagination = (req) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  return { page, limit };
};

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const withHtml = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  return { ...obj, contentHtml: toHtml(obj.content || "") };
};

const normalizeRelatedIds = (ids) => {
  if (ids === undefined) return undefined;
  if (!Array.isArray(ids)) return null;
  const unique = [...new Set(ids.map((id) => String(id)))];
  return unique;
};

const validateRelatedBlogs = async (relatedIds, selfId = null) => {
  if (relatedIds === undefined) return [];
  if (relatedIds === null) {
    return { error: "relatedBlogs must be an array of IDs" };
  }

  const invalid = relatedIds.filter((id) => !mongoose.isValidObjectId(id));
  if (invalid.length > 0) {
    return { error: "Invalid relatedBlogs IDs" };
  }

  if (selfId && relatedIds.some((id) => String(id) === String(selfId))) {
    return { error: "A blog cannot link to itself" };
  }

  if (relatedIds.length === 0) return [];

  const count = await Blog.countDocuments({
    _id: { $in: relatedIds },
  });
  if (count !== relatedIds.length) {
    return { error: "Some relatedBlogs IDs do not exist" };
  }

  return relatedIds;
};

export const createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      metaTitle,
      metaDescription,
      keywords,
      ogImage,
      relatedBlogs,
    } = req.body || {};

    if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const slug = await generateUniqueSlug(Blog, title);

    const relatedIds = normalizeRelatedIds(relatedBlogs);
    const relatedValidation = await validateRelatedBlogs(relatedIds);
    if (relatedValidation && relatedValidation.error) {
      return res.status(400).json({ message: relatedValidation.error });
    }

    const blog = await Blog.create({
      title: title.trim(),
      content,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      ogImage,
      relatedBlogs: relatedIds ?? [],
    });

    res.status(201).json(withHtml(blog));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBlogs = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req);
    if (page < 1 || limit < 1) {
      return res.status(400).json({ message: "Invalid pagination values" });
    }

    const total = await Blog.countDocuments();
    const pages = Math.max(1, Math.ceil(total / limit));
    const skip = (page - 1) * limit;

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      total,
      page,
      pages,
      blogs: blogs.map((b) => ({ ...b, contentHtml: toHtml(b.content || "") })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate({
      path: "relatedBlogs",
      select: "_id title slug",
      options: { lean: true },
    });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(withHtml(blog));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const {
      title,
      content,
      metaTitle,
      metaDescription,
      keywords,
      ogImage,
      relatedBlogs,
    } = req.body || {};

    if (title !== undefined && !isNonEmptyString(title)) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (content !== undefined && !isNonEmptyString(content)) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (isNonEmptyString(title) && title.trim() !== blog.title) {
      blog.slug = await generateUniqueSlug(Blog, title, blog._id);
      blog.title = title.trim();
    }

    if (content !== undefined) blog.content = content;
    if (metaTitle !== undefined) blog.metaTitle = metaTitle;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription;
    if (keywords !== undefined) blog.keywords = keywords;
    if (ogImage !== undefined) blog.ogImage = ogImage;
    if (relatedBlogs !== undefined) {
      const relatedIds = normalizeRelatedIds(relatedBlogs);
      const relatedValidation = await validateRelatedBlogs(
        relatedIds,
        blog._id
      );
      if (relatedValidation && relatedValidation.error) {
        return res.status(400).json({ message: relatedValidation.error });
      }
      blog.relatedBlogs = relatedIds ?? [];
    }

    await blog.save();
    res.json(withHtml(blog));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json({ message: "Blog removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
