"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/library", label: "Library" },
  { href: "/playlists", label: "Playlists" },
];

export function Nav() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`site-nav ${scrolled ? "site-nav--solid" : ""}`}
    >
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label="Eyebox home">
          <span className="brand-mark" aria-hidden />
          <span className="brand-word">Eyebox</span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "nav-link is-active" : "nav-link"}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <form
          className="nav-search"
          action="/search"
          onSubmit={(e) => {
            if (!query.trim()) e.preventDefault();
          }}
        >
          <label className="sr-only" htmlFor="nav-q">
            Search music videos
          </label>
          <input
            id="nav-q"
            name="q"
            type="search"
            placeholder="Search artists, tracks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
}
