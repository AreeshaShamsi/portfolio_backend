import express from "express";
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact
} from "../controllers/contactController.js";

const router = express.Router();

// GET all
router.get("/", getContacts);

// CREATE
router.post("/", createContact);

// UPDATE
router.put("/:id", updateContact);

// DELETE
router.delete("/:id", deleteContact);

export default router;