import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <p className="text-xs uppercase tracking-[0.3em] text-gold-muted">404</p>
      <h1
        className="text-5xl font-light text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Page not found
      </h1>
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-gold transition-colors mt-2"
      >
        Return home
      </Link>
    </main>
  );
}
