"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { VideoCard } from "@/components/feed/VideoCard";
import { getChannelByHandle } from "@/data/channels";
import { getCommunityPosts, playlists } from "@/data/content";
import { getVideosByChannel, shorts } from "@/data/videos";
import { formatRelativeTime, formatViews } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { IconCheck, IconLike, IconVerified } from "@/components/ui/Icons";

const tabs = ["Home", "Videos", "Shorts", "Live", "Playlists", "Community", "About"] as const;

export default function ChannelPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const channel = getChannelByHandle(handle);
  const { subscribed, toggleSubscribe } = useAppStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Home");

  const channelVideos = useMemo(
    () => (channel ? getVideosByChannel(channel.id) : []),
    [channel],
  );
  const channelShorts = useMemo(
    () => (channel ? shorts.filter((s) => s.channelId === channel.id) : []),
    [channel],
  );
  const live = channelVideos.filter((v) => v.isLive);
  const posts = useMemo(
    () => (channel ? getCommunityPosts(channel.id) : []),
    [channel],
  );
  const channelPlaylists = playlists.filter((p) =>
    p.videoIds.some((id) => channelVideos.some((v) => v.id === id) || channelShorts.some((s) => s.id === id)),
  );

  if (!channel) {
    return (
      <div className="px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Channel not found</h1>
        <Link href="/" className="mt-4 inline-block text-accent">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-36 overflow-hidden md:h-52">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={channel.banner} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
      </div>

      <div className="px-3 md:px-6">
        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={channel.avatar}
              alt=""
              className="h-24 w-24 rounded-full border-4 border-bg object-cover md:h-28 md:w-28"
            />
            <div className="pb-1">
              <h1 className="flex items-center gap-2 font-[family-name:var(--font-outfit)] text-2xl font-semibold md:text-3xl">
                {channel.name}
                {channel.verified && <IconVerified size={18} />}
              </h1>
              <p className="text-sm text-text-muted">
                @{channel.handle} · {formatViews(channel.subscribers)} subscribers · {channel.videoCount} videos
              </p>
            </div>
          </div>
          <button
            type="button"
            className="pill-btn self-start"
            data-variant={subscribed.has(channel.id) ? undefined : "invert"}
            onClick={() => toggleSubscribe(channel.id)}
          >
            {subscribed.has(channel.id) ? (
              <>
                <IconCheck size={16} /> Subscribed
              </>
            ) : (
              "Subscribe"
            )}
          </button>
        </div>

        <p className="mt-4 max-w-3xl text-sm text-text-muted">{channel.description}</p>

        <div className="mt-5 flex gap-1 overflow-x-auto border-b border-border">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === t ? "border-text text-text" : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === "About" && (
            <div className="max-w-2xl space-y-2 text-sm text-text-muted">
              <p>{channel.description}</p>
              <p>
                {formatViews(channel.subscribers)} subscribers · {channel.videoCount} videos
              </p>
            </div>
          )}
          {tab === "Shorts" && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {channelShorts.map((s) => (
                <VideoCard key={s.id} video={s} dense />
              ))}
              {channelShorts.length === 0 && <p className="text-text-muted">No Shorts yet.</p>}
            </div>
          )}
          {tab === "Live" && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {live.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
              {live.length === 0 && <p className="text-text-muted">No live streams right now.</p>}
            </div>
          )}
          {tab === "Playlists" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {channelPlaylists.map((p) => (
                <Link
                  key={p.id}
                  href={`/playlist/${p.id}`}
                  className="rounded-2xl border border-border bg-bg-elevated p-4 hover:bg-bg-hover"
                >
                  <p className="font-semibold">{p.title}</p>
                  <p className="mt-1 text-sm text-text-muted">
                    {p.videoIds.length} videos · {p.visibility}
                  </p>
                </Link>
              ))}
              {channelPlaylists.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-text-muted sm:col-span-2">
                  Channel playlists appear here when the creator publishes them.
                </div>
              )}
            </div>
          )}
          {tab === "Community" && (
            <div className="mx-auto max-w-2xl space-y-4">
              {posts.map((p) => (
                <article key={p.id} className="rounded-2xl border border-border bg-bg-elevated p-4">
                  <div className="mb-3 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={channel.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold">{channel.name}</p>
                      <p className="text-xs text-text-dim">{formatRelativeTime(p.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{p.text}</p>
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="mt-3 w-full rounded-xl object-cover" />
                  )}
                  <div className="mt-3 flex gap-4 text-sm text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <IconLike size={14} /> {formatViews(p.likes)}
                    </span>
                    <span>{formatViews(p.comments)} comments</span>
                  </div>
                </article>
              ))}
              {posts.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-text-muted">
                  No community posts yet.
                </p>
              )}
            </div>
          )}
          {(tab === "Home" || tab === "Videos") && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {channelVideos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
