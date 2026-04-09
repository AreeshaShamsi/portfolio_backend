import express from "express";
import {
  createSkill,
  deleteSkill,
  getSkills,
  updateSkill,
} from "../controllers/skillController.js";

const router = express.Router();

router.post("/", createSkill);
router.get("/", getSkills);
router.put("/:id", updateSkill);
router.delete("/:id", deleteSkill);

export default router;
