import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";
import { markWatched } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const video = catalog.find((v) => v.id === id);
  if (!video) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const related = catalog
    .filter(
      (v) =>
        v.id !== video.id &&
        (v.genre === video.genre ||
          v.tags.some((t) => video.tags.includes(t)))
    )
    .slice(0, 4);
  return NextResponse.json({ video, related });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const video = catalog.find((v) => v.id === id);
  if (!video) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await markWatched(id);
  return NextResponse.json({ ok: true });
}
