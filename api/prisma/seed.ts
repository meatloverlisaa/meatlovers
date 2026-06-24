import { PrismaClient } from '@prisma/client';
import { PageType, LeadSource } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Seed homepage content
  const homepage = await prisma.contentPage.upsert({
    where: { slug: 'home' },
    update: {},
    create: {
      title: 'Homepage',
      slug: 'home',
      page_type: PageType.HOMEPAGE,
      content: JSON.stringify({
        hero_title: 'Meat Lovers',
        hero_subtitle: 'Flame-grilled meals, cold drinks, fast table service, and catering support for gatherings that deserve serious food.',
        hero_cta_primary: 'View Menu Highlights',
        hero_cta_secondary: 'Contact Us',
        about_title: 'Built for guests who care about flavour, speed and consistency',
        about_description: 'Meat Lovers brings together grilled meals, bar service, table ordering, and delivery support in one restaurant experience.',
      }),
      is_published: true,
      meta_title: 'Meat Lovers - Restaurant, Bar & Catering in Nairobi',
      meta_description: 'Flame-grilled meals, cold drinks, and catering services. Visit Meat Lovers for dine-in, takeaway, and delivery in Nairobi.',
    },
  });

  console.log('Created homepage:', homepage);

  // Seed about page
  const aboutPage = await prisma.contentPage.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      title: 'About Us',
      slug: 'about',
      page_type: PageType.ABOUT,
      content: JSON.stringify({
        title: 'About Meat Lovers',
        description: 'Meat Lovers brings together grilled meals, bar service, table ordering, and delivery support in one restaurant experience. The team focuses on reliable preparation, clear service flow, and food that arrives hot, generous, and ready to share.',
        kitchen_quality: 'Meals are prepared around clear recipes, fresh stock, and controlled production.',
        service_focus: 'Dine-in, takeaway, catering, and delivery requests are handled with one coordinated team.',
      }),
      is_published: true,
      meta_title: 'About Meat Lovers - Our Story',
      meta_description: 'Learn about Meat Lovers restaurant, our kitchen quality, service focus, and commitment to great food.',
    },
  });

  console.log('Created about page:', aboutPage);

  // Seed menu page
  const menuPage = await prisma.contentPage.upsert({
    where: { slug: 'menu' },
    update: {},
    create: {
      title: 'Menu',
      slug: 'menu',
      page_type: PageType.MENU,
      content: JSON.stringify({
        title: 'Our Menu',
        description: 'Food, soft drinks, alcoholic drinks, platters and specials',
        categories: ['Food', 'Soft Drinks', 'Alcoholic Drinks', 'Platters'],
      }),
      is_published: true,
      meta_title: 'Meat Lovers Menu - Food, Drinks & Platters',
      meta_description: 'Explore our menu featuring flame-grilled food, refreshing drinks, and shareable platters.',
    },
  });

  console.log('Created menu page:', menuPage);

  // Seed contact page
  const contactPage = await prisma.contentPage.upsert({
    where: { slug: 'contact' },
    update: {},
    create: {
      title: 'Contact Us',
      slug: 'contact',
      page_type: PageType.CONTACT,
      content: JSON.stringify({
        title: 'Contact Us',
        description: 'Ask about orders, catering, reservations or delivery',
        phone: '+254 700 000 000',
        email: 'orders@meatlovers.local',
        location: 'Meat Lovers restaurant, Nairobi',
      }),
      is_published: true,
      meta_title: 'Contact Meat Lovers - Orders, Catering & Reservations',
      meta_description: 'Get in touch with Meat Lovers for orders, catering enquiries, reservations, and delivery in Nairobi.',
    },
  });

  console.log('Created contact page:', contactPage);

  // Seed sample leads for testing analytics
  const sampleLeads = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+254711111111',
      source: LeadSource.LANDING_PAGE,
      status: 'NEW' as const,
      enquiry_type: 'General enquiry',
      message: 'I would like to know more about your services.',
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+254722222222',
      source: LeadSource.CATERING_ENQUIRY,
      status: 'CONTACTED' as const,
      enquiry_type: 'Catering',
      message: 'Need catering for 50 people next weekend.',
      event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      guest_count: 50,
    },
    {
      name: 'Michael Johnson',
      email: 'michael@example.com',
      phone: '+254733333333',
      source: LeadSource.EVENT_BOOKING,
      status: 'QUALIFIED' as const,
      enquiry_type: 'Reservation',
      message: 'Birthday party reservation for 20 people.',
      event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      guest_count: 20,
    },
    {
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      phone: '+254744444444',
      source: LeadSource.REFERRAL,
      status: 'CONVERTED' as const,
      enquiry_type: 'Catering',
      message: 'Referred by a friend, booked corporate lunch.',
      event_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      guest_count: 30,
    },
    {
      name: 'David Brown',
      email: 'david@example.com',
      phone: '+254755555555',
      source: LeadSource.LANDING_PAGE,
      status: 'LOST' as const,
      enquiry_type: 'General enquiry',
      message: 'Was interested but chose another venue.',
    },
  ];

  for (const lead of sampleLeads) {
    await prisma.websiteLead.upsert({
      where: { id: BigInt(0) },
      update: {},
      create: lead,
    });
  }

  console.log('Created sample leads');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
