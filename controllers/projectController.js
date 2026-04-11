import Project from '../models/Project.js';

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
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Project index already exists' });
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};