import express from "express";
import {
  addContact,
  deleteContact,
  getContacts,
} from "../controllers/contactController.js";

const router = express.Router();

router.get("/api/contacts", getContacts);
router.post("/api/contacts", addContact);
router.delete("/api/contacts/:id", deleteContact);

export default router;
