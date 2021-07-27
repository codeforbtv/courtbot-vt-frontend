import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  docket: {
    type: String,
    required: true,
    index: true,
  },
  phone: {
    type: String,
    required: true,
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

export default mongoose.models.NotificationSchema || mongoose.model('NotificationSchema', NotificationSchema);