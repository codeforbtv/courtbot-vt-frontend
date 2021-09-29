import moment from 'moment-timezone';

import { Case, IInstanceMethods } from '../../../types';
import { initialize, Event, EventDao } from '../dao/mongoose';

const TIMEZONE = 'America/New_York';

function toCase(o:Event):Case {
  return {
    uid: `${o.docket}-${o.county}-${o.division}`,
    number: o.docket,
    date: o.date,
    address: `${o.street} ${o.city}, VT`,
  };
}

type EventParams = {
  docket?: string;
  date?: {
    $gt?: Date;
    $lt?: Date;
  }
}

export default class VtInstanceMethods implements IInstanceMethods {
  getWebsite() {
    return `https://www.vermontjudiciary.org/court-hearings`;
  }

  getNumberRegex() {
    return /.+-.+-.+/;
  }

  async findAll(obj: { number?: string, startDate?: Date, endDate?: Date }) {
    await initialize();

    let params:EventParams = {};

    if (obj.number) {
      params.docket = obj.number;
    }
    if (obj.startDate || obj.endDate) {
      params.date = {};

      if (obj.startDate) {
        params.date.$gt = obj.startDate;
      }
      if (obj.endDate) {
        params.date.$lt = obj.endDate;
      }
    }
    const cases = await EventDao.find(params).lean().exec();

    return cases.map(toCase);
  }

  getTestCase() {
    return {
      uid: `testcase`,
      number: `testcase`,
      date: moment.tz(TIMEZONE).startOf('day').add(1, 'days').add(11, 'hours').toDate(),
      address: `65 State Street Montpelier, VT`,
    };
  }

  getHelpText() {
    return `Reply with a docket number to sign up for a reminder. Docket numbers look like 3 sets of numbers or characters. For example: 123-45-67 or 123-CR-45.`;
  }

  getTimezone() {
    return TIMEZONE;
  }
}