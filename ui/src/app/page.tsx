import Link from "next/link";
import Image from "next/image";

const menuHighlights = [
  {
    name: "Flame-Grilled Platters",
    category: "Food",
    description: "Shareable cuts, house sauces, sides, and table-ready service for groups.",
    price: "From KSh 1,850",
  },
  {
    name: "Signature Burgers",
    category: "Food",
    description: "Stacked patties, fresh buns, crisp toppings, and bold Meat Lovers seasoning.",
    price: "From KSh 950",
  },
  {
    name: "Fresh Coolers",
    category: "Soft drinks",
    description: "Juices, mocktails, sodas, and refreshing non-alcoholic pairings.",
    price: "From KSh 250",
  },
  {
    name: "Bar Pairings",
    category: "Alcoholic drinks",
    description: "Beer, wine, and classic pours curated for grilled meals and late service.",
    price: "Ask at the bar",
  },
];

const serviceStats = [
  { label: "Menu categories", value: "3" },
  { label: "Service channels", value: "Dine-in, takeaway, delivery" },
  { label: "Operations", value: "Kitchen, bar, POS, dispatch" },
];

export default function Home() {
  return (
    <main className="bg-stone-50 text-zinc-950">
      <section
        id="home"
        className="relative isolate flex min-h-[82svh] items-center overflow-hidden"
      >
        <Image
          src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2200&q=85"
          alt="Grilled meat platter served at a restaurant table"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/58 to-zinc-950/20" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-red-200">
              Restaurant, bar and catering
            </p>
            <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
              Meat Lovers
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-100 sm:text-xl">
              Flame-grilled meals, cold drinks, fast table service, and catering
              support for gatherings that deserve serious food.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#menu"
                className="inline-flex items-center justify-center rounded-md bg-red-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-800"
              >
                View Menu Highlights
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center justify-center rounded-md border border-white/60 px-6 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-zinc-950"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-0 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {serviceStats.map((item) => (
            <div
              key={item.label}
              className="border-zinc-200 py-6 sm:border-l sm:px-8 first:sm:border-l-0"
            >
              <p className="text-sm font-semibold uppercase text-red-800">
                {item.label}
              </p>
              <p className="mt-2 text-xl font-bold text-zinc-950">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-red-800">
              Menu highlights
            </p>
            <h2 className="mt-3 text-3xl font-black text-zinc-950 sm:text-4xl">
              Food, soft drinks, alcoholic drinks, platters and specials
            </h2>
          </div>
          <Link
            href="#contact"
            className="inline-flex w-fit items-center justify-center rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-bold text-zinc-950 transition hover:border-red-700 hover:text-red-800"
          >
            Ask About Today&apos;s Specials
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {menuHighlights.map((item) => (
            <article
              key={item.name}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-bold uppercase text-emerald-700">
                {item.category}
              </p>
              <h3 className="mt-3 text-xl font-black text-zinc-950">
                {item.name}
              </h3>
              <p className="mt-3 min-h-20 text-sm leading-6 text-zinc-600">
                {item.description}
              </p>
              <p className="mt-5 text-sm font-bold text-red-800">{item.price}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="catering" className="bg-zinc-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.82fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-red-200">
              Catering and events
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Big meals for groups, meetings, parties and weekend plans
            </h2>
            <p className="mt-5 max-w-2xl leading-8 text-zinc-300">
              Send the team your event date, guest count, delivery location, and
              preferred menu direction. Meat Lovers can prepare platters, drinks,
              sides, and service packages around your occasion.
            </p>
          </div>
          <div className="rounded-lg border border-white/12 bg-white/7 p-6">
            <h3 className="text-xl font-black">Catering enquiry checklist</h3>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-zinc-200">
              <li>Guest count and event date</li>
              <li>Food, drink, and platter preferences</li>
              <li>Pickup, delivery, or on-site service needs</li>
              <li>Budget range and preferred contact method</li>
            </ul>
            <Link
              href="#contact"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-red-100"
            >
              Start Catering Enquiry
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1400&q=85"
              alt="Restaurant grill with prepared meat and vegetables"
              fill
              unoptimized
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase text-red-800">
              About Meat Lovers
            </p>
            <h2 className="mt-3 text-3xl font-black text-zinc-950 sm:text-4xl">
              Built for guests who care about flavour, speed and consistency
            </h2>
            <p className="mt-5 leading-8 text-zinc-700">
              Meat Lovers brings together grilled meals, bar service, table
              ordering, and delivery support in one restaurant experience. The
              team focuses on reliable preparation, clear service flow, and food
              that arrives hot, generous, and ready to share.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="border-l-4 border-red-700 bg-white p-5 shadow-sm">
                <h3 className="font-black">Kitchen quality</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Meals are prepared around clear recipes, fresh stock, and
                  controlled production.
                </p>
              </div>
              <div className="border-l-4 border-emerald-700 bg-white p-5 shadow-sm">
                <h3 className="font-black">Service focus</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Dine-in, takeaway, catering, and delivery requests are handled
                  with one coordinated team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-zinc-200 bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-red-800">
              Contact
            </p>
            <h2 className="mt-3 text-3xl font-black text-zinc-950 sm:text-4xl">
              Ask about orders, catering, reservations or delivery
            </h2>
            <div className="mt-8 space-y-4 text-zinc-700">
              <p>
                Phone: <a className="font-bold text-zinc-950" href="tel:+254700000000">+254 700 000 000</a>
              </p>
              <p>
                Email: <a className="font-bold text-zinc-950" href="mailto:orders@meatlovers.local">orders@meatlovers.local</a>
              </p>
              <p>Location: Meat Lovers restaurant, Nairobi</p>
            </div>
            <div className="mt-8 aspect-[16/10] overflow-hidden rounded-lg border border-zinc-200 bg-stone-100">
              <iframe
                title="Meat Lovers map"
                src="https://www.google.com/maps?q=Nairobi%2C%20Kenya&output=embed"
                className="h-full w-full"
                loading="lazy"
              />
            </div>
          </div>

          <form className="rounded-lg border border-zinc-200 bg-stone-50 p-6 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-zinc-800">
                Name
                <input
                  name="name"
                  type="text"
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-red-700"
                  placeholder="Your full name"
                />
              </label>
              <label className="text-sm font-semibold text-zinc-800">
                Phone
                <input
                  name="phone"
                  type="tel"
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-red-700"
                  placeholder="+254..."
                />
              </label>
            </div>
            <label className="mt-5 block text-sm font-semibold text-zinc-800">
              Enquiry type
              <select
                name="enquiryType"
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-red-700"
                defaultValue="Catering"
              >
                <option>Catering</option>
                <option>Reservation</option>
                <option>Delivery</option>
                <option>General enquiry</option>
              </select>
            </label>
            <label className="mt-5 block text-sm font-semibold text-zinc-800">
              Message
              <textarea
                name="message"
                rows={6}
                className="mt-2 w-full resize-none rounded-md border border-zinc-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-red-700"
                placeholder="Tell us what you need..."
              />
            </label>
            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800"
            >
              Send Enquiry
            </button>
          </form>
        </div>
      </section>

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
    </main>
  );
}
