import { NextResponse } from "next/server";
import { readState, toggleFavorite } from "@/lib/store";

export async function GET() {
  const state = await readState();
  return NextResponse.json({ favorites: state.favorites });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { videoId?: string };
  if (!body.videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }
  const favorites = await toggleFavorite(body.videoId);
  return NextResponse.json({ favorites });
}
