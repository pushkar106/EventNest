const BASE = process.env.API_URL || 'http://localhost:5000/api';

async function req(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(`${method} ${path} -> ${res.status} ${json.message || JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  console.log('Testing', BASE);
  const health = await req('/health');
  console.log('✓ health', health.status || health.app);

  const userLogin = await req('/auth/login', {
    method: 'POST',
    body: { email: process.env.DEMO_USER_EMAIL || 'pushkarrajput108@gmail.com', password: process.env.DEMO_USER_PASSWORD || 'Pushkar@123456' },
  });
  console.log('✓ user login', userLogin.data.user.email);
  const userToken = userLogin.data.accessToken;

  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: { email: process.env.DEMO_ADMIN_EMAIL || 'admin004@gmail.com', password: process.env.DEMO_ADMIN_PASSWORD || 'admin@2004' },
  });
  if (!['ADMIN', 'SUPER_ADMIN'].includes(adminLogin.data.user.role)) throw new Error('Admin role missing');
  console.log('✓ admin login', adminLogin.data.user.role);
  const adminToken = adminLogin.data.accessToken;

  const events = await req('/events?limit=5');
  if (!events.data.events.length) throw new Error('No events seeded');
  console.log('✓ events', events.data.events.length);
  const event = events.data.events[0];
  const ticket = event.ticketTypes[0];

  const booking = await req('/bookings', {
    method: 'POST',
    token: userToken,
    body: { eventId: event._id, ticketTypeId: ticket._id, quantity: 1 },
  });
  console.log('✓ booking', booking.data.booking.bookingId);

  await req('/payments/create-order', { method: 'POST', token: userToken, body: { bookingId: booking.data.booking._id } });
  const paid = await req('/payments/mock-complete', { method: 'POST', token: userToken, body: { bookingId: booking.data.booking._id } });
  if (paid.data.booking.status !== 'CONFIRMED') throw new Error('Booking not confirmed after mock pay');
  if (!paid.data.booking.qrToken) throw new Error('QR token missing');
  console.log('✓ mock payment + QR', paid.data.booking.status);

  const mine = await req('/bookings/my', { token: userToken });
  console.log('✓ my tickets', mine.data.bookings.length);

  const dash = await req('/admin/dashboard', { token: adminToken });
  console.log('✓ dashboard revenue', dash.data.stats.totalRevenue);

  const adminBookings = await req('/admin/bookings', { token: adminToken });
  console.log('✓ admin bookings', adminBookings.data.total);

  const verify = await req('/attendance/verify-qr', {
    method: 'POST',
    token: adminToken,
    body: { qrToken: paid.data.booking.qrToken, eventId: event._id },
  });
  console.log('✓ QR verify', verify.message);

  try {
    await req('/attendance/verify-qr', {
      method: 'POST',
      token: adminToken,
      body: { qrToken: paid.data.booking.qrToken, eventId: event._id },
    });
    throw new Error('Duplicate check-in should fail');
  } catch (e) {
    if (!String(e.message).includes('Already checked in') && !String(e.message).includes('400')) throw e;
    console.log('✓ duplicate check-in blocked');
  }

  console.log('\nAll API tests passed.');
}

main().catch((err) => {
  console.error('API TEST FAILED:', err.message);
  process.exit(1);
});
