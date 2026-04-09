import mongoose from "mongoose";
import Contact from "../models/Contact.js";

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const getContacts = async (_req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: 1 });
    return res.status(200).json(contacts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addContact = async (req, res) => {
  try {
    const { label, value, href } = req.body || {};

    if (!isNonEmptyString(label)) {
      return res.status(400).json({ message: "label is required" });
    }
    if (!isNonEmptyString(value)) {
      return res.status(400).json({ message: "value is required" });
    }
    if (!isNonEmptyString(href)) {
      return res.status(400).json({ message: "href is required" });
    }

    const contact = await Contact.create({
      label: label.trim(),
      value: value.trim(),
      href: href.trim(),
    });

    return res.status(201).json(contact);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }

    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Contact not found" });
    }

    return res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
