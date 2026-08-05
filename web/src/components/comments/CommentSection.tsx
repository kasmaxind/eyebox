"use client";

import { FormEvent, useMemo, useState } from "react";
import { getCommentsForVideo } from "@/data/content";
import { formatRelativeTime, formatViews } from "@/lib/format";
import { IconLike, IconSparkles } from "@/components/ui/Icons";

export function CommentSection({ videoId }: { videoId: string }) {
  const seed = getCommentsForVideo(videoId);
  const [sort, setSort] = useState<"top" | "newest">("top");
  const [text, setText] = useState("");
  const [items, setItems] = useState(seed);
  const [showAi, setShowAi] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const sorted = useMemo(() => {
    const copy = [...items];
    if (sort === "top") copy.sort((a, b) => b.likes - a.likes);
    else copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return copy;
  }, [items, sort]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setItems((prev) => [
      {
        id: `local-${Date.now()}`,
        videoId,
        author: "You",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&sat=-100",
        text: value,
        likes: 0,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setText("");
  }

  function submitReply(parentId: string) {
    const value = replyText.trim();
    if (!value) return;
    setItems((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? {
              ...c,
              replies: [
                ...(c.replies ?? []),
                {
                  id: `reply-${Date.now()}`,
                  videoId,
                  author: "You",
                  avatar:
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&sat=-100",
                  text: value,
                  likes: 0,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : c,
      ),
    );
    setReplyText("");
    setReplyTo(null);
  }

  return (
    <section className="mt-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
          {items.length} Comments
        </h2>
        <div className="flex rounded-full bg-bg-chip p-1 text-sm">
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 ${sort === "top" ? "bg-bg-hover font-semibold" : "text-text-muted"}`}
            onClick={() => setSort("top")}
          >
            Top
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 ${sort === "newest" ? "bg-bg-hover font-semibold" : "text-text-muted"}`}
            onClick={() => setSort("newest")}
          >
            Newest
          </button>
        </div>
        <button type="button" className="pill-btn ml-auto text-sm" onClick={() => setShowAi((v) => !v)}>
          <IconSparkles size={16} />
          AI summary
        </button>
      </div>

      {showAi && (
        <div className="mb-4 slide-up rounded-2xl border border-border bg-bg-elevated p-4 text-sm text-text-muted">
          <p className="mb-1 font-semibold text-text">What viewers are saying</p>
          People highlight the practical structure, chapter navigation, and concrete checklists. Common request:
          deeper follow-ups on evaluation and deployment tradeoffs.
        </div>
      )}

      <form onSubmit={onSubmit} className="mb-6 flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-orange-400 text-sm font-bold text-white">
          E
        </div>
        <div className="flex-1">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-accent"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className="pill-btn" onClick={() => setText("")}>
              Cancel
            </button>
            <button type="submit" className="pill-btn" data-variant="accent" disabled={!text.trim()}>
              Comment
            </button>
          </div>
        </div>
      </form>

      <ul className="space-y-5">
        {sorted.map((c) => {
          const liked = likedComments.has(c.id);
          return (
            <li key={c.id} className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold">@{c.author.replace(/\s+/g, "").toLowerCase()}</span>{" "}
                  <span className="text-text-dim">{formatRelativeTime(c.createdAt)}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed">{c.text}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 hover:text-text ${liked ? "text-accent" : ""}`}
                    onClick={() =>
                      setLikedComments((prev) => {
                        const next = new Set(prev);
                        if (next.has(c.id)) next.delete(c.id);
                        else next.add(c.id);
                        return next;
                      })
                    }
                  >
                    <IconLike size={14} /> {formatViews(c.likes + (liked ? 1 : 0))}
                  </button>
                  <button
                    type="button"
                    className="hover:text-text"
                    onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                  >
                    Reply
                  </button>
                </div>
                {replyTo === c.id && (
                  <form
                    className="mt-3 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitReply(c.id);
                    }}
                  >
                    <input
                      autoFocus
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Add a reply..."
                      className="h-9 flex-1 rounded-full border border-border bg-bg px-3 text-sm outline-none focus:border-accent/50"
                    />
                    <button type="submit" className="pill-btn text-xs" data-variant="accent" disabled={!replyText.trim()}>
                      Reply
                    </button>
                  </form>
                )}
                {c.replies?.map((r) => (
                  <div key={r.id} className="mt-3 flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold">@{r.author.replace(/\s+/g, "").toLowerCase()}</span>{" "}
                        <span className="text-text-dim">{formatRelativeTime(r.createdAt)}</span>
                      </p>
                      <p className="mt-1 text-sm">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </li>
          );
        })}
        {sorted.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-text-muted">
            Be the first to comment.
          </li>
        )}
      </ul>
    </section>
  );
}
