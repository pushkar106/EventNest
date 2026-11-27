const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  totalCapacity: { type: Number, required: true, min: 1 },
  soldCount: { type: Number, default: 0 },
  maxPerBooking: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  category: { type: String, required: true, enum: ['Technology','Music','Business','Education','Sports','Workshops','Entertainment','Cultural','Conferences','Networking'] },
  tags: [String],
  bannerImage: { type: String, default: null },
  images: [String],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String },
  endTime: { type: String },
  venue: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, default: 'India' },
    pincode: { type: String },
    mapLink: { type: String },
  },
  organizer: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    logo: { type: String },
  },
  ticketTypes: [ticketTypeSchema],
  status: { type: String, enum: ['DRAFT','PUBLISHED','SOLD_OUT','COMPLETED','CANCELLED'], default: 'DRAFT' },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  bookingCount: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  termsAndConditions: { type: String },
  schedule: [{ time: String, title: String, description: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ 'venue.city': 1 });
eventSchema.index({ isFeatured: 1 });

eventSchema.virtual('minPrice').get(function() {
  if (!this.ticketTypes || this.ticketTypes.length === 0) return 0;
  const active = this.ticketTypes.filter(t => t.isActive);
  if (active.length === 0) return 0;
  return Math.min(...active.map(t => t.price));
});

eventSchema.virtual('totalCapacity').get(function() {
  if (!this.ticketTypes) return 0;
  return this.ticketTypes.reduce((sum, t) => sum + t.totalCapacity, 0);
});

eventSchema.virtual('totalSold').get(function() {
  if (!this.ticketTypes) return 0;
  return this.ticketTypes.reduce((sum, t) => sum + t.soldCount, 0);
});

eventSchema.virtual('availableSeats').get(function() {
  return (this.totalCapacity || 0) - (this.totalSold || 0);
});

module.exports = mongoose.model('Event', eventSchema);
