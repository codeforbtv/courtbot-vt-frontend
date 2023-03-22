import moment from 'moment-timezone';
import _ from 'lodash';

import { Case, IInstanceMethods } from '../../../types';
import { initialize, Event, EventDao } from '../dao/mongoose';

const TIMEZONE = 'America/New_York';

function toCase(o:Event, startDate?:Date, endDate?:Date):Case {
  let c:Case = {
    uid: o._id,
    number: o.docket_number,
    name: o.case.name,
    date: o.date,
    courtName: o.court_room_code,
    address: `${o.county.name}, VT`,
  };

  // find a date that matches constraints
  if (startDate && endDate) {
    if (o.date.valueOf() > startDate.valueOf() && o.date.valueOf() < endDate.valueOf()) {
      c.date = o.date;
    }
  }
  else if (startDate && endDate == null) {
    if (o.date.valueOf() > startDate.valueOf()) {
      c.date = o.date;
    }
  }
  else if (startDate == null && endDate) {
    if (o.date.valueOf() < endDate.valueOf()) {
      c.date = o.date;
    }
  }

  return c;
}

type EventParams = {
  docket_number?: string | RegExp;
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

  async findAll(obj: { number?: string, startDate?: Date, endDate?: Date, limit?: number }) {
    await initialize();

    let params:EventParams = {};

    if (obj.number) {
      params.docket_number = new RegExp(`${obj.number}`, 'i');
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
    const allCases = await EventDao.find(params).limit(obj.limit || 10).lean().exec();

    const uniqueCases:Event[] = [];
    const uniqueDocketNumbers:String[] = [];
    allCases.forEach(o => {
      if (uniqueDocketNumbers.indexOf(o.docket_number) === -1) {
        uniqueCases.push(o);
        uniqueDocketNumbers.push(o.docket_number);
      }
    });

    return uniqueCases.map(o => toCase(o, obj.startDate, obj.endDate));
  }

  getTestCase(days:number) {
    return {
      uid: `testcase`,
      number: `testcase`,
      name: `Test Case vs Vermont`,
      date: moment.tz(TIMEZONE).startOf('day').add(days, 'days').add(11, 'hours').toDate(),
      courtName: `Test Court`,
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