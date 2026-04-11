import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
  stat:  { type: String, required: true },
  label: { type: String, required: true },
}, { _id: false });

const ProjectSchema = new mongoose.Schema(
  {
    index:    { type: String, required: true, unique: true },
    title:    { type: String, required: true },
    category: { type: String, required: true },
    img:      { type: String, required: true },
    imgAlt:   { type: String, required: true },
    problem:  { type: String, required: true },
    approach: { type: String, required: true },
    tools:    [{ type: String }],
    results:  [ResultSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Project', ProjectSchema);