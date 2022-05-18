import mongoose, { Connection, Model } from 'mongoose';

let conn:Connection;
let EventDao:Model<Event>;

export interface Event {
  _id: string;
  date: Date;
  county: {
      code: string;
      name: string;
  },
  division: string;
  judge: {
      code: string;
      name: string;
  },
  court_room_code: string;
  hearing: {
      date: string;
      start_time: string;
      type_code: string;
      type: string;
  },
  doc_id: string;
  docket_number: string;
  case: {
      name: string;
      status: string;
      type: string;
  },
  litigant: {
      entity_id: string;
      last_name: string;
      first_name: string;
      full_name: string;
      role: {
          code: string;
          rank: string;
          description: string;
      },
      number: string;
  },
  attorney: {
      entity_id: string;
      last_name: string;
      first_name: string;
      suffix: string;
      full_name: string;
  },
  calendar_id: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new mongoose.Schema<Event>({
  _id: String,
  date: {
    type: Date,
    required: true,
    index: true,
  },
  county: {
      code: String,
      name: String,
  },
  division: String,
  judge: {
      code: String,
      name: String,
  },
  court_room_code: String,
  hearing: {
      date: String,
      start_time: String,
      type_code: String,
      type: String,
  },
  doc_id: String,
  docket_number: {
    type: String,
    required: true,
    index: true,
  },
  case: {
      name: String,
      status: String,
      type: String,
  },
  litigant: {
      entity_id: String,
      last_name: String,
      first_name: String,
      full_name: String,
      role: {
          code: String,
          rank: String,
          description: String,
      },
      number: String,
  },
  attorney: {
      entity_id: String,
      last_name: String,
      first_name: String,
      suffix: String,
      full_name: String,
  },
  calendar_id: String,
},{
  timestamps: true,
  collection: process.env.VT_MONGODB_EVENTS_COLLECTION_NAME || 'events',
});

async function initialize() {
  if (conn == null) {
    conn = await mongoose.createConnection(process.env.VT_MONGODB_URI || '', {
      useCreateIndex: true,
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