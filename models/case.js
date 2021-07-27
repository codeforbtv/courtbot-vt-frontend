import mongoose from 'mongoose';

const CaseSchema = new mongoose.Schema({
  docket: {
    type: String,
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  county: {
    type: String,
  },
  court_room: {
    type: String,
  },
  hearing_type: {
    type: String,
  },
  day_of_week: {
    type: String,
  },
  day: {
    type: String,
  },
  month: {
    type: String,
  },
  time: {
    type: String,
  },
  am_pm: {
    type: String,
  },
  street: {
    type: String,
  },
  city: {
    type: String,
  },
  zip_code: {
    type: String,
  },
  division: {
    type: String,
  },
},{
  timestamps: true,
});

export default mongoose.models.Case || mongoose.model('Case', CaseSchema);