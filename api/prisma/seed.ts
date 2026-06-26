import { PrismaClient, PageType, LeadSource, LeadStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // ─── seed_homepage_content ───────────────────────────────────────────────
  const contentPages = [
    {
      slug: 'home',
      title: 'Homepage',
      page_type: PageType.HOMEPAGE,
      is_published: true,
      meta_title: 'Meat Lovers — Restaurant, Bar & Catering in Nairobi',
      meta_description:
        'Flame-grilled meals, cold drinks, and catering services. Dine-in, takeaway, and delivery in Nairobi.',
      content: JSON.stringify({
        hero_title: 'Meat Lovers',
        hero_subtitle:
          'Flame-grilled meals, cold drinks, fast table service, and catering support for gatherings that deserve serious food.',
        hero_cta_primary: 'View Menu Highlights',
        hero_cta_secondary: 'Contact Us',
        about_title: 'Built for guests who care about flavour, speed and consistency',
        about_description:
          'Meat Lovers brings together grilled meals, bar service, table ordering, and delivery support in one restaurant experience.',
      }),
    },
    {
      slug: 'about',
      title: 'About Us',
      page_type: PageType.ABOUT,
      is_published: true,
      meta_title: 'About Meat Lovers — Our Story',
      meta_description:
        'Learn about Meat Lovers restaurant, our kitchen quality, service focus, and commitment to great food.',
      content: JSON.stringify({
        title: 'About Meat Lovers',
        description:
          'Meat Lovers brings together grilled meals, bar service, table ordering, and delivery in one restaurant experience.',
        kitchen_quality:
          'Meals are prepared around clear recipes, fresh stock, and controlled production.',
        service_focus:
          'Dine-in, takeaway, catering, and delivery requests are handled with one coordinated team.',
      }),
    },
    {
      slug: 'menu',
      title: 'Menu',
      page_type: PageType.MENU,
      is_published: true,
      meta_title: 'Meat Lovers Menu — Food, Drinks & Platters',
      meta_description:
        'Explore our menu featuring flame-grilled food, refreshing drinks, and shareable platters.',
      content: JSON.stringify({
        title: 'Our Menu',
        description: 'Food, soft drinks, alcoholic drinks, platters and specials',
        categories: ['Food', 'Soft Drinks', 'Alcoholic Drinks', 'Platters'],
      }),
    },
    {
      slug: 'contact',
      title: 'Contact Us',
      page_type: PageType.CONTACT,
      is_published: true,
      meta_title: 'Contact Meat Lovers — Orders, Catering & Reservations',
      meta_description:
        'Get in touch for orders, catering enquiries, reservations, and delivery in Nairobi.',
      content: JSON.stringify({
        title: 'Contact Us',
        description: 'Ask about orders, catering, reservations or delivery',
        phone: '+254 700 000 000',
        email: 'orders@meatlovers.local',
        location: 'Meat Lovers restaurant, Nairobi',
      }),
    },
  ];

  // ─── seed_menu_highlights ────────────────────────────────────────────────
  const menuHighlightPages = [
    {
      slug: 'homepage-food-highlights',
      title: 'Homepage — Food Highlights',
      page_type: PageType.HOMEPAGE,
      is_published: true,
      meta_title: null,
      meta_description: null,
      content: JSON.stringify({
        section: 'menu_highlights',
        category: 'FOOD',
        items: [
          {
            name: 'Flame-Grilled Platters',
            description:
              'Shareable cuts, house sauces, sides, and table-ready service for groups.',
            price: 'From KSh 1,850',
          },
          {
            name: 'Signature Burgers',
            description:
              'Stacked patties, fresh buns, crisp toppings, and bold Meat Lovers seasoning.',
            price: 'From KSh 950',
          },
          {
            name: 'Grilled Ribs',
            description: 'Slow-cooked baby back ribs with signature dry rub and house BBQ sauce.',
            price: 'From KSh 1,200',
          },
        ],
      }),
    },
    {
      slug: 'homepage-drinks-highlights',
      title: 'Homepage — Drinks Highlights',
      page_type: PageType.HOMEPAGE,
      is_published: true,
      meta_title: null,
      meta_description: null,
      content: JSON.stringify({
        section: 'menu_highlights',
        category: 'DRINKS',
        items: [
          {
            name: 'Fresh Coolers',
            description: 'Juices, mocktails, sodas, and refreshing non-alcoholic pairings.',
            price: 'From KSh 250',
          },
          {
            name: 'Bar Pairings',
            description: 'Beer, wine, and classic pours curated for grilled meals and late service.',
            price: 'Ask at the bar',
          },
        ],
      }),
    },
  ];

  for (const page of [...contentPages, ...menuHighlightPages]) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
        is_published: page.is_published,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
      },
      create: page,
    });
    console.log(`  ✓ content_page: ${page.slug}`);
  }

  // ─── seed_default_lead_sources (demo WebsiteLeads) ───────────────────────
  // Check if any leads already exist before seeding demos
  const existingLeads = await prisma.websiteLead.count();
  if (existingLeads === 0) {
    const demoLeads: Array<{
      name: string;
      email: string;
      phone: string;
      source: LeadSource;
      status: LeadStatus;
      enquiry_type: string;
      message: string;
      event_date?: Date;
      guest_count?: number;
    }> = [
      {
        name: 'John Kamau',
        email: 'john.kamau@example.com',
        phone: '+254711000001',
        source: LeadSource.LANDING_PAGE,
        status: LeadStatus.NEW,
        enquiry_type: 'General enquiry',
        message: 'I would like to know more about your menu and opening hours.',
      },
      {
        name: 'Grace Wanjiku',
        email: 'grace.wanjiku@example.com',
        phone: '+254722000002',
        source: LeadSource.CATERING_ENQUIRY,
        status: LeadStatus.CONTACTED,
        enquiry_type: 'Catering',
        message: 'Need catering for a corporate team lunch of 40 people.',
        event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        guest_count: 40,
      },
      {
        name: 'Peter Omondi',
        email: 'peter.omondi@example.com',
        phone: '+254733000003',
        source: LeadSource.EVENT_BOOKING,
        status: LeadStatus.QUALIFIED,
        enquiry_type: 'Reservation',
        message: 'Birthday dinner for 15 guests, need a private section.',
        event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        guest_count: 15,
      },
      {
        name: 'Sarah Njeri',
        email: 'sarah.njeri@example.com',
        phone: '+254744000004',
        source: LeadSource.REFERRAL,
        status: LeadStatus.CONVERTED,
        enquiry_type: 'Catering',
        message: 'Referred by a colleague. Booked a platter package for a weekend event.',
        event_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        guest_count: 25,
      },
      {
        name: 'David Mwangi',
        email: 'david.mwangi@example.com',
        phone: '+254755000005',
        source: LeadSource.SOCIAL_MEDIA,
        status: LeadStatus.NEW,
        enquiry_type: 'Delivery',
        message: 'Saw your post on Instagram. Do you deliver to Westlands?',
      },
    ];

    for (const lead of demoLeads) {
      await prisma.websiteLead.create({ data: lead });
      console.log(`  ✓ website_lead: ${lead.name} (${lead.source})`);
    }
  } else {
    console.log(`  ↳ Skipping demo leads — ${existingLeads} already exist`);
  }

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
