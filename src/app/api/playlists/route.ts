import { NextResponse } from "next/server";
import {
  createPlaylist,
  deletePlaylist,
  readState,
  updatePlaylist,
} from "@/lib/store";

export async function GET() {
  const state = await readState();
  return NextResponse.json({
    playlists: state.playlists,
    recentlyWatched: state.recentlyWatched,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    description?: string;
  };
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const playlist = await createPlaylist(body.name, body.description ?? "");
  return NextResponse.json({ playlist }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    id?: string;
    name?: string;
    description?: string;
    videoIds?: string[];
  };
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const playlist = await updatePlaylist(body.id, {
    name: body.name,
    description: body.description,
    videoIds: body.videoIds,
  });
  if (!playlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ playlist });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const ok = await deletePlaylist(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
