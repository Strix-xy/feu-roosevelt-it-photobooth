import { list } from "@vercel/blob";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShareDownload from "./ShareDownload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveStripUrl(id: string): Promise<string | null> {
  const pathname = `photobooth/${id}.png`;
  const { blobs } = await list({ prefix: pathname, limit: 5 });
  const match = blobs.find((b) => b.pathname === pathname) ?? blobs[0];
  return match?.url ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Your photostrip — FEU Roosevelt IT",
    description: "Download your FEU Roosevelt IT photobooth strip.",
    robots: { index: false, follow: false },
    other: { "session-id": id },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params;

  if (!UUID_RE.test(id)) notFound();

  let url: string | null = null;
  try {
    url = await resolveStripUrl(id);
  } catch (err) {
    console.error("share lookup failed", err);
  }

  if (!url) notFound();

  return <ShareDownload imageUrl={url} />;
}
