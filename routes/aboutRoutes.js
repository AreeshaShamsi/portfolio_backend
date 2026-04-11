import express from "express";
import { getAbout, updateAbout } from "../controllers/aboutController.js";

const router = express.Router();

router.get("/about", getAbout);
router.put("/about", updateAbout);

export default router;
