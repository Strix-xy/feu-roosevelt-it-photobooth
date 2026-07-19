import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Token exchange for client-side Blob uploads.
 * Each photostrip is uploaded directly from the browser to Vercel Blob
 * (avoids the ~4.5MB serverless body limit) with a unique pathname.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("photobooth/") || !pathname.endsWith(".png")) {
          throw new Error("Invalid upload path");
        }

        return {
          allowedContentTypes: ["image/png"],
          addRandomSuffix: false,
          maximumSizeInBytes: 8 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        // Client already receives the blob URL from upload().
        // Callback is a no-op (also unreliable on localhost without a tunnel).
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("upload token error", error);
    return NextResponse.json(
      { error: (error as Error).message || "Upload failed" },
      { status: 400 }
    );
  }
}
