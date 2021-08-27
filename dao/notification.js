import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    index: true,
  },
  number: {
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

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);