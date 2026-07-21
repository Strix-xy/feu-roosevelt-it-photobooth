import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GALLERY_LIMIT = 16;

/**
 * Public list of recent photostrips for the idle showcase.
 * Returns empty items when Blob is not configured.
 */
export async function GET(): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ items: [] });
  }

  try {
    const page = await list({
      prefix: "photobooth/",
      limit: GALLERY_LIMIT,
    });

    const items = [...page.blobs]
      .filter((b) => b.pathname.endsWith(".png"))
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
      .slice(0, GALLERY_LIMIT)
      .map((b) => ({
        url: b.url,
        uploadedAt: b.uploadedAt,
      }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("gallery list failed", error);
    return NextResponse.json({ items: [] });
  }
}
