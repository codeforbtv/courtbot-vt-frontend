import moment from 'moment-timezone';

import { Case, IInstanceMethods } from '../../../types';
import { initialize, Event, EventDao } from '../dao/mongoose';

const TIMEZONE = 'America/New_York';

function toCase(o:Event, startDate?:Date, endDate?:Date):Case {
  let c:Case = {
    uid: `${o.docket}-${o.county}-${o.division}`,
    number: o.docket,
    date: o.date[0],
    address: `${o.street} ${o.city}, VT`,
  };

  // find a date that matches constraints
  if (startDate && endDate) {
    for (const date of o.date) {
      if (date.valueOf() > startDate.valueOf() && date.valueOf() < endDate.valueOf()) {
        c.date = date;
        break;
      }
    }
  }
  else if (startDate && endDate == null) {
    for (const date of o.date) {
      if (date.valueOf() > startDate.valueOf()) {
        c.date = date;
        break;
      }
    }
  }
  else if (startDate == null && endDate) {
    for (const date of o.date) {
      if (date.valueOf() < endDate.valueOf()) {
        c.date = date;
        break;
      }
    }
  }

  return c;
}

type EventParams = {
  docket?: string | RegExp;
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
      params.docket = new RegExp(`^${obj.number}$`, 'i');
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

    return cases.map(o => toCase(o, obj.startDate, obj.endDate));
  }

  getTestCase(days:number) {
    return {
      uid: `testcase`,
      number: `testcase`,
      date: moment.tz(TIMEZONE).startOf('day').add(days, 'days').add(11, 'hours').toDate(),
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