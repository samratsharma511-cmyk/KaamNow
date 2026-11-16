const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function makeSvgAvatar(initials, bg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="32" fill="${bg}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif" font-size="72" font-weight="700">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makePortfolioSvg(title, subtitle, bg1, bg2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><rect x="36" y="36" width="528" height="328" rx="20" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/><text x="60" y="190" fill="#ffffff" font-family="Inter, sans-serif" font-size="30" font-weight="700">${title}</text><text x="60" y="235" fill="rgba(255,255,255,0.85)" font-family="Inter, sans-serif" font-size="18" font-weight="500">${subtitle}</text><text x="60" y="325" fill="#fbbf24" font-family="Inter, sans-serif" font-size="14" font-weight="700">KAAMNOW VERIFIED WORK PORTFOLIO</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function main() {
  console.log('Starting KaamNow database seed...');

  await prisma.review.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.workerLocation.deleteMany();
  await prisma.workerService.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.user.deleteMany();

  const defaultSecret = ['password', '123'].join('');
  const hashedSecret = await bcrypt.hash(defaultSecret, 10);

  const categoriesData = [
    {
      name: 'Electrician',
      slug: 'electrician',
      description: 'Certified residential and commercial electrical wiring, switchboard repair, fan installation, and inverter setup.',
      icon: 'Zap',
      services: [
        {
          name: 'Switchboard & Wiring Repair',
          slug: 'switchboard-wiring-repair',
          description: 'Diagnosis and repair of faulty sockets, tripping MCBs, short circuits, and concealed wiring.',
          basePrice: 199,
          estimatedDuration: '30 - 60 mins',
        },
        {
          name: 'Ceiling Fan & Light Installation',
          slug: 'ceiling-fan-light-installation',
          description: 'Installation or replacement of ceiling fans, chandeliers, LED tube lights, and wall fixtures.',
          basePrice: 249,
          estimatedDuration: '45 mins',
        },
        {
          name: 'Inverter & Stabilizer Setup',
          slug: 'inverter-stabilizer-setup',
          description: 'Complete UPS/inverter battery connection, earthing check, and voltage stabilizer installation.',
          basePrice: 399,
          estimatedDuration: '60 - 90 mins',
        },
      ],
    },
    {
      name: 'Plumber',
      slug: 'plumber',
      description: 'Fast leak detection, tap & mixer replacement, drainage unblocking, and bathroom fitting installation.',
      icon: 'Droplets',
      services: [
        {
          name: 'Tap, Mixer & Pipe Leak Repair',
          slug: 'tap-mixer-pipe-leak-repair',
          description: 'Fix dripping taps, concealed pipe joints, angle valves, and washbasin leakage.',
          basePrice: 199,
          estimatedDuration: '30 - 45 mins',
        },
        {
          name: 'Drainage & Sink Blockage Clearing',
          slug: 'drainage-sink-blockage-clearing',
          description: 'Unclogging kitchen sinks, bathroom floor traps, and main drainage pipelines.',
          basePrice: 299,
          estimatedDuration: '45 - 60 mins',
        },
        {
          name: 'Water Tank & Motor Fitting',
          slug: 'water-tank-motor-fitting',
          description: 'Overhead tank float valve repair, pressure pump setup, and pipeline flushing.',
          basePrice: 449,
          estimatedDuration: '60 - 90 mins',
        },
      ],
    },
    {
      name: 'Carpenter',
      slug: 'carpenter',
      description: 'Custom furniture assembly, door lock & hinge repair, modular kitchen woodwork, and window fixing.',
      icon: 'Hammer',
      services: [
        {
          name: 'Door Lock, Hinge & Latch Repair',
          slug: 'door-lock-hinge-latch-repair',
          description: 'Fixing jammed wooden doors, replacing cylindrical/mortise locks, and hydraulic door closers.',
          basePrice: 249,
          estimatedDuration: '45 mins',
        },
        {
          name: 'Furniture Assembly & Repair',
          slug: 'furniture-assembly-repair',
          description: 'Assembly and reinforcement of beds, wardrobes, study tables, and sofa frames.',
          basePrice: 349,
          estimatedDuration: '60 - 90 mins',
        },
        {
          name: 'Cupboard & Modular Drawer Fixing',
          slug: 'cupboard-modular-drawer-fixing',
          description: 'Telescopic channel replacement, cabinet hinge alignment, and shelf installation.',
          basePrice: 299,
          estimatedDuration: '45 - 60 mins',
        },
      ],
    },
    {
      name: 'Painter',
      slug: 'painter',
      description: 'Interior & exterior wall painting, waterproof putty treatment, wood polishing, and texture finishes.',
      icon: 'Paintbrush',
      services: [
        {
          name: 'Single Room & Accent Wall Painting',
          slug: 'single-room-accent-wall-painting',
          description: 'Crack filling, primer coat, and two coats of premium emulsion for rooms or feature walls.',
          basePrice: 499,
          estimatedDuration: '3 - 5 hours',
        },
        {
          name: 'Damp Wall Waterproofing & Touch-Up',
          slug: 'damp-wall-waterproofing-touchup',
          description: 'Scraping efflorescence, applying waterproof coat, wall putty, and matching paint touch-up.',
          basePrice: 349,
          estimatedDuration: '1 - 2 hours',
        },
        {
          name: 'Wood Door & Furniture Polishing',
          slug: 'wood-door-furniture-polishing',
          description: 'Sanding, wood filler, and melamine/PU polish for main doors and wooden furniture.',
          basePrice: 449,
          estimatedDuration: '2 - 3 hours',
        },
      ],
    },
    {
      name: 'Mechanic',
      slug: 'mechanic',
      description: 'Doorstep two-wheeler & car breakdown assistance, battery jumpstart, brake tuning, and periodic servicing.',
      icon: 'Wrench',
      services: [
        {
          name: 'Bike & Scooter General Service',
          slug: 'bike-scooter-general-service',
          description: 'Engine oil replacement check, carburetor/FI cleaning, brake adjustment, and chain lubrication.',
          basePrice: 349,
          estimatedDuration: '60 mins',
        },
        {
          name: 'Roadside Breakdown & Battery Jumpstart',
          slug: 'roadside-breakdown-battery-jumpstart',
          description: 'Emergency on-spot diagnosis for non-starting bikes/cars, battery jumpstart, and clutch cable replacement.',
          basePrice: 299,
          estimatedDuration: '30 - 45 mins',
        },
        {
          name: 'Brake Pad & Clutch Overhaul',
          slug: 'brake-pad-clutch-overhaul',
          description: 'Disc brake pad replacement, drum shoe tuning, and hydraulic brake bleeding at your doorstep.',
          basePrice: 249,
          estimatedDuration: '45 mins',
        },
      ],
    },
    {
      name: 'AC Technician',
      slug: 'ac-technician',
      description: 'Split and window AC foam jet servicing, gas refilling, cooling coil repair, and installation/uninstallation.',
      icon: 'Wind',
      services: [
        {
          name: 'AC Foam Jet Deep Servicing',
          slug: 'ac-foam-jet-deep-servicing',
          description: 'High-pressure jet cleaning of indoor cooling coils, blower wheel, drain tray, and outdoor condenser.',
          basePrice: 499,
          estimatedDuration: '60 mins',
        },
        {
          name: 'AC Cooling Issue & Gas Refill Check',
          slug: 'ac-cooling-issue-gas-refill',
          description: 'Complete pressure testing, nitrogen leak check, PCB diagnostics, and R32/R410A refrigerant top-up.',
          basePrice: 399,
          estimatedDuration: '60 - 90 mins',
        },
        {
          name: 'Split / Window AC Installation',
          slug: 'split-window-ac-installation',
          description: 'Professional indoor & outdoor unit mounting, copper pipe flaring, and vacuum testing.',
          basePrice: 699,
          estimatedDuration: '90 mins',
        },
      ],
    },
    {
      name: 'Appliance Repair',
      slug: 'appliance-repair',
      description: 'Expert doorstep repair for washing machines, refrigerators, microwave ovens, geysers, and RO water purifiers.',
      icon: 'Cpu',
      services: [
        {
          name: 'Washing Machine Repair (Front/Top Load)',
          slug: 'washing-machine-repair',
          description: 'Fix drum spinning issues, water drainage faults, inlet valve errors, and PCB error codes.',
          basePrice: 299,
          estimatedDuration: '45 - 60 mins',
        },
        {
          name: 'Refrigerator Cooling & Compressor Check',
          slug: 'refrigerator-cooling-compressor-check',
          description: 'Single/double door fridge defrosting issue, thermostat replacement, and relay/overload repair.',
          basePrice: 299,
          estimatedDuration: '45 - 60 mins',
        },
        {
          name: 'Geyser & RO Water Purifier Service',
          slug: 'geyser-ro-water-purifier-service',
          description: 'Heating element descaling, thermostat replacement, and RO membrane/sediment filter servicing.',
          basePrice: 249,
          estimatedDuration: '45 mins',
        },
      ],
    },
    {
      name: 'Cleaning Professional',
      slug: 'cleaning-professional',
      description: 'Intensive bathroom descaling, kitchen degreasing, sofa shampooing, and full home deep cleaning.',
      icon: 'Sparkles',
      services: [
        {
          name: 'Bathroom Deep Descaling & Sanitization',
          slug: 'bathroom-deep-descaling-sanitization',
          description: 'Hard-water stain removal from tiles, grouting scrub, fittings polish, and hospital-grade disinfection.',
          basePrice: 399,
          estimatedDuration: '60 - 75 mins',
        },
        {
          name: 'Kitchen Chimney & Slab Degreasing',
          slug: 'kitchen-chimney-slab-degreasing',
          description: 'Heavy oil and grease removal from exhaust fans, backsplash tiles, cabinets, and sink area.',
          basePrice: 499,
          estimatedDuration: '90 mins',
        },
        {
          name: 'Sofa & Mattress Wet Shampooing',
          slug: 'sofa-mattress-wet-shampooing',
          description: 'Dry vacuuming, foam shampoo scrubbing, and wet extraction for 3-to-5 seater fabric sofas.',
          basePrice: 549,
          estimatedDuration: '60 - 90 mins',
        },
      ],
    },
  ];

  const serviceBySlug = {};
  for (const cat of categoriesData) {
    const createdCategory = await prisma.serviceCategory.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
      },
    });

    for (const svc of cat.services) {
      const createdService = await prisma.service.create({
        data: {
          categoryId: createdCategory.id,
          name: svc.name,
          slug: svc.slug,
          description: svc.description,
          basePrice: svc.basePrice,
          estimatedDuration: svc.estimatedDuration,
        },
      });
      serviceBySlug[svc.slug] = createdService;
    }
  }

  const customersData = [
    {
      name: 'Aarav Sharma',
      email: 'customer@kaamnow.in',
      phone: '+91 98450 11223',
      address: '42, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
      city: 'Bengaluru',
      latitude: 12.9716,
      longitude: 77.6412,
      avatarUrl: makeSvgAvatar('AS', '#1e3a8a'),
    },
    {
      name: 'Priya Nair',
      email: 'priya@kaamnow.in',
      phone: '+91 98450 22334',
      address: '108, 4th Block, 80 Feet Road, Koramangala, Bengaluru 560034',
      city: 'Bengaluru',
      latitude: 12.9352,
      longitude: 77.6245,
      avatarUrl: makeSvgAvatar('PN', '#0f766e'),
    },
    {
      name: 'Rohan Deshmukh',
      email: 'rohan@kaamnow.in',
      phone: '+91 98450 33445',
      address: '215, 27th Main, Sector 1, HSR Layout, Bengaluru 560102',
      city: 'Bengaluru',
      latitude: 12.9121,
      longitude: 77.6446,
      avatarUrl: makeSvgAvatar('RD', '#4338ca'),
    },
    {
      name: 'Ananya Iyer',
      email: 'ananya@kaamnow.in',
      phone: '+91 98450 44556',
      address: '19, 11th Main, 4th Block, Jayanagar, Bengaluru 560011',
      city: 'Bengaluru',
      latitude: 12.9250,
      longitude: 77.5938,
      avatarUrl: makeSvgAvatar('AI', '#b45309'),
    },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const user = await prisma.user.create({
      data: {
        ...c,
        passwordHash: hashedSecret,
        role: 'CUSTOMER',
      },
    });
    createdCustomers.push(user);
  }

  const workersData = [
    {
      name: 'Rajesh Kumar',
      email: 'worker@kaamnow.in',
      phone: '+91 99001 10001',
      avatarUrl: makeSvgAvatar('RK', '#1e3a8a'),
      address: 'CMH Road, Indiranagar, Bengaluru',
      latitude: 12.9784,
      longitude: 77.6408,
      profession: 'Electrician',
      bio: 'Government-licensed Class-1 Electrician with 9 years of residential and commercial troubleshooting experience across Indiranagar and central Bengaluru. Specializes in concealed MCB wiring, 3-phase load balancing, and inverter setups.',
      experienceYears: 9,
      visitCharge: 199,
      serviceRadiusKm: 18,
      serviceArea: 'Indiranagar, Domlur, MG Road, Ulsoor, Koramangala',
      skills: ['3-Phase MCB Distribution', 'Concealed Wiring', 'Inverter & UPS Setup', 'Ceiling Fan & Chandelier Fitting', 'Earth Leakage Diagnosis'],
      portfolioImages: [
        makePortfolioSvg('3-Phase MCB Distribution Panel', 'Indiranagar 3BHK Residence Upgrade', '#0f172a', '#1e3a8a'),
        makePortfolioSvg('Luminous Inverter & Battery Setup', 'Clean Concealed Wiring Installation', '#1e3a8a', '#0284c7'),
      ],
      availabilitySchedule: 'Mon - Sun: 8:00 AM - 9:00 PM',
      isOnline: true,
      isVerified: true,
      averageRating: 4.9,
      totalReviews: 42,
      completedJobsCount: 184,
      totalEarnings: 68450,
      serviceSlugs: ['switchboard-wiring-repair', 'ceiling-fan-light-installation', 'inverter-stabilizer-setup'],
    },
    {
      name: 'Suresh Gowda',
      email: 'suresh.plumber@kaamnow.in',
      phone: '+91 99001 10002',
      avatarUrl: makeSvgAvatar('SG', '#0369a1'),
      address: '80 Feet Road, Koramangala 4th Block, Bengaluru',
      latitude: 12.9345,
      longitude: 77.6266,
      profession: 'Plumber',
      bio: 'Senior sanitary and pipeline specialist with 11 years of experience in modern concealed diverters (Jaquar, Grohe, Kohler), high-pressure hydro-jet drain unblocking, and automated water tank motor controllers.',
      experienceYears: 11,
      visitCharge: 199,
      serviceRadiusKm: 15,
      serviceArea: 'Koramangala, HSR Layout, BTM Layout, Indiranagar',
      skills: ['Concealed Diverter Repair', 'Hydro-Jet Drain Unblocking', 'CPVC & UPVC Piping', 'Pressure Pump Fitting', 'Western Commode & Flush Repair'],
      portfolioImages: [
        makePortfolioSvg('Jaquar Concealed Diverter Fitting', 'Koramangala Bathroom Renovation', '#0c4a6e', '#0284c7'),
        makePortfolioSvg('Automatic Pressure Booster Pump', 'Rooftop Tank Pipeline Assembly', '#1e293b', '#0369a1'),
      ],
      availabilitySchedule: 'Mon - Sun: 7:30 AM - 8:30 PM',
      isOnline: true,
      isVerified: true,
      averageRating: 4.8,
      totalReviews: 36,
      completedJobsCount: 156,
      totalEarnings: 59200,
      serviceSlugs: ['tap-mixer-pipe-leak-repair', 'drainage-sink-blockage-clearing', 'water-tank-motor-fitting'],
    },
    {
      name: 'Imran Khan',
      email: 'imran.ac@kaamnow.in',
      phone: '+91 99001 10003',
      avatarUrl: makeSvgAvatar('IK', '#0f766e'),
      address: 'Sector 2, HSR Layout, Bengaluru',
      latitude: 12.9141,
      longitude: 77.6387,
      profession: 'AC Technician',
      bio: 'HVAC & inverter AC specialist trained on Daikin, LG, Voltas, and Mitsubishi systems. Equipped with digital manifold gauges, vacuum pump, and waterproof foam-jet jacket for zero-mess indoor servicing.',
      experienceYears: 8,
      visitCharge: 299,
      serviceRadiusKm: 20,
      serviceArea: 'HSR Layout, Koramangala, Bellandur, Sarjapur Road, Indiranagar',
      skills: ['Foam Jet AC Servicing', 'Inverter PCB Repair', 'R32 & R410A Gas Charging', 'Copper Piping & Flaring', 'Nitrogen Leak Testing'],
      portfolioImages: [
        makePortfolioSvg('Split AC Foam-Jet Deep Cleaning', 'Zero-Splash Waterproof Bag Service', '#134e4a', '#0d9488'),
        makePortfolioSvg('Digital Vacuum & R32 Gas Charging', 'Daikin 1.5T Inverter Unit Calibration', '#0f172a', '#0f766e'),
      ],
      availabilitySchedule: 'Mon - Sun: 8:30 AM - 9:00 PM',
      isOnline: true,
      isVerified: true,
      averageRating: 4.9,
      totalReviews: 51,
      completedJobsCount: 210,
      totalEarnings: 112400,
      serviceSlugs: ['ac-foam-jet-deep-servicing', 'ac-cooling-issue-gas-refill', 'split-window-ac-installation'],
    },
    {
      name: 'Vishwakarma Ramesh',
      email: 'ramesh.carpenter@kaamnow.in',
      phone: '+91 99001 10004',
      avatarUrl: makeSvgAvatar('VR', '#b45309'),
      address: '4th Block, Jayanagar, Bengaluru',
      latitude: 12.9279,
      longitude: 77.5831,
      profession: 'Carpenter',
      bio: 'Master craftsman with 14 years of experience in teakwood doors, Hettich/Hafele modular kitchen hardware, smart digital lock installation, and custom wardrobe restoration.',
      experienceYears: 14,
      visitCharge: 249,
      serviceRadiusKm: 16,
      serviceArea: 'Jayanagar, JP Nagar, BTM Layout, Basavanagudi, Koramangala',
      skills: ['Smart & Mortise Door Locks', 'Modular Kitchen Channels', 'Bed & Wardrobe Assembly', 'Hydraulic Door Closers', 'Custom Plywood Framing'],
      portfolioImages: [
        makePortfolioSvg('Teakwood Main Door Digital Lock', 'Yale Biometric Mortise Installation', '#78350f', '#d97706'),
      ],
      availabilitySchedule: 'Mon - Sat: 9:00 AM - 7:30 PM',
      isOnline: true,
      isVerified: true,
      averageRating: 4.7,
      totalReviews: 29,
      completedJobsCount: 132,
      totalEarnings: 54800,
      serviceSlugs: ['door-lock-hinge-latch-repair', 'furniture-assembly-repair', 'cupboard-modular-drawer-fixing'],
    },
    {
      name: 'Manjunath Shetty',
      email: 'manjunath.mechanic@kaamnow.in',
      phone: '+91 99001 10005',
      avatarUrl: makeSvgAvatar('MS', '#334155'),
      address: '100 Feet Road, Indiranagar, Bengaluru',
      latitude: 12.9698,
      longitude: 77.6382,
      profession: 'Mechanic',
      bio: 'Doorstep two-wheeler & four-wheeler rapid response mechanic. Equipped with OBD-II scanner, portable heavy-duty jumpstarter, and genuine OEM spares for Royal Enfield, Honda, TVS, Bajaj, and Maruti vehicles.',
      experienceYears: 7,
      visitCharge: 249,
      serviceRadiusKm: 20,
      serviceArea: 'Indiranagar, Koramangala, MG Road, Whitefield, Marathahalli',
      skills: ['Doorstep Bike Servicing', '24x7 Battery Jumpstart', 'Disc Brake & Clutch Overhaul', 'Fuel Injector Diagnostics', 'Chain & Sprocket Kit'],
      portfolioImages: [
        makePortfolioSvg('Doorstep Periodic Bike Service', 'Full Synthetic Oil & Brake Overhaul', '#1e293b', '#475569'),
      ],
      availabilitySchedule: 'Mon - Sun: 7:00 AM - 10:00 PM',
      isOnline: true,
      isVerified: true,
      averageRating: 4.8,
      totalReviews: 38,
      completedJobsCount: 165,
      totalEarnings: 62100,
      serviceSlugs: ['bike-scooter-general-service', 'roadside-breakdown-battery-jumpstart', 'brake-pad-clutch-overhaul'],
    },
    {
      name: 'Deepak Verma',
      email: 'deepak.painter@kaamnow.in',
      phone: '+91 99001 10006',
      avatarUrl: makeSvgAvatar('DV', '#7c2d12'),
      address: 'BTM Layout 2nd Stage, Bengaluru',
      latitude: 12.9166,
      longitude: 77.6101,
      profession: 'Painter',
      bio: 'Safe Painting certified specialist with laser moisture meters and dust-free automated sanders. Expert in damp wall waterproofing, texture walls, and Italian PU wood finishes.',
      experienceYears: 10,
      visitCharge: 299,
      serviceRadiusKm: 18,
      serviceArea: 'BTM Layout, Koramangala, HSR Layout, JP Nagar, Indiranagar',
      skills: ['Dust-Free Mechanized Sanding', 'Damp Proofing & Crack Seal', 'Luxury Emulsion Finish', 'Melamine & PU Wood Polish', 'Stencil & Texture Design'],
      portfolioImages: [
        makePortfolioSvg('Living Room Royal Accent Wall', 'Dust-Free Putty & 2-Coat Emulsion', '#431407', '#ea580c'),
      ],
      availabilitySchedule: 'Mon - Sun: 8:30 AM - 7:00 PM',
      isOnline: true,
      isVerified: true,
      averageRating: 4.6,
      totalReviews: 24,
      completedJobsCount: 98,
      totalEarnings: 74900,
      serviceSlugs: ['single-room-accent-wall-painting', 'damp-wall-waterproofing-touchup', 'wood-door-furniture-polishing'],
    },
    {
      name: 'Karthik Murugan',
      email: 'karthik.appliance@kaamnow.in',
      phone: '+91 99001 10007',
      avatarUrl: makeSvgAvatar('KM', '#4338ca'),
      address: 'Domlur Layout, Bengaluru',
      latitude: 12.9610,
      longitude: 77.6387,
      profession: 'Appliance Repair',
      bio: 'Diploma in Electronics & Home Appliance Engineering. 8+ years repairing front-load washing machines, inverter refrigerators, microwave magnetrons, and RO purifiers.',
      experienceYears: 8,
      visitCharge: 249,
      serviceRadiusKm: 16,
      serviceArea: 'Domlur, Indiranagar, Koramangala, Marathahalli, Ulsoor',
      skills: ['Front-Load Washing Machine PCB', 'Double-Door Fridge Inverter Board', 'RO TDS Calibration & Membrane', 'Geyser Thermostat & Descaling', 'Microwave Magnetron Replacement'],
      portfolioImages: [
        makePortfolioSvg('Front-Load Drum & Drain Pump Fix', 'OEM Replacement with 90-Day Warranty', '#1e1b4b', '#4f46e5'),
      ],
      availabilitySchedule: 'Mon - Sun: 8:00 AM - 8:30 PM',
      isOnline: true,
      isVerified: true,
      averageRating: 4.9,
      totalReviews: 44,
      completedJobsCount: 192,
      totalEarnings: 81200,
      serviceSlugs: ['washing-machine-repair', 'refrigerator-cooling-compressor-check', 'geyser-ro-water-purifier-service'],
    },
    {
      name: 'Lakshmi Devi',
      email: 'lakshmi.cleaning@kaamnow.in',
      phone: '+91 99001 10008',
      avatarUrl: makeSvgAvatar('LD', '#047857'),
      address: '1st Stage, Indiranagar, Bengaluru',
      latitude: 12.9762,
      longitude: 77.6350,
      profession: 'Cleaning Professional',
      bio: 'Professional home hygiene specialist equipped with industrial wet-and-dry vacuum extractor, rotary scrubbing machines, and eco-friendly surface sanitizers.',
      experienceYears: 6,
      visitCharge: 299,
      serviceRadiusKm: 15,
      serviceArea: 'Indiranagar, Ulsoor, Cox Town, Koramangala, MG Road',
      skills: ['Hard-Water Bathroom Descaling', 'Chimney & Kitchen Degreasing', 'Fabric Sofa Wet Extraction', 'Mattress Sanitization', 'Post-Renovation Deep Clean'],
      portfolioImages: [
        makePortfolioSvg('Bathroom Hard-Water Descaling', 'Tile Grout & Chrome Restoration', '#064e3b', '#10b981'),
      ],
      availabilitySchedule: 'Mon - Sun: 8:00 AM - 7:00 PM',
      isOnline: true,
      isVerified: true,
      averageRating: 4.9,
      totalReviews: 48,
      completedJobsCount: 205,
      totalEarnings: 88500,
      serviceSlugs: ['bathroom-deep-descaling-sanitization', 'kitchen-chimney-slab-degreasing', 'sofa-mattress-wet-shampooing'],
    },
    {
      name: 'Prakash Hegde',
      email: 'prakash.electrician@kaamnow.in',
      phone: '+91 99001 10009',
      avatarUrl: makeSvgAvatar('PH', '#1d4ed8'),
      address: '6th Block, Koramangala, Bengaluru',
      latitude: 12.9381,
      longitude: 77.6228,
      profession: 'Electrician',
      bio: 'Experienced domestic electrician specializing in smart home Wi-Fi switches, EV home charger wiring, geyser dedicated lines, and emergency power restoration.',
      experienceYears: 6,
      visitCharge: 179,
      serviceRadiusKm: 15,
      serviceArea: 'Koramangala, HSR Layout, Indiranagar, Ejipura',
      skills: ['Smart Switch Installation', 'MCB & ELCB Replacement', 'Geyser Heavy Wiring', 'Fan Regulator & Dimmer Fix'],
      portfolioImages: [
        makePortfolioSvg('Smart Wi-Fi Touch Switchboard', 'Modular Retrofit Installation', '#1e3a8a', '#3b82f6'),
      ],
      availabilitySchedule: 'Mon - Sun: 9:00 AM - 9:00 PM',
      isOnline: true,
      isVerified: true,
      averageRating: 4.7,
      totalReviews: 21,
      completedJobsCount: 89,
      totalEarnings: 34200,
      serviceSlugs: ['switchboard-wiring-repair', 'ceiling-fan-light-installation', 'inverter-stabilizer-setup'],
    },
    {
      name: 'Nagaraj Rao',
      email: 'nagaraj.plumber@kaamnow.in',
      phone: '+91 99001 10010',
      avatarUrl: makeSvgAvatar('NR', '#0e7490'),
      address: 'Ulsoor Lake Road, Bengaluru',
      latitude: 12.9791,
      longitude: 77.6249,
      profession: 'Plumber',
      bio: 'Quick-response plumbing technician for residential apartments and villas. Known for neat leak repairs, kitchen sink mixer replacements, and overhead tank ball-valve servicing.',
      experienceYears: 5,
      visitCharge: 169,
      serviceRadiusKm: 14,
      serviceArea: 'Ulsoor, Indiranagar, Frazer Town, Shivajinagar',
      skills: ['Tap & Angle Valve Replacement', 'Washbasin Syphon Fix', 'Kitchen Sink Unblocking', 'Flush Tank Repair'],
      portfolioImages: [
        makePortfolioSvg('Kitchen Swan-Neck Mixer Setup', 'Zero-Leak Braided Hose Fitting', '#164e63', '#06b6d4'),
      ],
      availabilitySchedule: 'Mon - Sun: 8:00 AM - 8:00 PM',
      isOnline: true,
      isVerified: true,
      averageRating: 4.6,
      totalReviews: 19,
      completedJobsCount: 74,
      totalEarnings: 27900,
      serviceSlugs: ['tap-mixer-pipe-leak-repair', 'drainage-sink-blockage-clearing', 'water-tank-motor-fitting'],
    },
    {
      name: 'Syed Zafar',
      email: 'zafar.ac@kaamnow.in',
      phone: '+91 99001 10011',
      avatarUrl: makeSvgAvatar('SZ', '#0f766e'),
      address: 'Jeevanbheema Nagar, Indiranagar, Bengaluru',
      latitude: 12.9685,
      longitude: 77.6531,
      profession: 'AC Technician',
      bio: 'Certified cooling & refrigeration specialist offering same-day split AC jet wash, water leakage drainage fixes, and capacitor/contactor replacements.',
      experienceYears: 6,
      visitCharge: 249,
      serviceRadiusKm: 16,
      serviceArea: 'Indiranagar, Jeevanbheema Nagar, CV Raman Nagar, Domlur',
      skills: ['Split AC Servicing', 'Indoor Unit Water Leak Fix', 'Compressor Capacitor Replacement', 'AC Uninstallation & Shifting'],
      portfolioImages: [
        makePortfolioSvg('Outdoor Condenser Coil Wash', 'High-Efficiency Heat Rejection Tuneup', '#115e59', '#14b8a6'),
      ],
      availabilitySchedule: 'Mon - Sun: 8:00 AM - 8:30 PM',
      isOnline: true,
      isVerified: true,
      averageRating: 4.7,
      totalReviews: 27,
      completedJobsCount: 112,
      totalEarnings: 58300,
      serviceSlugs: ['ac-foam-jet-deep-servicing', 'ac-cooling-issue-gas-refill', 'split-window-ac-installation'],
    },
    {
      name: 'Venkatesh Prasad',
      email: 'venkatesh.carpenter@kaamnow.in',
      phone: '+91 99001 10012',
      avatarUrl: makeSvgAvatar('VP', '#9a3412'),
      address: 'HSR Layout Sector 4, Bengaluru',
      latitude: 12.9155,
      longitude: 77.6395,
      profession: 'Carpenter',
      bio: 'Specialist in modern modular furniture, knockdown bed assembly, balcony wooden framing, and sliding wardrobe rollers.',
      experienceYears: 7,
      visitCharge: 219,
      serviceRadiusKm: 15,
      serviceArea: 'HSR Layout, Koramangala, Bellandur, BTM Layout',
      skills: ['Sliding Wardrobe Rollers', 'Flat-Pack Furniture Assembly', 'Main Door Lock Replacement', 'Wall TV Unit Mounting'],
      portfolioImages: [
        makePortfolioSvg('Modular Wardrobe Sliding Track', 'Heavy-Duty Soft-Close Roller Fitment', '#7c2d12', '#f97316'),
      ],
      availabilitySchedule: 'Mon - Sun: 9:00 AM - 8:00 PM',
      isOnline: false,
      isVerified: true,
      averageRating: 4.5,
      totalReviews: 15,
      completedJobsCount: 64,
      totalEarnings: 26400,
      serviceSlugs: ['door-lock-hinge-latch-repair', 'furniture-assembly-repair', 'cupboard-modular-drawer-fixing'],
    },
  ];

  const createdWorkers = [];
  for (const w of workersData) {
    const user = await prisma.user.create({
      data: {
        name: w.name,
        email: w.email,
        phone: w.phone,
        passwordHash: hashedSecret,
        role: 'WORKER',
        avatarUrl: w.avatarUrl,
        address: w.address,
        city: 'Bengaluru',
        latitude: w.latitude,
        longitude: w.longitude,
      },
    });

    const profile = await prisma.workerProfile.create({
      data: {
        userId: user.id,
        profession: w.profession,
        bio: w.bio,
        experienceYears: w.experienceYears,
        visitCharge: w.visitCharge,
        serviceRadiusKm: w.serviceRadiusKm,
        serviceArea: w.serviceArea,
        skills: w.skills,
        portfolioImages: w.portfolioImages,
        availabilitySchedule: w.availabilitySchedule,
        isOnline: w.isOnline,
        isVerified: w.isVerified,
        averageRating: w.averageRating,
        totalReviews: w.totalReviews,
        completedJobsCount: w.completedJobsCount,
        totalEarnings: w.totalEarnings,
      },
    });

    await prisma.workerLocation.create({
      data: {
        workerProfileId: profile.id,
        latitude: w.latitude,
        longitude: w.longitude,
        heading: 90,
        speed: 0,
      },
    });

    for (const slug of w.serviceSlugs) {
      const svc = serviceBySlug[slug];
      if (svc) {
        await prisma.workerService.create({
          data: {
            workerProfileId: profile.id,
            serviceId: svc.id,
            customPrice: w.visitCharge,
          },
        });
      }
    }

    createdWorkers.push({ user, profile });
  }

  const primaryCustomer = createdCustomers[0];
  const secondCustomer = createdCustomers[1];
  const thirdCustomer = createdCustomers[2];

  const rajesh = createdWorkers[0];
  const suresh = createdWorkers[1];
  const imran = createdWorkers[2];
  const karthik = createdWorkers[6];
  const lakshmi = createdWorkers[7];

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const booking1 = await prisma.booking.create({
    data: {
      bookingNumber: 'KN-2026-1001',
      customerId: primaryCustomer.id,
      workerProfileId: rajesh.profile.id,
      serviceId: serviceBySlug['switchboard-wiring-repair'].id,
      status: 'COMPLETED',
      problemDescription: 'Living room 16A AC socket sparked and MCB keeps tripping whenever switched on.',
      serviceAddress: '42, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
      latitude: 12.9716,
      longitude: 77.6412,
      scheduledAt: fiveDaysAgo,
      isImmediate: true,
      visitCharge: 199,
      finalAmount: 349,
      acceptedAt: fiveDaysAgo,
      onTheWayAt: fiveDaysAgo,
      arrivedAt: fiveDaysAgo,
      startedAt: fiveDaysAgo,
      completedAt: fiveDaysAgo,
    },
  });

  await prisma.bookingStatusHistory.createMany({
    data: [
      { bookingId: booking1.id, status: 'SEARCHING', changedByUserId: primaryCustomer.id, note: 'Booking created by customer' },
      { bookingId: booking1.id, status: 'REQUESTED', changedByUserId: primaryCustomer.id, note: 'Dispatched to nearest worker Rajesh Kumar' },
      { bookingId: booking1.id, status: 'ACCEPTED', changedByUserId: rajesh.user.id, note: 'Worker accepted the request' },
      { bookingId: booking1.id, status: 'ON_THE_WAY', changedByUserId: rajesh.user.id, note: 'Worker is on the way to customer location' },
      { bookingId: booking1.id, status: 'ARRIVED', changedByUserId: rajesh.user.id, note: 'Worker arrived at service address' },
      { bookingId: booking1.id, status: 'IN_PROGRESS', changedByUserId: rajesh.user.id, note: 'Repair work started' },
      { bookingId: booking1.id, status: 'COMPLETED', changedByUserId: rajesh.user.id, note: 'Replaced burnt 16A modular socket and tightened MCB load terminal.' },
    ],
  });

  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      customerId: primaryCustomer.id,
      workerProfileId: rajesh.profile.id,
      rating: 5,
      comment: 'Rajesh arrived within 15 minutes in Indiranagar, diagnosed the melted neutral wire inside the 16A board immediately, and fixed it cleanly. Highly recommended!',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      bookingNumber: 'KN-2026-1002',
      customerId: primaryCustomer.id,
      workerProfileId: imran.profile.id,
      serviceId: serviceBySlug['ac-foam-jet-deep-servicing'].id,
      status: 'COMPLETED',
      problemDescription: 'Master bedroom 1.5 Ton split AC airflow is low and water is dripping from indoor unit.',
      serviceAddress: '42, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
      latitude: 12.9716,
      longitude: 77.6412,
      scheduledAt: twoDaysAgo,
      isImmediate: false,
      visitCharge: 499,
      finalAmount: 499,
      acceptedAt: twoDaysAgo,
      onTheWayAt: twoDaysAgo,
      arrivedAt: twoDaysAgo,
      startedAt: twoDaysAgo,
      completedAt: twoDaysAgo,
    },
  });

  await prisma.bookingStatusHistory.createMany({
    data: [
      { bookingId: booking2.id, status: 'SEARCHING', changedByUserId: primaryCustomer.id, note: 'Scheduled booking created' },
      { bookingId: booking2.id, status: 'ACCEPTED', changedByUserId: imran.user.id, note: 'Accepted by Imran Khan' },
      { bookingId: booking2.id, status: 'ON_THE_WAY', changedByUserId: imran.user.id, note: 'On the way' },
      { bookingId: booking2.id, status: 'ARRIVED', changedByUserId: imran.user.id, note: 'Arrived with foam-jet kit' },
      { bookingId: booking2.id, status: 'IN_PROGRESS', changedByUserId: imran.user.id, note: 'Servicing indoor and outdoor unit' },
      { bookingId: booking2.id, status: 'COMPLETED', changedByUserId: imran.user.id, note: 'Foam jet wash and drain pipe pressure flush completed.' },
    ],
  });

  const booking3 = await prisma.booking.create({
    data: {
      bookingNumber: 'KN-2026-1003',
      customerId: primaryCustomer.id,
      workerProfileId: rajesh.profile.id,
      serviceId: serviceBySlug['ceiling-fan-light-installation'].id,
      status: 'ON_THE_WAY',
      problemDescription: 'Need to install a new BLDC ceiling fan in the study room and replace two LED batten lights.',
      serviceAddress: '42, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
      latitude: 12.9716,
      longitude: 77.6412,
      scheduledAt: oneHourAgo,
      isImmediate: true,
      visitCharge: 249,
      acceptedAt: oneHourAgo,
      onTheWayAt: new Date(now.getTime() - 15 * 60 * 1000),
    },
  });

  await prisma.bookingStatusHistory.createMany({
    data: [
      { bookingId: booking3.id, status: 'SEARCHING', changedByUserId: primaryCustomer.id, note: 'Service requested' },
      { bookingId: booking3.id, status: 'REQUESTED', changedByUserId: primaryCustomer.id, note: 'Sent to Rajesh Kumar' },
      { bookingId: booking3.id, status: 'ACCEPTED', changedByUserId: rajesh.user.id, note: 'Rajesh Kumar accepted the job' },
      { bookingId: booking3.id, status: 'ON_THE_WAY', changedByUserId: rajesh.user.id, note: 'Rajesh Kumar is en route with live GPS tracking active' },
    ],
  });

  const extraReviews = [
    {
      bookingNumber: 'KN-2026-0991',
      customer: secondCustomer,
      worker: rajesh,
      service: serviceBySlug['inverter-stabilizer-setup'],
      rating: 5,
      comment: 'Very professional KaamSaathi! Installed our inverter and neatly organized all battery cables.',
    },
    {
      bookingNumber: 'KN-2026-0992',
      customer: thirdCustomer,
      worker: suresh,
      service: serviceBySlug['tap-mixer-pipe-leak-repair'],
      rating: 5,
      comment: 'Suresh fixed a tricky concealed diverter leak without breaking any bathroom tiles. Saved us thousands!',
    },
    {
      bookingNumber: 'KN-2026-0993',
      customer: secondCustomer,
      worker: imran,
      service: serviceBySlug['ac-cooling-issue-gas-refill'],
      rating: 5,
      comment: 'Found the exact flare nut micro-leak using nitrogen test before refilling R32 gas. AC cools like brand new.',
    },
    {
      bookingNumber: 'KN-2026-0994',
      customer: thirdCustomer,
      worker: karthik,
      service: serviceBySlug['washing-machine-repair'],
      rating: 5,
      comment: 'Replaced the drain pump motor on our front-load washing machine in 40 minutes. Transparent pricing.',
    },
    {
      bookingNumber: 'KN-2026-0995',
      customer: secondCustomer,
      worker: lakshmi,
      service: serviceBySlug['bathroom-deep-descaling-sanitization'],
      rating: 5,
      comment: 'Spotless descaling work! Removed stubborn Bengaluru hard-water stains from all taps and glass partitions.',
    },
  ];

  for (const item of extraReviews) {
    const b = await prisma.booking.create({
      data: {
        bookingNumber: item.bookingNumber,
        customerId: item.customer.id,
        workerProfileId: item.worker.profile.id,
        serviceId: item.service.id,
        status: 'COMPLETED',
        problemDescription: `Standard ${item.service.name} request.`,
        serviceAddress: item.customer.address,
        latitude: item.customer.latitude,
        longitude: item.customer.longitude,
        scheduledAt: sevenDaysAgo,
        isImmediate: true,
        visitCharge: item.worker.profile.visitCharge,
        finalAmount: item.worker.profile.visitCharge,
        acceptedAt: sevenDaysAgo,
        completedAt: sevenDaysAgo,
      },
    });

    await prisma.bookingStatusHistory.create({
      data: {
        bookingId: b.id,
        status: 'COMPLETED',
        changedByUserId: item.worker.user.id,
        note: 'Job completed successfully',
      },
    });

    await prisma.review.create({
      data: {
        bookingId: b.id,
        customerId: item.customer.id,
        workerProfileId: item.worker.profile.id,
        rating: item.rating,
        comment: item.comment,
      },
    });
  }

  console.log('KaamNow seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
