import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
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
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
},{
  timestamps: true,
});

export default mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);