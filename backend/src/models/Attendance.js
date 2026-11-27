const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, enum: ['PRESENT','ABSENT','NOT_YET'], default: 'NOT_YET' },
  checkedInAt: { type: Date },
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationMethod: { type: String, enum: ['QR','MANUAL'], default: 'QR' },
}, { timestamps: true });

attendanceSchema.index({ booking: 1 });
attendanceSchema.index({ event: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
