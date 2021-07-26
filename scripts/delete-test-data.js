import dbConnect from '../utils/db-connect.js';
import Case from '../models/case.js';

(async () => {
  try {
    // connect to database
    await dbConnect();

    // delete all cases that start with `test-case-`
    const caseQuery = await Case.deleteMany({ docket: /^test-case-/ })
    console.log(`deleted ${caseQuery.deletedCount} test cases`);
  } catch (e) {
    console.log(e);
  }

  process.exit();
})();