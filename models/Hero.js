import mongoose from "mongoose";

const heroSchema = new mongoose.Schema(
  {
    titleLine1: {
      type: [String],
      default: [],
    },
    titleLine2: {
      type: [String],
      default: [],
    },
    titleLine3: {
      type: [String],
      default: [],
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    ctaText: {
      type: String,
      default: "",
      trim: true,
    },
    ctaLink: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      work: { type: String, default: "" },
      me: { type: String, default: "" },
      art: { type: String, default: "" },
    },
    labels: {
      work: { type: String, default: "" },
      me: { type: String, default: "" },
      art: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

const Hero = mongoose.model("Hero", heroSchema);

export default Hero;
