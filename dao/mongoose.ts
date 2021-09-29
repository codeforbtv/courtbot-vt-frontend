import mongoose, { Connection, Model } from 'mongoose';
import { Notification, Reminder } from '../types';

let conn:Connection;
let NotificationDao:Model<Notification>;
let ReminderDao:Model<Reminder>;

const NotificationSchema = new mongoose.Schema<Notification>({
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

const ReminderSchema = new mongoose.Schema<Reminder>({
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
    conn = await mongoose.createConnection(process.env.MONGODB_URI || '', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    NotificationDao = conn.model<Notification>('Notification', NotificationSchema);
    ReminderDao = conn.model<Reminder>('Reminder', ReminderSchema);
  }
}

export {
  initialize,
  NotificationDao,
  ReminderDao,
};