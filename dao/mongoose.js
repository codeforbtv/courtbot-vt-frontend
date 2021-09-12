import mongoose from 'mongoose';

let conn;
let NotificationDao;
let ReminderDao;

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

async function initialize() {
  if (conn == null) {
    conn = await mongoose.createConnection(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    NotificationDao = conn.model('Notification', NotificationSchema);
    ReminderDao = conn.model('Reminder', ReminderSchema);
  }
}

export {
  initialize,
  NotificationDao,
  ReminderDao,
};