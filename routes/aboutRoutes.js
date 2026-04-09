import express from "express";
import { getAbout, updateAbout } from "../controllers/aboutController.js";

const router = express.Router();

router.get("/api/about", getAbout);
router.put("/api/about", updateAbout);

export default router;
