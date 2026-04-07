import { marked } from "marked";

export const toHtml = (markdown = "") => marked.parse(markdown);
