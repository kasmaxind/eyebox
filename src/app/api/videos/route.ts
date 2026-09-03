import { NextResponse } from "next/server";
import { catalog, genres } from "@/lib/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const featured = searchParams.get("featured");
  let videos = [...catalog];
  if (genre) {
    videos = videos.filter(
      (v) => v.genre.toLowerCase() === genre.toLowerCase()
    );
  }
  if (featured === "1") {
    videos = videos.filter((v) => v.featured);
  }
  return NextResponse.json({ videos, genres });
}
