"use client";

/**
 * Client-side image preparation for the vision flow.
 *
 * Two constraints shape this: providers read images best near ~1500px on the
 * long edge, and Vercel caps request bodies near 4.5 MB — so every image is
 * downscaled and re-encoded to JPEG before it is ever put in a message.
 * Anything that fails (EXIF, decode, storage pressure) reports null and the
 * caller skips the file rather than failing the send.
 */

export const IMAGE_MAX_EDGE = 1568;
export const IMAGE_QUALITY = 0.82;
export const MAX_ATTACHED_IMAGES = 2;

/** Acceptable inputs for attach: the formats the server schema allows. */
export function isImageFile(file: File | Blob): boolean {
  return (
    file instanceof File
      ? ["image/png", "image/jpeg", "image/webp"]
      : ["image/png", "image/jpeg", "image/webp"]
  ).includes(file.type);
}

/** Decode, downscale to `IMAGE_MAX_EDGE`, and re-encode as JPEG data URL. */
export async function downscaleToDataUrl(file: Blob): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      IMAGE_MAX_EDGE / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
  } catch {
    return null;
  }
}

/** Prepare a drop/paste/attach batch into at most `MAX_ATTACHED_IMAGES` data
 * URLs, skipping non-images and files that fail to decode. */
export async function prepareImages(
  files: Iterable<File | Blob>,
  existingCount = 0,
): Promise<string[]> {
  const accepted: string[] = [];
  const room = Math.max(0, MAX_ATTACHED_IMAGES - existingCount);
  for (const file of files) {
    if (accepted.length >= room) break;
    if (!isImageFile(file)) continue;
    const dataUrl = await downscaleToDataUrl(file);
    if (dataUrl) accepted.push(dataUrl);
  }
  return accepted;
}
