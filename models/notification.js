import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  docket: {
    type: String,
    required: true,
    index: true,
  },
  county: {
    type: String,
    required: true,
    index: true,
  },
  division: {
    type: String,
    required: true,
    index: true,
  },
  phone: {
    type: String,
    required: true,
    index: true,
  },
  event_date: {
    type: Date,
    required: true,
  },
  error: {
    type: String,
  },
},{
  timestamps: true,
});

NotificationSchema.index({ docket: 1, county: 1, division: 1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);