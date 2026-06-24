import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 px-4 py-10 text-zinc-300 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xl font-black text-white">Meat Lovers</p>
          <p className="mt-2 text-sm">Restaurant operations powered by YohPal.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="#menu" className="hover:text-white">Menu</Link>
          <Link href="#catering" className="hover:text-white">Catering</Link>
          <Link href="#about" className="hover:text-white">About</Link>
          <Link href="#contact" className="hover:text-white">Contact</Link>
          <Link href="/admin" className="hover:text-white">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
