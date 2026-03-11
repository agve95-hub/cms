import sharp from "sharp";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";

interface ProcessedImage {
  original: string;
  variants: {
    thumb: string;
    medium: string;
    large: string;
    thumbWebp: string;
    mediumWebp: string;
    largeWebp: string;
  };
  width: number;
  height: number;
}

const SIZES = { thumb: 400, medium: 800, large: 1200 } as const;

export const processImage = async (
  buffer: Buffer,
  originalFilename: string,
): Promise<ProcessedImage> => {
  const date = new Date();
  const dir = path.join("uploads", String(date.getFullYear()), String(date.getMonth() + 1).padStart(2, "0"));
  await mkdir(dir, { recursive: true });

  const ext = path.extname(originalFilename).toLowerCase();
  const base = `${uuid()}`;
  const metadata = await sharp(buffer).metadata();

  // Save original
  const originalPath = path.join(dir, `${base}${ext}`);
  await writeFile(originalPath, buffer);

  const variants: Record<string, string> = {};

  for (const [name, width] of Object.entries(SIZES)) {
    // JPEG variant
    const jpgPath = path.join(dir, `${base}-${name}${ext}`);
    await sharp(buffer)
      .resize(width, undefined, { withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(jpgPath);
    variants[name] = jpgPath;

    // WebP variant
    const webpPath = path.join(dir, `${base}-${name}.webp`);
    await sharp(buffer)
      .resize(width, undefined, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpPath);
    variants[`${name}Webp`] = webpPath;
  }

  return {
    original: originalPath,
    variants: variants as ProcessedImage["variants"],
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
};
