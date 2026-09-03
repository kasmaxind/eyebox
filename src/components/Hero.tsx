"use client";

import Link from "next/link";
import type { Video } from "@/lib/types";

export function Hero({ video }: { video: Video }) {
  return (
    <section className="hero" aria-label="Featured music video">
      <div className="hero-media" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={video.posterUrl} alt="" />
        <div className="hero-veil" />
      </div>

      <div className="hero-content">
        <p className="hero-brand">Eyebox</p>
        <h1 className="hero-title">{video.title}</h1>
        <p className="hero-sub">
          {video.artist} — {video.description}
        </p>
        <div className="hero-cta">
          <Link href={`/watch/${video.id}`} className="btn btn-primary">
            Play video
          </Link>
          <Link href="/browse" className="btn btn-ghost">
            Browse catalog
          </Link>
        </div>
      </div>
    </section>
  );
}
