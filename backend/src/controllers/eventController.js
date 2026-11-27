const Event = require('../models/Event');
const { sendSuccess, sendError } = require('../utils/response');

const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, city, search, sort = 'startDate', status = 'PUBLISHED', featured, trending } = req.query;
    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (city) query['venue.city'] = { $regex: city, $options: 'i' };
    if (featured === 'true') query.isFeatured = true;
    if (trending === 'true') query.isTrending = true;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'venue.city': { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
    const sortObj = {};
    if (sort === 'startDate') sortObj.startDate = 1;
    else if (sort === 'newest') sortObj.createdAt = -1;
    else if (sort === 'popular') sortObj.bookingCount = -1;
    else sortObj.startDate = 1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [events, total] = await Promise.all([
      Event.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Event.countDocuments(query),
    ]);
    return sendSuccess(res, { events, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }, 'Events fetched');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({ isFeatured: true, status: 'PUBLISHED' }).limit(10);
    return sendSuccess(res, { events }, 'Featured events');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }, { new: true });
    if (!event) return sendError(res, 'Event not found', 404);
    return sendSuccess(res, { event }, 'Event details');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const createEvent = async (req, res) => {
  try {
    const slug = req.body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
    const event = await Event.create({ ...req.body, slug, createdBy: req.user._id });
    return sendSuccess(res, { event }, 'Event created', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return sendError(res, 'Event not found', 404);
    return sendSuccess(res, { event }, 'Event updated');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return sendError(res, 'Event not found', 404);
    return sendSuccess(res, null, 'Event deleted');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const publishEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return sendError(res, 'Event not found', 404);
    event.status = event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await event.save();
    return sendSuccess(res, { event }, `Event ${event.status === 'PUBLISHED' ? 'published' : 'unpublished'}`);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const featureEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return sendError(res, 'Event not found', 404);
    event.isFeatured = !event.isFeatured;
    await event.save();
    return sendSuccess(res, { event }, `Event ${event.isFeatured ? 'featured' : 'unfeatured'}`);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = { getEvents, getFeaturedEvents, getEventById, createEvent, updateEvent, deleteEvent, publishEvent, featureEvent };
