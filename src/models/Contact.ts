import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  label: string;
  value: string;
  href: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Contact = mongoose.model<IContact>("Contact", contactSchema);

export default Contact;
