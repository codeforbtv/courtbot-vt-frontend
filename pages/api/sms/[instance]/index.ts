import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie';
import smsResponse from '../../../../utils/sms-response';
import logger from '../../../../utils/logger';
import checkBasicAuth from '../../../../utils/basic-auth';
import { getInstanceMethods } from '../../../../types/i-instance-methods';
import { initialize, ReminderDao } from '../../../../dao/mongoose';

const maxAge = 60 * 60; // 1 hour

const handleText = async (req:NextApiRequest, res:NextApiResponse, message:string, phone:string) => {
  await initialize();
  const { instance } = req.query;
  const instanceMethods = await getInstanceMethods(Array.isArray(instance) ? instance[0]: instance);
  try {
    // clear all cookies
    res.setHeader('Set-Cookie', [
      serialize('state', '', { maxAge: -1 }),
      serialize('case', '', { maxAge: -1 }),
    ]);
    // get the state from the cookie if it exists
    const state = req.cookies.state || 'idle';

    logger.info(`${phone} (${instance})[${state}]: ${message}`);

    // set the response to type xml
    res.setHeader('Content-Type', 'text/xml');

    // based on the state we perform certain actions / responses
    switch (state) {
      default:
      case 'idle':
        // get the case number from the text
        const caseNumber = message.trim().toLowerCase();

        // see if the case number matches the testcase or the regex
        if (instanceMethods.getNumberRegex().test(caseNumber) || caseNumber === 'testcase') {
          let cases;

          // if the case number is the test case then lets get one
          if (caseNumber === 'testcase') {
            cases = [instanceMethods.getTestCase()];
          }
          // find future cases by number
          else {
            cases = await instanceMethods.findAll({
              number: caseNumber,
              startDate: new Date(),
            });
          }

          // if case was found then let's proceed to the next state
          if (cases.length > 0) {
            // make sure cases is an array
            if (!Array.isArray(cases)) {
              cases = [cases];
            }

            res.setHeader('Set-Cookie', [
              serialize('state', String('case_found'), { maxAge }),
              serialize('cases', String(JSON.stringify(cases)), { maxAge }),
            ]);
            res.send(smsResponse.caseFound(cases, instanceMethods.getTimezone()).toString());
          }
          // case not found
          else {
            res.send(smsResponse.caseNotFound(caseNumber).toString());
          }
        }
        // send help response
        else {
          res.send(smsResponse.help(instanceMethods.getHelpText()).toString());
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
          res.send(smsResponse.reminderNo(instanceMethods.getWebsite()).toString());
        }
        // create a reminder if a valid number was given
        else if (response === parseInt(response).toString() && index >= 0 && index < cases.length) {
          const c = cases[index];

          // create a new reminder
          await ReminderDao.create({
            uid: c.uid,
            number: c.number,
            phone,
          });

          res.send(smsResponse.reminderYes(c).toString());
        }
        // send help due to unexpected response
        else {
          res.send(smsResponse.help(instanceMethods.getHelpText()).toString());
        }
        break;
    }
  } catch (error) {
    logger.error(error);
    res.send(smsResponse.error().toString());
  }
}

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  if (await checkBasicAuth(req, res)) {
    const { method } = req
  
    switch (method) {
      case 'POST':
        await handleText(req, res, req.body.Body, req.body.From);
        break;
      case 'GET':
        await handleText(req, res, Array.isArray(req.query.text) ? req.query.text[0] : req.query.text, process.env.TWILIO_PHONE_NUMBER || '');
        break;
      default:
        res
          .status(400)
          .json({ success: false });
        break;
    }  
  }

  res.end();
};