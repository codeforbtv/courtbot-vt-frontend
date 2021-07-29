import moment from 'moment';
import Twilio from 'twilio';
import dbConnect from '../utils/db-connect.js';
import Case from '../models/case.js';
import Reminder from '../models/reminder';
import logger from '../utils/logger';
import testCase from '../utils/test-case';

const client = new Twilio();

(async () => {
  try {
    // connect to database
    logger.debug('connecting to database');
    await dbConnect();
    logger.debug('connected');

    // make sure the testcase is set to tomorrow @ 11:00AM
    logger.info('updating testcase date')
    await testCase.updateTime();
    
    // get the day after tomorrows start date & time to use as time bound
    const startDate = new Date();
    const endDate = moment().startOf('day').add(2, 'days').toDate();
    logger.info(`Searching for dates between ${startDate} - ${endDate}`);

    // find all cases within the time bounds
    const cases = await Case.find({
      date: {
        $gt: startDate,
        $lt: endDate,
      }
    }).exec();

    const dockets = cases.map(o => o.docket);

    logger.info(`Dockets Found: ${dockets}`);

    // find all reminders that match the cases
    const reminders = await Reminder.find({
      active: true,
      docket: {
        $in: dockets,
      },
    }).exec();

    // go thru each reminder to send a text and make it in active
    for(let i = 0; i < reminders.length; i++) {
      try {
        const reminder = reminders[i];

        // send the sms
        const options = {
          to: reminder.phone,
          from: process.env.TWILIO_PHONE_NUMBER,
          body: `Just a reminder that you have an appointment coming up.`,
        };
        logger.info(JSON.stringify(options));
        await client.messages.create(options);

        // set the reminder active to false
        await reminder.updateOne({ active: false });
      }
      catch(ex) {
        logger.error(ex);
      }
    }
  } catch (e) {
    console.log(e);
  }

  process.exit();
})();