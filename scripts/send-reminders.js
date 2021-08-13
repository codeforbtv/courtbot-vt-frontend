import fs from 'fs';
import moment from 'moment';
import path from 'path';
import Twilio from 'twilio';
import _ from 'lodash';
import dbConnect from '../instances/vt/utils/db-connect.js';
import Notification from '../dao/notification';
import Reminder from '../dao/reminder';
import { getCaseModel } from '../models/icase';
import logger from '../utils/logger';

const client = new Twilio();

(async () => {
  try {
    // connect to database
    logger.debug('connecting to database');
    await dbConnect();
    logger.debug('connected');

    // get a list of instances
    const instanceDirectory = path.join(process.cwd(), './instances/');
    const items = fs.readdirSync(instanceDirectory);

    // go thru each item found in the directory
    for(let instanceIndex = 0; instanceIndex < items.length; instanceIndex++) {
      try {
        const instance = items[instanceIndex];
        // if the item is a directory then lets assume it's a valid instance
        if (fs.lstatSync(path.join(instanceDirectory, instance)).isDirectory()) {
          logger.info(`Instance = ${instance}`);

          // get the case instance
          const CaseInstance = await getCaseModel(instance);

          // get the day after tomorrows start date & time to use as time bound
          const startDate = moment().toDate();
          const endDate = moment().startOf('day').add(2, 'days').toDate();
          logger.info(`Searching for dates between ${startDate} - ${endDate}`);

          // find all cases within the time bounds
          const cases = await CaseInstance.findAll({
            startDate,
            endDate,
          });

          // add the test case for any reminders
          cases.push(await CaseInstance.getTestCase());

          // lets get a list of uids to query off
          const uids = cases.map(o => o.uid);
          logger.info(`Cases Found: ${uids}`);

          // find all reminders that match the dockets
          const reminders = await Reminder.find({
            active: true,
            uid: {
              $in: uids,
            },
          }).lean().exec();

          // go thru each reminder to check to see if it matches a case
          // then send a text if it does
          for(let i = 0; i < reminders.length; i++) {
            try {
              const reminder = reminders[i];

              const c = _.find(cases, (o) => o.uid === reminder.uid);
              if (c) {
                // send the sms
                const options = {
                  to: reminder.phone,
                  from: process.env.TWILIO_PHONE_NUMBER,
                  body: `Just a reminder that you have an appointment coming up on ${moment(c.date).format('l LT')} @ ${c.address}. Case is ${c.number}`,
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
        }
      }
      catch (ex) {
        logger.error(ex);
      }
    }
  } catch (e) {
    console.log(e);
  }

  process.exit();
})();