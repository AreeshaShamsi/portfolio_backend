import mongoose, { Schema, Document } from "mongoose";

interface IStat {
  num: string;
  label: string;
}

interface ICurrentItem {
  label: string;
  text: string;
}

export interface IAbout extends Document {
  eyebrow: string;
  headline: string;
  body: string;
  tags: string[];
  stats: IStat[];
  currently: ICurrentItem[];
  createdAt: Date;
  updatedAt: Date;
}

const statSchema = new Schema<IStat>(
  {
    num: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const currentItemSchema = new Schema<ICurrentItem>(
  {
    label: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const aboutSchema = new Schema<IAbout>(
  {
    eyebrow: { type: String, required: true, trim: true },
    headline: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    stats: { type: [statSchema], default: [] },
    currently: { type: [currentItemSchema], default: [] },
  },
  { timestamps: true }
);

const About = mongoose.model<IAbout>("About", aboutSchema);

export default About;
