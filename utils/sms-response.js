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
  resp.message(`Reply with a docket number to sign up for a reminder. Docket numbers look like 3 sets of numbers or characters. For example: 123-45-67 or 123-CR-45.`);
  return resp;
};

const caseNotFound = (docket) => {
  var resp = new MessagingResponse();
  resp.message(`We did not find any cases with that docket you were looking for`);
  return resp;
};

const caseFound = (cases) => {
  var resp = new MessagingResponse();

  let message = `We found ${cases.length} case${cases.length > 1 ? 's' : ''}.\nReply with a # if you would like a courtesy reminder the day before or reply with NO to start over.\n`;
  cases.forEach((c,i) => {
    message += `\n${i+1} - ${moment(c.date).format('l LT')} @ ${c.street} ${c.city}, VT\n`;
  })
  resp.message(message);

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