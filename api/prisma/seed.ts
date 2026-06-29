import { PrismaClient, PageType, LeadSource, LeadStatus, ProductCategory, PricingRuleType } from '@prisma/client';

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

  // ─── seed_default_product_categories ───────────────────────────────────────
  // Check if any products already exist before seeding
  const existingProducts = await prisma.product.count();
  if (existingProducts === 0) {
    const sampleProducts = [
      // FOOD items
      {
        product_name: 'Flame-Grilled Beef Platter',
        product_category: ProductCategory.FOOD,
        selling_price: '1850.00',
        cost_price: '950.00',
        barcode: 'FOOD001',
        is_active: true,
      },
      {
        product_name: 'Signature Beef Burger',
        product_category: ProductCategory.FOOD,
        selling_price: '950.00',
        cost_price: '450.00',
        barcode: 'FOOD002',
        is_active: true,
      },
      {
        product_name: 'Grilled Baby Back Ribs',
        product_category: ProductCategory.FOOD,
        selling_price: '1200.00',
        cost_price: '600.00',
        barcode: 'FOOD003',
        is_active: true,
      },
      {
        product_name: 'Chicken Wings Platter',
        product_category: ProductCategory.FOOD,
        selling_price: '950.00',
        cost_price: '400.00',
        barcode: 'FOOD004',
        is_active: true,
      },
      // SOFT_DRINK items
      {
        product_name: 'Fresh Orange Juice',
        product_category: ProductCategory.SOFT_DRINK,
        selling_price: '250.00',
        cost_price: '80.00',
        barcode: 'DRINK001',
        is_active: true,
      },
      {
        product_name: 'Soda (330ml)',
        product_category: ProductCategory.SOFT_DRINK,
        selling_price: '150.00',
        cost_price: '50.00',
        barcode: 'DRINK002',
        is_active: true,
      },
      {
        product_name: 'Sparkling Water',
        product_category: ProductCategory.SOFT_DRINK,
        selling_price: '200.00',
        cost_price: '60.00',
        barcode: 'DRINK003',
        is_active: true,
      },
      {
        product_name: 'Iced Tea',
        product_category: ProductCategory.SOFT_DRINK,
        selling_price: '220.00',
        cost_price: '70.00',
        barcode: 'DRINK004',
        is_active: true,
      },
      // ALCOHOLIC_DRINK items
      {
        product_name: 'Draft Beer (500ml)',
        product_category: ProductCategory.ALCOHOLIC_DRINK,
        selling_price: '350.00',
        cost_price: '150.00',
        barcode: 'ALC001',
        is_active: true,
      },
      {
        product_name: 'House Wine (Glass)',
        product_category: ProductCategory.ALCOHOLIC_DRINK,
        selling_price: '450.00',
        cost_price: '200.00',
        barcode: 'ALC002',
        is_active: true,
      },
      {
        product_name: 'Whiskey (Shot)',
        product_category: ProductCategory.ALCOHOLIC_DRINK,
        selling_price: '400.00',
        cost_price: '180.00',
        barcode: 'ALC003',
        is_active: true,
      },
      {
        product_name: 'Cocktail of the Day',
        product_category: ProductCategory.ALCOHOLIC_DRINK,
        selling_price: '550.00',
        cost_price: '250.00',
        barcode: 'ALC004',
        is_active: true,
      },
    ];

    for (const product of sampleProducts) {
      await prisma.product.create({ data: product });
      console.log(`  ✓ product: ${product.product_name} (${product.product_category})`);
    }
  } else {
    console.log(`  ↳ Skipping sample products — ${existingProducts} already exist`);
  }

  // ─── seed_supplier_types ──────────────────────────────────────────────────────
  // Check if any suppliers already exist before seeding
  const existingSuppliers = await prisma.supplier.count();
  if (existingSuppliers === 0) {
    const sampleSuppliers = [
      {
        supplier_name: 'Fresh Meat Wholesalers Ltd',
        contact_person: 'James Kariuki',
        phone: '+254720000001',
        email: 'james@freshmeat.co.ke',
        physical_address: 'Industrial Area, Nairobi',
        supplier_type: 'FOOD' as const,
        status: 'ACTIVE' as const,
      },
      {
        supplier_name: 'Nairobi Beverages Distributors',
        contact_person: 'Mary Wanjiru',
        phone: '+254733000002',
        email: 'sales@nairobibeverages.co.ke',
        physical_address: 'Ruaraka, Nairobi',
        supplier_type: 'SOFT_DRINKS' as const,
        status: 'ACTIVE' as const,
      },
      {
        supplier_name: 'Premium Wines & Spirits',
        contact_person: 'David Ochieng',
        phone: '+254711000003',
        email: 'david@premiumwines.co.ke',
        physical_address: 'Westlands, Nairobi',
        supplier_type: 'ALCOHOL' as const,
        status: 'ACTIVE' as const,
      },
      {
        supplier_name: 'General Supplies Kenya',
        contact_person: 'Jane Mutua',
        phone: '+254722000004',
        email: 'info@generalsupplies.co.ke',
        physical_address: 'CBD, Nairobi',
        supplier_type: 'GENERAL' as const,
        status: 'ACTIVE' as const,
      },
      {
        supplier_name: 'Organic Farms Co-op',
        contact_person: 'Peter Kimani',
        phone: '+254744000005',
        email: 'peter@organicfarms.co.ke',
        physical_address: 'Kiambu Road, Nairobi',
        supplier_type: 'FOOD' as const,
        status: 'ACTIVE' as const,
      },
    ];

    for (const supplier of sampleSuppliers) {
      await prisma.supplier.create({ data: supplier });
      console.log(`  ✓ supplier: ${supplier.supplier_name} (${supplier.supplier_type})`);
    }
  } else {
    console.log(`  ↳ Skipping sample suppliers — ${existingSuppliers} already exist`);
  }

  // ─── seed_default_margin_rules ───────────────────────────────────────────────
  // Check if any pricing rules already exist before seeding
  const existingPricingRules = await prisma.pricingRule.count();
  if (existingPricingRules === 0) {
    const marginRules = [
      {
        name: 'Food Minimum Margin Rule',
        rule_type: PricingRuleType.PERCENT_INCREASE,
        value: '50.00', // 50% markup on cost
        product_category: ProductCategory.FOOD,
        min_selling_price: '500.00',
        max_selling_price: '5000.00',
        is_active: true,
      },
      {
        name: 'Soft Drink Minimum Margin Rule',
        rule_type: PricingRuleType.PERCENT_INCREASE,
        value: '100.00', // 100% markup on cost
        product_category: ProductCategory.SOFT_DRINK,
        min_selling_price: '100.00',
        max_selling_price: '1000.00',
        is_active: true,
      },
      {
        name: 'Alcoholic Drink Minimum Margin Rule',
        rule_type: PricingRuleType.PERCENT_INCREASE,
        value: '80.00', // 80% markup on cost
        product_category: ProductCategory.ALCOHOLIC_DRINK,
        min_selling_price: '200.00',
        max_selling_price: '2000.00',
        is_active: true,
      },
      {
        name: 'Maximum Discount Rule',
        rule_type: PricingRuleType.PERCENT_DECREASE,
        value: '15.00', // Maximum 15% discount allowed
        product_category: null, // Applies to all categories
        min_selling_price: null,
        max_selling_price: null,
        is_active: true,
      },
    ];

    for (const rule of marginRules) {
      await prisma.pricingRule.create({ data: rule });
      console.log(`  ✓ pricing_rule: ${rule.name}`);
    }
  } else {
    console.log(`  ↳ Skipping margin rules — ${existingPricingRules} already exist`);
  }

  // ─── seed_dashboard_shortcuts ────────────────────────────────────────────
  // Note: Dashboard uses existing data from orders, payments, products, etc.
  // Audit logs for activity timeline will be added when that table is created

  // ─── seed_default_stock_locations ────────────────────────────────────────
  // Ensure each product has stock items in all default locations
  const existingStockItems = await prisma.stockItem.count();
  if (existingStockItems === 0) {
    const products = await prisma.product.findMany();
    const defaultLocations = ['MAIN_STORE', 'Bar', 'Kitchen', 'Dispatch', 'Functions', 'Banqueting'];

    let stockItemsCreated = 0;
    for (const product of products) {
      for (const location of defaultLocations) {
        // Create stock item with zero initial quantity
        // Quantity will be updated when purchases or transfers are recorded
        await prisma.stockItem.create({
          data: {
            product_id: product.id,
            quantity: 0,
            location,
          },
        });
        stockItemsCreated++;
      }
    }
    console.log(`  ✓ stock_items: Created ${stockItemsCreated} stock items across ${defaultLocations.length} locations`);
  } else {
    console.log(`  ↳ Skipping stock locations — ${existingStockItems} stock items already exist`);
  }

  // ─── seed_reorder_levels ─────────────────────────────────────────────────
  // Note: Reorder levels are managed through business logic
  // Default threshold: 10 units (low stock alert)
  // For bar-specific items: 5 units
  // These are defined in the application code, not in the database
  console.log('  ✓ reorder_levels: Using default thresholds (10 units general, 5 units bar)');

  // ─── seed_default_tables ─────────────────────────────────────────────────
  // Check if any tables already exist before seeding
  const existingTables = await prisma.table.count();
  if (existingTables === 0) {
    const defaultTables = [
      { table_name: 'Table 1' },
      { table_name: 'Table 2' },
      { table_name: 'Table 3' },
      { table_name: 'Table 4' },
      { table_name: 'Table 5' },
      { table_name: 'Table 6' },
      { table_name: 'Table 7' },
      { table_name: 'Table 8' },
      { table_name: 'Table 9' },
      { table_name: 'Table 10' },
      { table_name: 'Bar Counter' },
      { table_name: 'Outdoor Patio 1' },
      { table_name: 'Outdoor Patio 2' },
      { table_name: 'Private Room' },
      { table_name: 'VIP Section' },
    ];

    for (const table of defaultTables) {
      await prisma.table.create({ data: table });
      console.log(`  ✓ table: ${table.table_name}`);
    }
  } else {
    console.log(`  ↳ Skipping default tables — ${existingTables} already exist`);
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Dashboard data ready:');
  console.log('  • Content pages for website');
  console.log('  • Demo website leads for CRM dashboard');
  console.log('  • Sample products for FOOD, SOFT_DRINK, ALCOHOLIC_DRINK categories');
  console.log('  • Sample suppliers for FOOD, SOFT_DRINKS, ALCOHOL, GENERAL types');
  console.log('  • Default margin rules for pricing control');
  console.log('  • Dashboard indexes ready (migration 20260626000000)');
  console.log('  • Stock locations initialized (MAIN_STORE, Bar, Kitchen, Dispatch, Functions, Banqueting)');
  console.log('  • Reorder thresholds configured (10 units general, 5 units bar)');
  console.log('  • Default restaurant tables (15 tables including bar counter, patio, private room, VIP)');
  console.log('  • Uses existing: orders, payments, products, users');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
