import Blog from "../models/Blog.js";

const getBaseUrl = (req) => {
  const envBase = process.env.BASE_URL;
  if (envBase) return envBase.replace(/\/+$/, "");
  return `${req.protocol}://${req.get("host")}`;
};

export const getSitemap = async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const blogs = await Blog.find()
      .select("slug updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    const urls = blogs
      .map((b) => {
        const lastmod = b.updatedAt
          ? new Date(b.updatedAt).toISOString()
          : new Date().toISOString();
        return `  <url>
    <loc>${baseUrl}/blog/${b.slug}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    res.status(500).send("Sitemap generation failed");
  }
};

export const getRobots = (req, res) => {
  const baseUrl = getBaseUrl(req);
  const txt = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml
`;
  res.set("Content-Type", "text/plain");
  res.send(txt);
};
