require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventnest';

const sampleEvents = [
  {
    title: 'TechFest 2025 – India\'s Biggest Tech Conference',
    description: 'Join 5000+ developers, designers, and tech leaders for India\'s premier technology conference. Featuring keynotes from Google, Microsoft, and top Indian unicorns. Sessions covering AI, Cloud, Web3, DevOps, and more. Hands-on workshops, hackathons, networking dinners, and career fairs included.',
    shortDescription: 'India\'s biggest tech conference with 5000+ attendees',
    category: 'Technology',
    tags: ['tech', 'ai', 'cloud', 'web3', 'devops'],
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
    startDate: new Date('2026-12-15'), endDate: new Date('2026-12-17'),
    startTime: '09:00', endTime: '18:00',
    venue: { name: 'Bangalore International Exhibition Centre', address: '10th Mile, Tumkur Road, Madavara Post', city: 'Bangalore', state: 'Karnataka', country: 'India', pincode: '562123', mapLink: 'https://maps.google.com/?q=Bangalore+International+Exhibition+Centre' },
    organizer: { name: 'TechFest India Pvt Ltd', email: 'info@techfestindia.com', phone: '+91 9876543210', website: 'https://techfestindia.com' },
    ticketTypes: [
      { name: 'Early Bird', price: 999, totalCapacity: 500, soldCount: 450, maxPerBooking: 5, description: 'Limited early bird offer - Save 50%!', isActive: true },
      { name: 'Standard', price: 1999, totalCapacity: 2000, soldCount: 1200, maxPerBooking: 10, description: 'Full conference access for all 3 days', isActive: true },
      { name: 'VIP', price: 4999, totalCapacity: 200, soldCount: 50, maxPerBooking: 2, description: 'VIP lounge access + networking dinner + speaker meetups', isActive: true },
    ],
    status: 'PUBLISHED', isFeatured: true, isTrending: true,
    termsAndConditions: 'No refunds after 7 days of purchase. ID proof required at entry. No outside food or beverages.',
    schedule: [
      { time: '09:00', title: 'Registration & Networking Breakfast', description: 'Check-in and morning networking' },
      { time: '10:00', title: 'Opening Keynote: Future of AI in India', description: 'By CEO of Google India' },
      { time: '12:00', title: 'Networking Lunch', description: 'Catered lunch + demo zone' },
      { time: '14:00', title: 'Panel: India\'s Startup Ecosystem', description: 'Leading founders and VCs discuss the future' },
      { time: '17:00', title: 'Closing Ceremony & Awards', description: 'Hackathon winners and closing notes' },
    ],
  },
  {
    title: 'Sunburn Festival 2025 – Electronic Music Night',
    description: 'Asia\'s biggest EDM festival returns to Pune! Experience 72 hours of non-stop electronic music featuring world-class DJs from across the globe. Multiple stages, art installations, food courts, and camping options. Artists include Martin Garrix, Hardwell, Nucleya, and 50+ more.',
    shortDescription: 'Asia\'s biggest EDM festival – 72 hours of non-stop music',
    category: 'Music',
    bannerImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop',
    startDate: new Date('2027-01-07'), endDate: new Date('2027-01-09'),
    startTime: '16:00', endTime: '04:00',
    venue: { name: 'Mawryngkneng Festival Grounds', address: 'Near Pune Airport, Lohegaon Road', city: 'Pune', state: 'Maharashtra', country: 'India', pincode: '411032', mapLink: 'https://maps.google.com/?q=Pune+Airport' },
    organizer: { name: 'Sunburn Events Pvt Ltd', email: 'info@sunburn.in', phone: '+91 9123456789', website: 'https://sunburn.in' },
    ticketTypes: [
      { name: 'General Admission', price: 2499, totalCapacity: 10000, soldCount: 7500, maxPerBooking: 10, isActive: true },
      { name: 'Premium', price: 5999, totalCapacity: 2000, soldCount: 1200, maxPerBooking: 6, description: 'Premium zone with elevated platform and better view', isActive: true },
      { name: 'VIP', price: 12999, totalCapacity: 500, soldCount: 300, maxPerBooking: 4, description: 'VIP area + artist meet & greet + exclusive lounge', isActive: true },
    ],
    status: 'PUBLISHED', isFeatured: true, isTrending: true,
    termsAndConditions: 'Must be 18+ to attend. Valid government ID required. No drugs or weapons.',
  },
  {
    title: 'Startup Summit Mumbai 2025',
    description: 'Connect with 200+ investors, 500+ founders, and ecosystem leaders at Mumbai\'s premier startup event. Pitch competitions with prize pool of ₹1 Crore, workshops on fundraising, product-market fit, scaling, and hiring. 50+ VCs attending.',
    shortDescription: 'Premier startup networking with ₹1Cr prize pool & 200+ investors',
    category: 'Business',
    bannerImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop',
    startDate: new Date('2026-12-28'), endDate: new Date('2026-12-29'),
    startTime: '09:30', endTime: '17:30',
    venue: { name: 'BKC Convention Centre', address: 'G Block, Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400051', mapLink: 'https://maps.google.com/?q=BKC+Convention+Centre+Mumbai' },
    organizer: { name: 'StartupIndia Foundation', email: 'events@startupindia.org', phone: '+91 9988776655' },
    ticketTypes: [
      { name: 'Founder Pass', price: 2999, totalCapacity: 500, soldCount: 380, maxPerBooking: 5, isActive: true },
      { name: 'Investor Pass', price: 0, totalCapacity: 200, soldCount: 180, maxPerBooking: 2, description: 'Free for verified investors. Contact us for verification.', isActive: true },
      { name: 'VIP Networking', price: 8999, totalCapacity: 100, soldCount: 60, maxPerBooking: 2, description: 'Private investor dinners + 1:1 VC meetings', isActive: true },
    ],
    status: 'PUBLISHED', isFeatured: true,
  },
  {
    title: 'Full Stack Development Bootcamp – Zero to Hero',
    description: 'Intensive 3-day bootcamp covering React.js, Node.js, MongoDB, and cloud deployment. Build 3 real-world projects under mentorship of senior engineers from top tech companies. Certificate of completion with LinkedIn verification. Limited seats for personalized attention.',
    shortDescription: '3-day intensive bootcamp: React, Node.js, MongoDB, Cloud',
    category: 'Education',
    bannerImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
    startDate: new Date('2026-12-22'), endDate: new Date('2026-12-24'),
    startTime: '10:00', endTime: '19:00',
    venue: { name: 'Innovation Hub Bangalore', address: '5th Cross, Koramangala 5th Block', city: 'Bangalore', state: 'Karnataka', country: 'India', pincode: '560034', mapLink: 'https://maps.google.com/?q=Koramangala+Bangalore' },
    organizer: { name: 'CodeAcademy India', email: 'training@codeacademy.in', phone: '+91 9123498765' },
    ticketTypes: [
      { name: 'Standard Seat', price: 4999, totalCapacity: 50, soldCount: 35, maxPerBooking: 2, isActive: true },
      { name: 'Premium (with Laptop)', price: 7999, totalCapacity: 20, soldCount: 12, maxPerBooking: 1, description: 'Includes loaner MacBook Pro for the duration', isActive: true },
    ],
    status: 'PUBLISHED',
  },
  {
    title: 'IPL Watch Party – RCB vs MI – Season Opener',
    description: 'Epic watch party for the most anticipated IPL season opener! Giant 20ft LED screen with surround sound, special RCB and MI fan zones, unlimited snacks, cricket trivia contests, and exciting prizes. DJ after-party till midnight!',
    shortDescription: 'Epic IPL Watch Party with 20ft LED screen & DJ after-party',
    category: 'Sports',
    bannerImage: 'https://images.unsplash.com/photo-1540747913346-19212a4f5a68?w=800&auto=format&fit=crop',
    startDate: new Date('2027-03-15'), endDate: new Date('2027-03-15'),
    startTime: '19:00', endTime: '23:30',
    venue: { name: 'The Sports Hub Whitefield', address: 'ITPL Main Road, Whitefield', city: 'Bangalore', state: 'Karnataka', country: 'India', pincode: '560066', mapLink: 'https://maps.google.com/?q=Whitefield+Bangalore' },
    organizer: { name: 'FanZone Events', email: 'hello@fanzone.in', phone: '+91 9800012345' },
    ticketTypes: [
      { name: 'General Entry', price: 499, totalCapacity: 300, soldCount: 250, maxPerBooking: 10, isActive: true },
      { name: 'VIP Lounge', price: 1499, totalCapacity: 50, soldCount: 20, maxPerBooking: 4, description: 'Premium recliner seats + unlimited food & drinks', isActive: true },
    ],
    status: 'PUBLISHED',
  },
  {
    title: 'UX Design Masterclass – Google Design Alumni',
    description: 'Hands-on workshop led by ex-Google Design team members. Learn design thinking, user research methodologies, wireframing, and high-fidelity prototyping in Figma. Solve a real-world product design challenge and receive portfolio-worthy case study.',
    shortDescription: 'Hands-on UX workshop by ex-Google Design team',
    category: 'Workshops',
    bannerImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&auto=format&fit=crop',
    startDate: new Date('2026-12-20'), endDate: new Date('2026-12-20'),
    startTime: '10:00', endTime: '17:00',
    venue: { name: 'Design Studio Hyderabad', address: 'Cyber Towers, Level 5, Hitech City', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500081', mapLink: 'https://maps.google.com/?q=Hitech+City+Hyderabad' },
    organizer: { name: 'DesignLab India', email: 'workshops@designlab.in', phone: '+91 9700234567' },
    ticketTypes: [
      { name: 'Participant', price: 1999, totalCapacity: 30, soldCount: 22, maxPerBooking: 2, isActive: true },
    ],
    status: 'PUBLISHED',
  },
  {
    title: 'Bollywood Night – 90s Nostalgia Concert',
    description: 'Relive the golden era of Bollywood with live performances of your all-time favorite 90s hits! Featuring renowned playback singers, retro dance troupes, Bollywood-themed photo booths, and nostalgic food stalls. Black-tie optional.',
    shortDescription: 'Live 90s Bollywood concert with legendary artists',
    category: 'Entertainment',
    bannerImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop',
    startDate: new Date('2027-02-22'), endDate: new Date('2027-02-22'),
    startTime: '18:00', endTime: '23:00',
    venue: { name: 'Jawaharlal Nehru Stadium', address: 'Lodhi Road, Near India Gate', city: 'Delhi', state: 'Delhi', country: 'India', pincode: '110003', mapLink: 'https://maps.google.com/?q=JLN+Stadium+Delhi' },
    organizer: { name: 'FilmFare Entertainment', email: 'events@filmfare.com', phone: '+91 9100098765' },
    ticketTypes: [
      { name: 'General', price: 999, totalCapacity: 5000, soldCount: 3500, maxPerBooking: 10, isActive: true },
      { name: 'Premium', price: 2499, totalCapacity: 1000, soldCount: 600, maxPerBooking: 6, isActive: true },
      { name: 'Gold', price: 4999, totalCapacity: 300, soldCount: 100, maxPerBooking: 4, description: 'Gold zone + backstage pass + artist selfie', isActive: true },
    ],
    status: 'PUBLISHED', isFeatured: true,
  },
  {
    title: 'AI Summit India 2025 – The Future of Intelligence',
    description: 'India\'s most prestigious AI conference bringing together researchers, engineers, and C-suite leaders. Topics: Generative AI, Large Language Models, Computer Vision, Robotics, AI Ethics, Responsible AI, and AI in Healthcare & Finance.',
    shortDescription: 'India\'s most prestigious AI & ML conference',
    category: 'Conferences',
    bannerImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop',
    startDate: new Date('2027-04-05'), endDate: new Date('2027-04-06'),
    startTime: '09:00', endTime: '18:00',
    venue: { name: 'The Leela Ambience Gurugram', address: 'DLF Cyber City, Sector 24', city: 'Gurugram', state: 'Haryana', country: 'India', pincode: '122002', mapLink: 'https://maps.google.com/?q=Leela+Ambience+Gurugram' },
    organizer: { name: 'AI India Foundation', email: 'summit@aiindia.org', phone: '+91 9900123456' },
    ticketTypes: [
      { name: 'Academic', price: 1499, totalCapacity: 300, soldCount: 200, maxPerBooking: 3, description: 'For students and researchers with valid ID', isActive: true },
      { name: 'Professional', price: 4999, totalCapacity: 500, soldCount: 350, maxPerBooking: 5, isActive: true },
      { name: 'Corporate', price: 9999, totalCapacity: 100, soldCount: 60, maxPerBooking: 2, description: 'Table for 2 + private roundtable with AI leaders', isActive: true },
    ],
    status: 'PUBLISHED', isFeatured: true, isTrending: true,
  },
  {
    title: 'Tech & Finance Networking Night – Chennai',
    description: 'Monthly high-quality networking event for professionals in tech, finance, consulting, and entrepreneurship. Structured speed-networking sessions, 5-minute lightning talks, and open bar. Meet your next co-founder, investor, or career mentor.',
    shortDescription: 'Premium monthly networking for tech & finance leaders',
    category: 'Networking',
    bannerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop',
    startDate: new Date('2027-01-28'), endDate: new Date('2027-01-28'),
    startTime: '18:30', endTime: '21:30',
    venue: { name: 'The Park Chennai', address: '601 Anna Salai, Teynampet', city: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600006', mapLink: 'https://maps.google.com/?q=The+Park+Chennai' },
    organizer: { name: 'TiE Chennai Chapter', email: 'events@tiechenai.org', phone: '+91 9700087654' },
    ticketTypes: [
      { name: 'Standard', price: 799, totalCapacity: 150, soldCount: 100, maxPerBooking: 5, isActive: true },
      { name: 'Premium', price: 1499, totalCapacity: 50, soldCount: 20, maxPerBooking: 2, description: 'VIP table + priority seating + open bar', isActive: true },
    ],
    status: 'PUBLISHED',
  },
  {
    title: 'React Native & Flutter Workshop – Build Real Apps',
    description: 'Build cross-platform mobile applications in this 2-day intensive workshop. Cover React Native CLI, Expo, state management (Redux Toolkit), REST API integration, Firebase, and deployment to Google Play Store. Build 2 complete apps!',
    shortDescription: 'Build real cross-platform apps with React Native & Flutter',
    category: 'Workshops',
    bannerImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop',
    startDate: new Date('2027-03-08'), endDate: new Date('2027-03-09'),
    startTime: '10:00', endTime: '18:00',
    venue: { name: 'T-Hub Hyderabad', address: 'T-Hub, IIIT Hyderabad Campus, Gachibowli', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500032', mapLink: 'https://maps.google.com/?q=T-Hub+Hyderabad' },
    organizer: { name: 'MobileDev Academy', email: 'workshops@mobiledev.in', phone: '+91 9800145678' },
    ticketTypes: [
      { name: 'Individual', price: 2999, totalCapacity: 40, soldCount: 28, maxPerBooking: 2, isActive: true },
      { name: 'Team (3 people)', price: 7499, totalCapacity: 10, soldCount: 5, maxPerBooking: 1, description: 'Group registration for teams of 3', isActive: true },
    ],
    status: 'PUBLISHED',
  },
  {
    title: 'Mumbai Marathon 2025 – Run for Education',
    description: 'Join 50,000 runners for Mumbai\'s iconic annual marathon! Categories: 42km Full Marathon, 21km Half Marathon, 10km Citizen Run, and 3km Family Run. All proceeds fund education for underprivileged children across Maharashtra.',
    shortDescription: 'Mumbai\'s iconic marathon – 50,000 runners, run for a cause!',
    category: 'Sports',
    bannerImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop',
    startDate: new Date('2027-04-13'), endDate: new Date('2027-04-13'),
    startTime: '05:30', endTime: '12:00',
    venue: { name: 'CST Railway Station', address: 'Chhatrapati Shivaji Terminus, Fort', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400001', mapLink: 'https://maps.google.com/?q=CST+Mumbai' },
    organizer: { name: 'Mumbai Marathon Foundation', email: 'info@mumbaimarathon.com', phone: '+91 9900234567' },
    ticketTypes: [
      { name: '3km Family Run', price: 599, totalCapacity: 10000, soldCount: 8000, maxPerBooking: 10, isActive: true },
      { name: '21km Half Marathon', price: 1299, totalCapacity: 5000, soldCount: 4200, maxPerBooking: 5, isActive: true },
      { name: '42km Full Marathon', price: 1999, totalCapacity: 2000, soldCount: 1500, maxPerBooking: 3, isActive: true },
    ],
    status: 'PUBLISHED', isFeatured: true,
  },
  {
    title: 'Dastaan-e-India – Cultural Heritage Festival',
    description: 'A 3-day cultural extravaganza celebrating India\'s rich heritage through folk music performances, classical dance recitals, traditional crafts exhibitions, authentic cuisine from all 28 states, and live storytelling sessions by master storytellers.',
    shortDescription: 'Celebrating India\'s heritage through music, dance, craft & cuisine',
    category: 'Cultural',
    bannerImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop',
    startDate: new Date('2027-03-28'), endDate: new Date('2027-03-30'),
    startTime: '11:00', endTime: '21:00',
    venue: { name: 'Pragati Maidan Exhibition Ground', address: 'Pragati Maidan, Bhairon Marg, Mathura Road', city: 'Delhi', state: 'Delhi', country: 'India', pincode: '110001', mapLink: 'https://maps.google.com/?q=Pragati+Maidan+Delhi' },
    organizer: { name: 'Sanskriti Events', email: 'events@sanskriti.in', phone: '+91 9800056789' },
    ticketTypes: [
      { name: 'Day Pass', price: 299, totalCapacity: 10000, soldCount: 5000, maxPerBooking: 10, isActive: true },
      { name: '3-Day Festival Pass', price: 699, totalCapacity: 3000, soldCount: 1500, maxPerBooking: 6, description: 'All 3 days + exclusive artisan workshop', isActive: true },
    ],
    status: 'PUBLISHED',
  },
];

async function seedAll() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB:', MONGODB_URI);

    const User = require('../models/User');
    const Event = require('../models/Event');
    const Booking = require('../models/Booking');
    const Payment = require('../models/Payment');
    const Notification = require('../models/Notification');
    const Attendance = require('../models/Attendance');

    // ── Demo User ──────────────────────────────────────────────
    const demoUserEmail = process.env.DEMO_USER_EMAIL || 'pushkarrajput108@gmail.com';
    const demoUserPass = process.env.DEMO_USER_PASSWORD || 'Pushkar@123456';
    let demoUser = await User.findOne({ email: demoUserEmail });
    if (!demoUser) {
      demoUser = await User.create({ fullName: 'Pushkar Rajput', email: demoUserEmail, password: demoUserPass, role: 'USER', isEmailVerified: true, mobile: '+91 9876543210' });
      console.log('✅ Demo user created:', demoUserEmail);
    } else {
      console.log('ℹ️  Demo user already exists:', demoUserEmail);
    }

    // ── Admin ──────────────────────────────────────────────────
    const adminEmail = process.env.DEMO_ADMIN_EMAIL || 'admin004@gmail.com';
    const adminPass = process.env.DEMO_ADMIN_PASSWORD || 'admin@2004';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({ fullName: 'EventNest Admin', email: adminEmail, password: adminPass, role: 'ADMIN', isEmailVerified: true, mobile: '+91 9000012345' });
      console.log('✅ Admin created:', adminEmail);
    } else {
      console.log('ℹ️  Admin already exists:', adminEmail);
    }

    // ── Sample Events ──────────────────────────────────────────
    let seededEvents = [];
    for (const eventData of sampleEvents) {
      let existing = await Event.findOne({ title: eventData.title });
      if (!existing) {
        const slug = eventData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
        existing = await Event.create({ ...eventData, slug, createdBy: admin._id });
        console.log('✅ Event created:', existing.title);
      } else {
        console.log('ℹ️  Event exists:', existing.title);
      }
      seededEvents.push(existing);
    }

    // ── Sample Bookings for Demo User ─────────────────────────
    const { generateQRCode } = require('../utils/generateQR');
    const bookingTargets = seededEvents.filter(e => e.status === 'PUBLISHED').slice(0, 3);
    for (const event of bookingTargets) {
      const existingBooking = await Booking.findOne({ user: demoUser._id, event: event._id });
      if (!existingBooking && event.ticketTypes && event.ticketTypes.length > 0) {
        const ticketType = event.ticketTypes[0];
        const quantity = 2;
        const subtotal = ticketType.price * quantity;
        const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
        const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
        const booking = await Booking.create({
          user: demoUser._id, event: event._id,
          ticketTypeId: ticketType._id, ticketTypeName: ticketType.name,
          quantity, pricePerTicket: ticketType.price, subtotal, taxAmount, totalAmount,
          status: 'CONFIRMED', paymentStatus: 'COMPLETED',
        });
        const qrCodeUrl = await generateQRCode({ bookingId: booking.bookingId, qrToken: booking.qrToken, eventId: event._id.toString() });
        booking.qrCodeUrl = qrCodeUrl;
        await booking.save();
        await Payment.create({
          paymentId: 'MOCK_SEED_' + Date.now() + '_' + Math.random().toString(36).substr(2,4),
          booking: booking._id, user: demoUser._id, event: event._id,
          amount: totalAmount, method: 'MOCK', status: 'COMPLETED', isMock: true, paidAt: new Date(),
        });
        await Attendance.findOneAndUpdate(
          { booking: booking._id },
          { booking: booking._id, user: demoUser._id, event: event._id, status: 'NOT_YET' },
          { upsert: true }
        );
        await Notification.create({ user: demoUser._id, title: 'Booking Confirmed! 🎉', message: `Your booking for ${event.title} is confirmed. QR ticket is ready!`, type: 'BOOKING', data: { bookingId: booking._id } });
        console.log('✅ Sample booking created for:', event.title);
      } else if (existingBooking) {
        console.log('ℹ️  Booking exists for:', event.title);
      }
    }

    console.log('');
    console.log('🎉 ═══════════════════════════════════════════');
    console.log('🎉  EventNest Database Seeding Complete!');
    console.log('🎉 ═══════════════════════════════════════════');
    console.log('');
    console.log('📧 DEMO USER:');
    console.log('   Email   :', demoUserEmail);
    console.log('   Password:', demoUserPass);
    console.log('   Role    : USER');
    console.log('');
    console.log('🔐 ADMIN:');
    console.log('   Email   :', adminEmail);
    console.log('   Password:', adminPass);
    console.log('   Role    : ADMIN');
    console.log('   URL     : http://localhost:5173');
    console.log('');
    console.log(`📅 Events seeded: ${seededEvents.length}`);
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedAll();
