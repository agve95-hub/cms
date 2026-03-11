import { readFile } from "fs/promises";

const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/gif": [0x47, 0x49, 0x46],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

const ALLOWED_MIMES = new Set(Object.keys(MAGIC_BYTES).concat(["image/svg+xml"]));
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export const validateUpload = async (
  buffer: Buffer,
  declaredMime: string,
  size: number
): Promise<{ valid: boolean; error?: string }> => {
  if (size > MAX_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB.` };
  }

  if (!ALLOWED_MIMES.has(declaredMime)) {
    return { valid: false, error: `File type ${declaredMime} is not allowed.` };
  }

  if (declaredMime === "image/svg+xml") {
    const content = buffer.toString("utf-8");
    if (/<script/i.test(content) || /on\w+\s*=/i.test(content) || /javascript:/i.test(content)) {
      return { valid: false, error: "SVG contains potentially malicious content." };
    }
    return { valid: true };
  }

  const expected = MAGIC_BYTES[declaredMime];
  if (expected) {
    const actual = Array.from(buffer.subarray(0, expected.length));
    const matches = expected.every((byte, i) => actual[i] === byte);
    if (!matches) {
      return { valid: false, error: "File content does not match declared type." };
    }
  }

  return { valid: true };
};
