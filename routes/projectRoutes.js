import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';

// ── Cloudinary config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Cloudinary storage ───────────────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'projects',
    resource_type:   'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// ── Multer upload ────────────────────────────────────────────────────────────
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype))
      return cb(new Error('Only JPG, PNG, and WebP images are allowed'));
    cb(null, true);
  },
});

const uploadImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError)
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    if (err)
      return res.status(400).json({ success: false, message: err.message });

    if (req.file) {
      req.body.imageUrl      = req.file.path;
      req.body.imagePublicId = req.file.filename;
    }

    next();
  });
};

// ── Routes ───────────────────────────────────────────────────────────────────
const router = express.Router();

router.get('/test/cloudinary', async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({ success: true, status: result.status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/',       getAllProjects);
router.get('/:id',    getProjectById);
router.post('/',      uploadImage, createProject);
router.put('/:id',    uploadImage, updateProject);
router.delete('/:id',             deleteProject);

export default router;