import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";
import {
  addToPlaylist,
  readState,
  removeFromPlaylist,
} from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const state = await readState();
  const playlist = state.playlists.find((p) => p.id === id);
  if (!playlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const videos = playlist.videoIds
    .map((vid) => catalog.find((v) => v.id === vid))
    .filter(Boolean);
  return NextResponse.json({ playlist, videos });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as {
    videoId?: string;
    action?: "add" | "remove";
  };
  if (!body.videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }
  const action = body.action ?? "add";
  const playlist =
    action === "remove"
      ? await removeFromPlaylist(id, body.videoId)
      : await addToPlaylist(id, body.videoId);
  if (!playlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ playlist });
}
