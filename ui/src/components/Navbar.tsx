import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-black text-zinc-950">
          Meat Lovers
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="#menu"
            className="text-sm font-semibold text-zinc-700 hover:text-red-800"
          >
            Menu
          </Link>
          <Link
            href="#catering"
            className="text-sm font-semibold text-zinc-700 hover:text-red-800"
          >
            Catering
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center justify-center rounded-md bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </nav>
  );
}
