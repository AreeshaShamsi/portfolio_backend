import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  points: {
    type: [String],
    required: true,
    validate: {
      validator: (value) => Array.isArray(value) && value.length > 0,
      message: "points must be a non-empty array of strings",
    },
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Skill = mongoose.model("Skill", skillSchema);

export default Skill;
