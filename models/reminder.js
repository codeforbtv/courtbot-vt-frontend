import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
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
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
},{
  timestamps: true,
});

ReminderSchema.index({ docket: 1, county: 1, division: 1 });

export default mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);