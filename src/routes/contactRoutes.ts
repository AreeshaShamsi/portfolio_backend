import { Router } from "express";
import {
  addContact,
  deleteContact,
  getContacts,
} from "../controllers/contactController.js";

const router = Router();

router.get("/", getContacts);
router.post("/", addContact);
router.delete("/:id", deleteContact);

export default router;
