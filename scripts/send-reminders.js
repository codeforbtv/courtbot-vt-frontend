import moment from 'moment';
import Twilio from 'twilio';
import _ from 'lodash';
import dbConnect from '../instances/vt/utils/db-connect.js';
import Case from '../models/case.js';
import Notification from '../models/notification';
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

    // lets get a list of dockets to query off of since it's easier then a set of docket, county, & division
    const dockets = cases.map(o => o.docket);
    logger.info(`Dockets Found: ${dockets}`);

    // find all reminders that match the dockets
    const reminders = await Reminder.find({
      active: true,
      docket: {
        $in: dockets,
      },
    }).exec();

    // go thru each reminder to check to see if it matches a case
    // then send a text if it does
    for(let i = 0; i < reminders.length; i++) {
      try {
        const reminder = reminders[i];

        const c = _.find(cases, (o) => o.docket === reminder.docket && o.county === reminder.county && o.division === reminder.division);
        if (c) {
          // send the sms
          const options = {
            to: reminder.phone,
            from: process.env.TWILIO_PHONE_NUMBER,
            body: `Just a reminder that you have an appointment coming up on ${moment(c.date).format('l LT')} @ ${c.street} ${c.city}, VT. Docket is ${c.docket}`,
          };
          logger.info(JSON.stringify(options));
          await client.messages.create(options);

          // set the reminder active to false
          await reminder.updateOne({ active: false });

          // add a notification entry
          await Notification.create({
            docket: reminder.docket,
            county: reminder.county,
            division: reminder.division,
            phone: reminder.phone,
            event_date: c.date,
          });
        }
      }
      catch(ex) {
        logger.error(ex);
      }
    }

    // make sure the testcase is updated to the future
    logger.info('updating testcase date')
    await testCase.updateTime();

  } catch (e) {
    console.log(e);
  }

  process.exit();
})();