import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie';
import smsResponse from '../../../../utils/sms-response';
import logger from '../../../../utils/logger';
import checkBasicAuth from '../../../../utils/basic-auth';
import { getInstanceMethods } from '../../../../types/i-instance-methods';
import { initialize, ReminderDao } from '../../../../dao/mongoose';

const maxAge = 60 * 15; // 10 minutes

const handleText = async (req:NextApiRequest, res:NextApiResponse, input:string, phone:string) => {
  await initialize();
  const { instance } = req.query;
  const instanceMethods = await getInstanceMethods(Array.isArray(instance) ? instance[0]: instance);
  const cookies = req.cookies;
  try {
    // clear all cookies
    res.setHeader('Set-Cookie', [
      serialize('state', '', { maxAge: -1 }),
      serialize('case', '', { maxAge: -1 }),
    ]);
    // get the state from the cookie if it exists
    const state = cookies.state || 'idle';

    logger.debug(`${phone} (${instance})[${state}]: response received`, { metadata: {
      service: `/api/sms/${instance}`,
      cookies,
      instance,
      input,
      phone,
      state,
    }});

    // set the response to type xml
    res.setHeader('Content-Type', 'text/xml');

    // based on the state we perform certain actions / responses
    switch (state) {
      default:
      case 'idle':
        // get the case number from the text
        const caseNumber = input.trim();

        // see if the case number matches the testcase or the regex
        if (instanceMethods.getNumberRegex().test(caseNumber) || caseNumber.toLowerCase() === 'testcase') {
          let cases;

          // if the case number is the test case then lets get one
          if (caseNumber.toLowerCase() === 'testcase') {
            cases = [instanceMethods.getTestCase(2)];
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

            logger.info(`${phone} (${instance})[${state}]: case found`, { metadata: {
              service: `/api/sms/${instance}`,
              cookies,
              instance,
              input,
              phone,
              state,
              result: 'case found',
            }});

            res.setHeader('Set-Cookie', [
              serialize('state', String('case_found'), { maxAge }),
              serialize('cases', String(JSON.stringify(cases)), { maxAge }),
            ]);
            res.send(smsResponse.caseFound(cases, instanceMethods.getTimezone()).toString());
          }
          // case not found
          else {
            logger.warn(`${phone} (${instance})[${state}]: case not found`, { metadata: {
              service: `/api/sms/${instance}`,
              cookies,
              instance,
              input,
              phone,
              state,
              result: 'case not found',
            }});
            res.send(smsResponse.caseNotFound(caseNumber).toString());
          }
        }
        // send help response
        else {
          logger.warn(`${phone} (${instance})[${state}]: case not matching regex`, { metadata: {
            service: `/api/sms/${instance}`,
            cookies,
            instance,
            input,
            phone,
            state,
            result: 'case not matching regex',
          }});
        res.send(smsResponse.help(instanceMethods.getHelpText()).toString());
        }
        break;
      case 'case_found':
        // get the case from the cookie
        const cases = JSON.parse(req.cookies.cases);
        // get the text response
        const response = input.trim();
        // parse the number out of the response
        // we'll do a check later to see if it was a valid number
        const index = parseInt(response) - 1;

        // no reminder, but let's send information their way
        if (response.toLowerCase() === 'no') {
          logger.info(`${phone} (${instance})[${state}]: no reminder set`, { metadata: {
            service: `/api/sms/${instance}`,
            cookies,
            instance,
            input,
            phone,
            state,
            result: 'no reminder set',
          }});
          res.send(smsResponse.reminderNo(instanceMethods.getWebsite()).toString());
        }
        // logic for when only 1 case was found
        else if (cases.length === 1) {
          // let's check for a yes
          if (response.toLowerCase() === 'yes') {
            const c = cases[0];

            const documentCount = await ReminderDao.countDocuments({
              uid: c.uid,
              number: c.number,
              phone,
            });

            // Only create a document if a reminder document matching the case uid and phone number does not exist.
            if (documentCount == 0) {
              await ReminderDao.create({
                uid: c.uid,
                number: c.number,
                phone,
              });

              logger.info(`${phone} (${instance})[${state}]: reminder set`, { metadata: {
                service: `/api/sms/${instance}`,
                cookies,
                instance,
                input,
                phone,
                case: c,
                state,
                result: 'reminder set',
              }});
            }
            res.send(smsResponse.reminderYes(c).toString());
          }
          // send help due to unexpected response
          else {
            // set state
            res.setHeader('Set-Cookie', [
              serialize('state', String('case_found'), { maxAge }),
              serialize('cases', String(JSON.stringify(cases)), { maxAge }),
            ]);

            logger.warn(`${phone} (${instance})[${state}]: unexpected input`, { metadata: {
              service: `/api/sms/${instance}`,
              cookies,
              instance,
              input,
              phone,
              state,
              result: 'unexpected input',
            }});
            // send help text
            res.send(smsResponse.help(`Reply with a YES or NO`).toString());
          }
        }
        // logic for when more than 1 case was found
        else {
          // if a number was given lets check to see if it maps to a case index
          if (response === parseInt(response).toString() && index >= 0 && index < cases.length) {
            const c = cases[index];

            const documentCount = await ReminderDao.countDocuments({
              uid: c.uid,
              number: c.number,
              phone,
            });

            // Only create a document if a reminder document matching the case uid and phone number does not exist.
            if (documentCount == 0) {
              await ReminderDao.create({
                uid: c.uid,
                number: c.number,
                phone,
              });

              logger.info(`${phone} (${instance})[${state}]: reminder set`, { metadata: {
                service: `/api/sms/${instance}`,
                cookies,
                instance,
                input,
                phone,
                case: c,
                state,
                result: 'reminder set',
              }});
          }
            
            res.send(smsResponse.reminderYes(c).toString());
          }
          // send help due to unexpected response
          else {
            // set state
            res.setHeader('Set-Cookie', [
              serialize('state', String('case_found'), { maxAge }),
              serialize('cases', String(JSON.stringify(cases)), { maxAge }),
            ]);

            logger.warn(`${phone} (${instance})[${state}]: unexpected input`, { metadata: {
              service: `/api/sms/${instance}`,
              cookies,
              instance,
              input,
              phone,
              state,
              result: 'unexpected input',
            }});

            // send help text
            res.send(smsResponse.help(`Reply with a number between 1-${cases.length} or NO`).toString());
          }
        }
        break;
    }
  } catch (error) {
    logger.error(error, { metadata: {
      service: `/api/sms/${instance}`,
      cookies,
      instance,
      input,
      phone,
    }});
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
}