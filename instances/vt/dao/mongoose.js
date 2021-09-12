import mongoose from 'mongoose';

let conn;
let EventDao;

const EventSchema = new mongoose.Schema({
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
  subdivision: {
    type: String,
  },
},{
  timestamps: true,
});

EventSchema.index({ docket: 1, county: 1, division: 1 }, { unique: true });

async function initialize() {
  if (conn == null) {
    conn = await mongoose.createConnection(process.env.VT_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    EventDao = conn.model('Event', EventSchema);
  }
}

export {
  initialize,
  EventDao,
};