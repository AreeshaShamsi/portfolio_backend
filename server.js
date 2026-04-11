import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import blogRoutes from "./routes/blogRoutes.js";
import seoRoutes from "./routes/seoRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import connectDB from "./config/db.js";
import projectRoutes from './routes/projectRoutes.js';

dotenv.config();

const app = express();


app.use(cors());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/", seoRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/", heroRoutes); 
app.use("/skill", skillRoutes);
app.use("/", aboutRoutes);
app.use("/contact", contactRoutes);
app.use('/projects', projectRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
