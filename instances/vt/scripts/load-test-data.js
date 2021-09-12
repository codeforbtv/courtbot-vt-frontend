import moment from 'moment';
import { initialize, EventDao } from '../dao/mongoose.js';

const county = ['addison', 'bennington', 'caledonia', 'chittenden', 'environmental', 'essex', 'franklin', 'grand isle', 'judicial bureau', 'lamoille', 'orange', 'orleans', 'rutland', 'supreme court', 'washington', 'windham', 'windsor'];
const city = ['middlebury', 'bennington', 'st johnsbury', 'burlington', 'burlington', 'guildhall', 'st albans', 'north hero', 'burlington', 'hyde park', 'chelsea', 'newport', 'rutland', 'south royalton', 'barre', 'brattleboro', 'white river junction'];
const subdivision = ['civil', 'criminal', 'family', 'probate', 'environmental', 'judicial', 'supreme court'];
(async () => {
  try {
    // connect to database
    await initialize();

    const date = moment();
    // create test cases
    for (let i = 0; i < 10; i++) {
      const docket = `test-case-${i % 6}`;
      console.log(`creating case ${docket}`)
      await EventDao.create({
        docket,
        // add 6 hours to the date to spread test data across multiple hours / days
        date: date.add(6, 'hours').toDate(),
        county: county[i % county.length],
        subdivision: subdivision[i % subdivision.length],
        court_room: `court courtroom ${i}`,
        hearing_type: "status conference",
        day_of_week: date.day(),
        day: date.date(),
        month: date.format('MMMM'),
        time: date.format('h:mm'),
        am_pm: date.format('A'),
        street: "123 sesame street",
        city: city[i % city.length],
        zip_code: "00000",
        division:  subdivision[i % subdivision.length],
      });
    }
  } catch (e) {
    console.log(e);
  }

  process.exit();
})();