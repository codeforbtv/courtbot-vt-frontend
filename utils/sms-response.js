import moment from 'moment';
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const VERMONT_COURT_SITE = `https://www.vermontjudiciary.org/court-hearings`;

const error = () => {
  var resp = new MessagingResponse();
  resp.message(`Sorry something went wrong`);
  return resp;
};

const help = () => {
  var resp = new MessagingResponse();
  resp.message(`Reply with a case number to sign up for a reminder. Case numbers look like 3 sets of number. For example: 123-45-67.`);
  return resp;
};

const caseNotFound = (docket) => {
  var resp = new MessagingResponse();
  resp.message(`We did not find the case you were looking for`);
  return resp;
};

const caseFound = (c) => {
  var resp = new MessagingResponse();
  resp.message(`We found a case docket (${c.docket}) scheduled on ${moment(c.date).format('LLL')}, at ${c.street} ${c.city}. Would you like a courtesy reminder the day before? (reply YES or NO)`);
  return resp;
};

const reminderYes = (c) => {
  var resp = new MessagingResponse();
  resp.message(`Reminder set for case docket (${c.docket})`);
  return resp;
};

const reminderNo = (c) => {
  var resp = new MessagingResponse();
  resp.message(`You said no so we won't text you a reminder. You can always go to ${VERMONT_COURT_SITE} for more information about your case.`);
  return resp;
};

export default {
  caseNotFound,
  caseFound,
  error,
  help,
  reminderNo,
  reminderYes,
};