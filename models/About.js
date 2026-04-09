import mongoose from "mongoose";

const statSchema = new mongoose.Schema(
  {
    num: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const currentlySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const aboutSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    stats: { type: [statSchema], default: [] },
    currently: { type: [currentlySchema], default: [] },
  },
  { timestamps: true }
);

const About = mongoose.model("About", aboutSchema);

export default About;
