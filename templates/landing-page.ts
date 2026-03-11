import { v4 as uuid } from "uuid";
import type { Block } from "@/types";

export const landingPageTemplate = {
  name: "Landing Page",
  slug: "landing-page",
  description: "Marketing landing page with hero, features, testimonials, and contact form",
  defaultBlocks: (): Block[] => [
    { id: uuid(), type: "heading", data: { text: "Your Headline Here", level: 1 }, order: 0 },
    { id: uuid(), type: "paragraph", data: { text: "A compelling description of your product or service." }, order: 1 },
    { id: uuid(), type: "feature_list", data: { features: [], layout: "grid" }, order: 2 },
    { id: uuid(), type: "testimonial", data: { quote: "", author: "", role: "" }, order: 3 },
    { id: uuid(), type: "contact_form", data: {
      fields: [
        { name: "name", type: "text", required: true },
        { name: "email", type: "email", required: true },
        { name: "message", type: "textarea", required: true },
      ],
      submitLabel: "Send Message",
      successMessage: "Thank you! We'll be in touch soon.",
    }, order: 4 },
  ],
};
