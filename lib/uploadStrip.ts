import { upload } from "@vercel/blob/client";

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",");
  const mime = /data:([^;]+);/.exec(header)?.[1] ?? "image/png";
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);
  return new File([buffer], filename, { type: mime });
}

export interface StripUploadResult {
  sessionId: string;
  shareUrl: string;
}

/**
 * Uploads a photostrip PNG to Vercel Blob and returns the share path id.
 * Shared by QR display and review-entry upload for the idle gallery.
 */
export async function uploadStrip(
  imageDataUrl: string
): Promise<StripUploadResult> {
  const sessionId = crypto.randomUUID();
  const file = dataUrlToFile(imageDataUrl, `${sessionId}.png`);

  await upload(`photobooth/${sessionId}.png`, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
    contentType: "image/png",
  });

  const shareUrl = `${window.location.origin}/s/${sessionId}`;
  return { sessionId, shareUrl };
}
