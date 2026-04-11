import Contact from "../models/Contact.js";

// GET all
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE
export const createContact = async (req, res) => {
  try {
    const { label, value, href } = req.body;

    const newContact = new Contact({ label, value, href });
    const saved = await newContact.save();

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateContact = async (req, res) => {
  try {
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};