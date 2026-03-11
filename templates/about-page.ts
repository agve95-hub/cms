import { v4 as uuid } from "uuid";
import type { Block } from "@/types";

export const aboutPageTemplate = {
  name: "About Page",
  slug: "about-page",
  description: "About us page with team info and company story",
  defaultBlocks: (): Block[] => [
    { id: uuid(), type: "heading", data: { text: "About Us", level: 1 }, order: 0 },
    { id: uuid(), type: "paragraph", data: { text: "Tell your company story here..." }, order: 1 },
    { id: uuid(), type: "card_grid", data: { cards: [], columns: 3 }, order: 2 },
  ],
};
