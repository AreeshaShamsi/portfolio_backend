import Project from '../models/Project.js';
import { v2 as cloudinary } from 'cloudinary';

const deleteFromCloudinary = (publicId) => cloudinary.uploader.destroy(publicId);

// ── helper: parse fields that arrive as JSON strings from FormData ──
const parseFormData = (body) => {
  const tools = (() => {
    try { return JSON.parse(body.tools); }
    catch { return Array.isArray(body.tools) ? body.tools : []; }
  })();

  const results = (() => {
    try { return JSON.parse(body.results); }
    catch { return Array.isArray(body.results) ? body.results : []; }
  })();

  return { tools, results };
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ index: 1 });
    res.status(200).json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found' });
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { tools, results } = parseFormData(req.body);

    const payload = {
      index:    req.body.index,
      title:    req.body.title,
      category: req.body.category,
      imgAlt:   req.body.imgAlt,
      problem:  req.body.problem,
      approach: req.body.approach,
      tools,
      results,
    };

    // Cloudinary URL injected by uploadImage middleware
    if (req.body.imageUrl)      payload.imageUrl      = req.body.imageUrl;
    if (req.body.imagePublicId) payload.imagePublicId = req.body.imagePublicId;

    const project = await Project.create(payload);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Project index already exists' });
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { tools, results } = parseFormData(req.body);

    const payload = {
      index:    req.body.index,
      title:    req.body.title,
      category: req.body.category,
      imgAlt:   req.body.imgAlt,
      problem:  req.body.problem,
      approach: req.body.approach,
      tools,
      results,
    };

    // New image uploaded → delete old one first
    if (req.body.imageUrl) {
      const existing = await Project.findById(req.params.id).select('imagePublicId');
      if (existing?.imagePublicId) await deleteFromCloudinary(existing.imagePublicId);
      payload.imageUrl      = req.body.imageUrl;
      payload.imagePublicId = req.body.imagePublicId;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found' });
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found' });

    if (project.imagePublicId) await deleteFromCloudinary(project.imagePublicId);

    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};