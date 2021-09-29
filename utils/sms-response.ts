import moment from 'moment-timezone';
import { Case } from '../types';
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const error = () => {
  var resp = new MessagingResponse();
  resp.message(`Sorry something went wrong`);
  return resp;
};

const help = (helpText:string) => {
  var resp = new MessagingResponse();
  resp.message(helpText);
  return resp;
};

const caseNotFound = (number:string) => {
  var resp = new MessagingResponse();
  resp.message(`We did not find any cases that match ${number}`);
  return resp;
};

const caseFound = (cases:Case[], timezone = 'America/New_York') => {
  var resp = new MessagingResponse();

  let message = `We found ${cases.length} case${cases.length > 1 ? 's' : ''}.\nReply with a # if you would like a courtesy reminder the day before or reply with NO to start over.\n`;
  cases.forEach((c,i) => {
    message += `\n${i+1} - ${moment(c.date).tz(timezone).format('l LT')} @ ${c.address}\n`;
  });
  resp.message(message);

  return resp;
};

const reminderYes = (c:Case) => {
  var resp = new MessagingResponse();
  resp.message(`Reminder set for case (${c.number})`);
  return resp;
};

const reminderNo = (website:string) => {
  var resp = new MessagingResponse();
  resp.message(`You said no so we won't text you a reminder. You can always go to ${website} for more information about your case.`);
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