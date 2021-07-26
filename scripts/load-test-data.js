import moment from 'moment';
import dbConnect from '../utils/db-connect.js';
import Case from '../models/case.js';

(async () => {
  try {
    // connect to database
    await dbConnect();

    // create test cases
    for (let i = 0; i < 10; i++) {
      const docket = `test-case-${i}`;
      const date = moment();
      console.log(`creating case ${docket}`)
      await Case.create({
        docket,
        date: date.toDate(),
        county: "addison",
        subdivision: "civil",
        court_room: "superior court courtroom 2",
        hearing_type: "status conference",
        day_of_week: date.day(),
        day: date.date(),
        month: date.format('MMMM'),
        time: date.format('h:mm'),
        am_pm: date.format('A'),
        street: "7 mahady court",
        city: "middlebury",
        zip_code: "05753",
        division: "civil",
      });
    }
  } catch (e) {
    console.log(e);
  }

  process.exit();
})();