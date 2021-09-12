import { initialize, EventDao } from '../dao/mongoose.js';

(async () => {
  try {
    // connect to database
    await initialize();

    // delete all cases that start with `test-case-`
    const caseQuery = await EventDao.deleteMany({ docket: /^test-case-/ })
    console.log(`deleted ${caseQuery.deletedCount} test cases`);
  } catch (e) {
    console.log(e);
  }

  process.exit();
})();