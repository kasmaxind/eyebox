import Link from "next/link";

export default function NotFound() {
  return (
    <header className="page-head">
      <h1>Not found</h1>
      <p>That music video isn’t in the Eyebox catalog.</p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/browse" className="btn btn-primary">
          Back to browse
        </Link>
      </p>
    </header>
  );
}
