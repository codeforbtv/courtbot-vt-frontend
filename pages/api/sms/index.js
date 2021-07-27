import { serialize } from 'cookie';
import dbConnect from '../../../utils/db-connect';
import smsResponse from '../../../utils/sms-response';
import Case from '../../../models/case';
import Reminder from '../../../models/reminder';

import logger from '../../../utils/logger';

const maxAge = 60 * 60; // 1 hour
const docketRegex = /\d+-\d+-\d+/;

const handleText = async (req, res, message, phone) => {
  try {
    // clear all cookies
    res.setHeader('Set-Cookie', [
      serialize('state', '', { maxAge: -1 }),
      serialize('case', '', { maxAge: -1 }),
    ]);
    // get the state from the cookie if it exists
    const state = req.cookies.state || 'idle';

    logger.info(`${phone} [${state}]: ${message}`);

    // set the response to type xml
    res.setHeader('Content-Type', 'text/xml');

    // based on the state we perform certain actions / responses
    switch (state) {
      default:
      case 'idle':
        // get the docket number from the text
        const docketRequest = message.trim().toLowerCase();

        // see if the docket number matches the testcase or the regex
        if (docketRegex.test(docketRequest) || docketRequest === 'testcase') {
          // find the case from the database
          let c = await Case.findOne({ docket: docketRequest });

          // if the docket number is the test case, then lets create a test case
          if (docketRequest === 'testcase' && !c) {
            c = new Case({
              docket: 'testcase',
              date: Date.now(),
              street: '65 State Street',
              city: 'Montpelier',
            });

            c.save();
          }

          // if case was found then let's proceed to the next state
          if (c) {
            res.setHeader('Set-Cookie', [
              serialize('state', String('case_found'), { maxAge }),
              serialize('case', String(JSON.stringify(c)), { maxAge }),
            ]);
            res.send(smsResponse.caseFound(c).toString());
          }
          // case not found
          else {
            res.send(smsResponse.caseNotFound().toString());
          }
        }
        // send help response
        else {
          res.send(smsResponse.help().toString());
        }
        break;
      case 'case_found':
        // get the case from the cookie
        const c = JSON.parse(req.cookies.case);
        // get the text response
        const response = message.trim().toLowerCase();

        // create a reminder
        if (response === 'yes') {
          res.send(smsResponse.reminderYes(c).toString());

          // create a new reminder
          Reminder.create({
            docket: c.docket,
            phone,
          });
        }
        // no reminder, but let's send information their way
        else if (response === 'no') {
          res.send(smsResponse.reminderNo().toString());
        }
        // send help due to unexpected response
        else {
          res.send(smsResponse.help().toString());
        }
        break;
    }
  } catch (error) {
    logger.error(error);
    res.send(smsResponse.error().toString());
  }
}

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req

  switch (method) {
    case 'POST':
      await handleText(req, res, req.body.Body, req.body.From);
      break;
    case 'GET':
      await handleText(req, res, req.query.text, process.env.TWILIO_PHONE_NUMBER);
      break;
    default:
      res
        .status(400)
        .json({ success: false });
      break;
  }
  res.end();
};