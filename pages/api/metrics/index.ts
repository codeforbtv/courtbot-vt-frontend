import { NextApiRequest, NextApiResponse } from 'next'
import moment from 'moment-timezone';
import logger from '../../../utils/logger';
import checkBasicAuth from '../../../utils/basic-auth';
import { initialize, LogDao } from '../../../dao/mongoose';

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  // if (await checkBasicAuth(req, res)) {
    await initialize();
    const { method } = req;
    const instance = req.query.instance ? Array.isArray(req.query.instance) ? req.query.instance[0]: req.query.instance : 'vt';
    const range = req.query.range ? parseInt(Array.isArray(req.query.range) ? req.query.range[0]: req.query.range) : 30;
    const timezone = req.query.timezone ? Array.isArray(req.query.timezone) ? req.query.timezone[0]: req.query.timezone : 'America/New_York';
    const minDate = moment.tz(timezone).startOf('day').subtract(range - 1, 'days');
  
    switch (method) {
      case 'GET':
        const logEntries = await LogDao.aggregate([
          {
            '$match': {
              'meta.instance': instance,
              'meta.service': `/api/sms/${instance}`,
              'meta.state': 'idle',
              timestamp: { $gte: minDate.toDate() },
            }
          },
          {
            '$project': {
              'localDate': {
                '$dateToString': {
                  'date': '$timestamp', 
                  'timezone': 'America/New_York', 
                  'format': '%Y-%m-%d'
                }
              }, 
              'type': '$meta.result'
            }
          },
          {
            '$group': {
              '_id': {
                'date': '$localDate', 
                'type': '$type'
              }, 
              'count': {
                '$sum': 1
              }
            }
          }
        ]).exec();

        // build a map of dates
        const activity = {};
        for (let i = 0; i < range; i++) {
          const date = minDate.toISOString().split('T')[0];
          activity[date] = {
            date,
            "case found": 0,
            "case not found": 0,
            "case not matching regex": 0,
          };
          minDate.add(1, 'days');
        }

        // go thru each aggregation and add to map
        logEntries.forEach(o => {
          activity[o._id.date][o._id.type] = o.count;
        });

        res.send({
          activity: Object.values(activity),
        });
        break;
      default:
        res
          .status(400)
          .json({ success: false });
        break;
    }
  // }

  res.end();
};