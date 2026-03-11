import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "a", "strong", "em", "b", "i", "u", "s",
  "ul", "ol", "li", "blockquote", "br", "img",
  "span", "sub", "sup", "hr", "pre", "code",
];

const ALLOWED_ATTR = [
  "href", "target", "rel", "src", "alt", "title",
  "class", "id", "width", "height", "loading",
];

export const sanitizeHtml = (dirty: string): string =>
  DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover", "onfocus", "style"],
  });

export const sanitizePlainText = (text: string): string =>
  text.replace(/[<>&"']/g, (c) => {
    const map: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" };
    return map[c] || c;
  });
