import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-white">
      <span className="font-display text-6xl">404</span>
      <p className="mt-4 max-w-md text-white/70">
        The page you&apos;re looking for doesn&apos;t exist or hasn&apos;t been published yet.
      </p>
      <Link
        href="/"
        className="mt-8 rounded bg-cyan px-6 py-3 font-medium text-ink hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}
