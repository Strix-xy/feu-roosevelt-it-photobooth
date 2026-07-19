import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Keep photostrips this long so guests can still scan/download. */
const DEFAULT_RETENTION_HOURS = 48;
const LIST_PAGE_SIZE = 1000;
const DELETE_BATCH_SIZE = 100;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

function retentionHours(): number {
  const raw = process.env.BLOB_RETENTION_HOURS;
  const hours = raw ? Number(raw) : DEFAULT_RETENTION_HOURS;
  return Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_RETENTION_HOURS;
}

function retentionCutoffMs(hours: number): number {
  return Date.now() - hours * 60 * 60 * 1000;
}

/**
 * Deletes photobooth blobs older than BLOB_RETENTION_HOURS (default 48).
 * Invoked daily by Vercel Cron (Hobby allows once per day).
 */
export async function GET(request: Request): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not set" },
      { status: 500 }
    );
  }

  const hours = retentionHours();
  const cutoff = retentionCutoffMs(hours);
  let scanned = 0;
  let deleted = 0;
  let cursor: string | undefined;

  try {
    do {
      const page = await list({
        prefix: "photobooth/",
        limit: LIST_PAGE_SIZE,
        cursor,
      });

      scanned += page.blobs.length;

      const expired = page.blobs.filter(
        (blob) => new Date(blob.uploadedAt).getTime() < cutoff
      );

      for (let i = 0; i < expired.length; i += DELETE_BATCH_SIZE) {
        const batch = expired.slice(i, i + DELETE_BATCH_SIZE);
        await del(batch.map((b) => b.url));
        deleted += batch.length;
      }

      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    return NextResponse.json({
      ok: true,
      scanned,
      deleted,
      retentionHours: hours,
      cutoff: new Date(cutoff).toISOString(),
    });
  } catch (error) {
    console.error("blob cleanup failed", error);
    return NextResponse.json(
      {
        error: (error as Error).message || "Cleanup failed",
        scanned,
        deleted,
      },
      { status: 500 }
    );
  }
}
