import * as cheerio from "cheerio";
import { v4 as uuid } from "uuid";
import type { Block } from "@/types";

export const htmlToBlocks = (html: string): Block[] => {
  const $ = cheerio.load(html, { xmlMode: false });
  const blocks: Block[] = [];
  let order = 0;

  $("body").children().each((_, el) => {
    const $el = $(el);
    const tagName = (el as cheerio.TagElement).tagName?.toLowerCase();

    if (!tagName) return;

    if (/^h[1-6]$/.test(tagName)) {
      blocks.push({
        id: uuid(),
        type: "heading",
        data: { text: $el.text().trim(), level: parseInt(tagName[1]) },
        order: order++,
      });
    } else if (tagName === "p") {
      const imgInP = $el.find("img");
      if (imgInP.length && $el.text().trim().length === 0) {
        blocks.push({
          id: uuid(),
          type: "image",
          data: { mediaId: "", alt: imgInP.attr("alt") || "", src: imgInP.attr("src") || "" },
          order: order++,
        });
      } else {
        blocks.push({
          id: uuid(),
          type: "paragraph",
          data: { text: $el.html()?.trim() || "" },
          order: order++,
        });
      }
    } else if (tagName === "img") {
      blocks.push({
        id: uuid(),
        type: "image",
        data: { mediaId: "", alt: $el.attr("alt") || "", src: $el.attr("src") || "" },
        order: order++,
      });
    } else if (tagName === "figure") {
      const img = $el.find("img");
      const caption = $el.find("figcaption").text().trim();
      blocks.push({
        id: uuid(),
        type: "image",
        data: {
          mediaId: "",
          alt: img.attr("alt") || "",
          caption,
          src: img.attr("src") || "",
        },
        order: order++,
      });
    } else if (tagName === "blockquote") {
      blocks.push({
        id: uuid(),
        type: "paragraph",
        data: { text: `<blockquote>${$el.html()?.trim()}</blockquote>` },
        order: order++,
      });
    } else if (["ul", "ol"].includes(tagName)) {
      blocks.push({
        id: uuid(),
        type: "richtext",
        data: { content: $.html(el)?.trim() || "" },
        order: order++,
      });
    } else {
      // Fallback: wrap unknown HTML in richtext block
      const content = $.html(el)?.trim();
      if (content) {
        blocks.push({
          id: uuid(),
          type: "richtext",
          data: { content },
          order: order++,
        });
      }
    }
  });

  return blocks;
};
