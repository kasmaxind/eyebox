import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (!q) {
    return NextResponse.json({ videos: [], query: q });
  }
  const videos = catalog.filter((v) => {
    const hay = `${v.title} ${v.artist} ${v.genre} ${v.tags.join(" ")} ${v.description}`.toLowerCase();
    return hay.includes(q);
  });
  return NextResponse.json({ videos, query: q });
}
