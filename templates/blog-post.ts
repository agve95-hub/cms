import { v4 as uuid } from "uuid";
import type { Block } from "@/types";

export const blogPostTemplate = {
  name: "Blog Post",
  slug: "blog-post",
  description: "Standard blog post with heading, content, and images",
  defaultBlocks: (): Block[] => [
    { id: uuid(), type: "heading", data: { text: "Post Title", level: 1 }, order: 0 },
    { id: uuid(), type: "paragraph", data: { text: "Start writing your post here..." }, order: 1 },
    { id: uuid(), type: "image", data: { mediaId: "", alt: "", caption: "" }, order: 2 },
    { id: uuid(), type: "paragraph", data: { text: "Continue your story..." }, order: 3 },
  ],
};
