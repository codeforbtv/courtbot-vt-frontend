import { serialize } from 'cookie';
import dbConnect from '../../../utils/db-connect';
import smsResponse from '../../../utils/sms-response';
import Case from '../../../models/case';
import Reminder from '../../../models/reminder';
import testCase from '../../../utils/test-case';
import logger from '../../../utils/logger';

const maxAge = 60 * 60; // 1 hour
const docketRegex = /.+-.+-.+/;

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
          let cases = await Case.find({ docket: docketRequest }).lean().exec();

          // if the docket number is the test case, then lets create a test case
          if (docketRequest === 'testcase' && !cases) {
            cases = [await testCase.createCase()];
          }

          // if case was found then let's proceed to the next state
          if (cases && cases.length > 0) {
            // make sure cases is an array
            if (!Array.isArray(cases)) {
              cases = [cases];
            }

            res.setHeader('Set-Cookie', [
              serialize('state', String('case_found'), { maxAge }),
              serialize('cases', String(JSON.stringify(cases)), { maxAge }),
            ]);
            res.send(smsResponse.caseFound(cases).toString());
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
        const cases = JSON.parse(req.cookies.cases);
        // get the text response
        const response = message.trim().toLowerCase();
        // parse the number out of the response
        // we'll do a check later to see if it was a valid number
        const index = parseInt(response) - 1;

        // no reminder, but let's send information their way
        if (response === 'no') {
          res.send(smsResponse.reminderNo().toString());
        }
        // create a reminder if a valid number was given
        else if (response === parseInt(response).toString() && index >= 0 && index < cases.length) {
          const c = cases[index];
          res.send(smsResponse.reminderYes(c).toString());

          // create a new reminder
          Reminder.create({
            docket: c.docket,
            phone,
          });
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