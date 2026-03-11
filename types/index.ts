export type ContentStatus = "draft" | "published" | "archived" | "trashed";
export type UserRole = "admin" | "editor";

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
  order: number;
}

export type BlockType =
  | "heading"
  | "paragraph"
  | "richtext"
  | "image"
  | "gallery"
  | "video"
  | "contact_form"
  | "newsletter"
  | "testimonial"
  | "card_grid"
  | "feature_list";

export interface HeadingData {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ParagraphData {
  text: string;
}

export interface ImageData {
  mediaId: string;
  alt: string;
  caption?: string;
  alignment?: "left" | "center" | "right";
}

export interface GalleryData {
  images: Array<{ mediaId: string; alt: string; caption?: string }>;
  columns: 2 | 3 | 4;
}

export interface VideoData {
  url: string;
  caption?: string;
}

export interface ContactFormData {
  fields: Array<{ name: string; type: string; required: boolean }>;
  submitLabel: string;
  successMessage: string;
}

export interface NewsletterData {
  heading: string;
  description: string;
  buttonLabel: string;
}

export interface TestimonialData {
  quote: string;
  author: string;
  role?: string;
  avatarMediaId?: string;
}

export interface CardGridData {
  cards: Array<{
    title: string;
    description: string;
    mediaId?: string;
    linkUrl?: string;
  }>;
  columns: 2 | 3 | 4;
}

export interface FeatureListData {
  features: Array<{ icon: string; title: string; description: string }>;
  layout: "grid" | "list";
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  children?: MenuItem[];
}

export interface SEOFields {
  seoTitle?: string;
  seoDescription?: string;
  seoOgImage?: string;
  canonicalUrl?: string;
  robots?: string;
}

export interface MediaVariants {
  thumb: string;
  medium: string;
  large: string;
  thumbWebp: string;
  mediumWebp: string;
  largeWebp: string;
}
