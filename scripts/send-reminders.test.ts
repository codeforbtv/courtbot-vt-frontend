import { Reminder } from '../types';
import { randomPhoneNumber } from '../utils/test';
import { EventDao, initialize as initializeInstanceDao } from '../instances/vt/dao/mongoose';
import { ReminderDao, initialize as initializeDao, NotificationDao } from '../dao/mongoose';


let sendReminders: () => Promise<void>;

describe('send-reminder()', () => {
    beforeAll(async () => {
        // Require the method under test and mock the process.exit() method.
        jest.spyOn(process, 'exit').mockImplementation();
        sendReminders = require('../scripts/send-reminders');
    })

    describe('Given a single reminder to notify one phone number of an upcoming court session', () => {
        beforeEach(async () => {
            const eventDate = new Date(Date.now());
            eventDate.setDate(eventDate.getDate() + 1);
            const eventDocument = {
                _id: 'Lsewhdk-Probate-114-178-120-litigant_entity-10',
                date: eventDate,
                county: { code: 'Lsewhdk', name: 'Lxenhsll County' },
                division: 'Probate',
                judge: { code: 'TB9', name: 'Trudy Butaine' },
                court_room_code: 'Xptwjenx',
                hearing: {
                    date: '11/29/2022',
                    start_time: '09:00',
                    type_code: 'Ryxo',
                    type: 'Vemvfqlbssp'
                },
                doc_id: '114-178-120 Pemdpmogg',
                docket_number: '114-178-120',
                case: { name: 'Plantiff v. Defendant', status: 'Pending', type: 'Civil' },
                litigant: {
                    entity_id: 'litigant_entity',
                    last_name: 'Found',
                    first_name: 'Sarah',
                    full_name: 'Sarah Found',
                    role: { code: '10', rank: '1', description: 'Summary description.' },
                    number: '0'
                },
                attorney: {
                    entity_id: 'attorney_entity',
                    last_name: 'Passings',
                    first_name: 'Bill',
                    suffix: '',
                    full_name: 'Bill Passings'
                },
                calendar_id: '91',
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            };

            const reminderDocument = {
                uid: eventDocument._id,
                number: eventDocument.docket_number,
                phone: randomPhoneNumber(),
            };

            await initializeInstanceDao();
            await initializeDao();
            await EventDao.create(eventDocument);
            await ReminderDao.create(reminderDocument);
        })

        afterEach(async () => {
            await EventDao.remove({}).exec();
            await NotificationDao.remove({}).exec();
            await ReminderDao.remove({}).exec();
        })

        test('A notification document is created and the reminder document\'s \'active\' field is set from true to false.', async () => {
            await sendReminders();
            const count = await NotificationDao.countDocuments().exec();
            expect(count).toBe(1);
            
            const reminders: Array<Reminder> = await ReminderDao.find().exec();
            for (const reminder of reminders) {
                expect((<Reminder><unknown>reminder).active).toBe(false);
            }
        })
    })

    describe('Given a single, active, reminder that is for a court session that has already taken place', () => {
        beforeEach(async () => {
            const eventDate = new Date(Date.now());
            eventDate.setDate(eventDate.getDate() - 1);
            const eventDocument = {
                _id: 'Lsewhdk-Probate-114-178-120-litigant_entity-10',
                date: eventDate,
                county: { code: 'Lsewhdk', name: 'Lxenhsll County' },
                division: 'Probate',
                judge: { code: 'TB9', name: 'Trudy Butaine' },
                court_room_code: 'Xptwjenx',
                hearing: {
                    date: '11/29/2022',
                    start_time: '09:00',
                    type_code: 'Ryxo',
                    type: 'Vemvfqlbssp'
                },
                doc_id: '114-178-120 Pemdpmogg',
                docket_number: '114-178-120',
                case: { name: 'Plantiff v. Defendant', status: 'Pending', type: 'Civil' },
                litigant: {
                    entity_id: 'litigant_entity',
                    last_name: 'Found',
                    first_name: 'Sarah',
                    full_name: 'Sarah Found',
                    role: { code: '10', rank: '1', description: 'Summary description.' },
                    number: '0'
                },
                attorney: {
                    entity_id: 'attorney_entity',
                    last_name: 'Passings',
                    first_name: 'Bill',
                    suffix: '',
                    full_name: 'Bill Passings'
                },
                calendar_id: '91',
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            };

            const reminderDocument = {
                uid: eventDocument._id,
                number: eventDocument.docket_number,
                phone: randomPhoneNumber(),
            };

            await initializeInstanceDao();
            await initializeDao();
            await EventDao.create(eventDocument);
            await ReminderDao.create(reminderDocument);
        })

        afterEach(async () => {
            await EventDao.remove({}).exec();
            await NotificationDao.remove({}).exec();
            await ReminderDao.remove({}).exec();
        })

        test('No notification document is created.', async () => {
            await sendReminders();
            const count = await NotificationDao.countDocuments().exec();
            expect(count).toBe(0);
        })

        test('The reminder is still active.', async () => {
            await sendReminders();
            const reminders = await ReminderDao.find().exec();
            for (const reminder of reminders) {
                expect((<Reminder><unknown>reminder).active).toBe(true);
            }
        })
    })

    describe('Given a single, active, reminder that is for a court session that will take place in the future and out of the time bounds to send reminders for upcoming court dates (two days from the system time)', () => {
        beforeEach(async () => {
            const eventDate = new Date(Date.now());
            eventDate.setDate(eventDate.getDate() + 7);
            const eventDocument = {
                _id: 'Lsewhdk-Probate-114-178-120-litigant_entity-10',
                date: eventDate,
                county: { code: 'Lsewhdk', name: 'Lxenhsll County' },
                division: 'Probate',
                judge: { code: 'TB9', name: 'Trudy Butaine' },
                court_room_code: 'Xptwjenx',
                hearing: {
                    date: '11/29/2022',
                    start_time: '09:00',
                    type_code: 'Ryxo',
                    type: 'Vemvfqlbssp'
                },
                doc_id: '114-178-120 Pemdpmogg',
                docket_number: '114-178-120',
                case: { name: 'Plantiff v. Defendant', status: 'Pending', type: 'Civil' },
                litigant: {
                    entity_id: 'litigant_entity',
                    last_name: 'Found',
                    first_name: 'Sarah',
                    full_name: 'Sarah Found',
                    role: { code: '10', rank: '1', description: 'Summary description.' },
                    number: '0'
                },
                attorney: {
                    entity_id: 'attorney_entity',
                    last_name: 'Passings',
                    first_name: 'Bill',
                    suffix: '',
                    full_name: 'Bill Passings'
                },
                calendar_id: '91',
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            };

            const reminderDocument = {
                uid: eventDocument._id,
                number: eventDocument.docket_number,
                phone: randomPhoneNumber(),
            };

            await initializeInstanceDao();
            await initializeDao();
            await EventDao.create(eventDocument);
            await ReminderDao.create(reminderDocument);
        })

        afterEach(async () => {
            await EventDao.remove({}).exec();
            await NotificationDao.remove({}).exec();
            await ReminderDao.remove({}).exec();
        })

        test('No notification document is created.', async () => {
            await sendReminders();
            const count = await NotificationDao.countDocuments().exec();
            expect(count).toBe(0);
        })

        test('The reminder is still active.', async () => {
            await sendReminders();
            const reminders = await ReminderDao.find().exec();
            for (const reminder of reminders) {
                expect((<Reminder><unknown>reminder).active).toBe(true);
            }
        })
    })

    describe('Given a single reminder that is not active for an upcoming court session', () => {
        beforeEach(async () => {
            const eventDate = new Date(Date.now());
            eventDate.setDate(eventDate.getDate() + 1);
            const eventDocument = {
                _id: 'Lsewhdk-Probate-114-178-120-litigant_entity-10',
                date: eventDate,
                county: { code: 'Lsewhdk', name: 'Lxenhsll County' },
                division: 'Probate',
                judge: { code: 'TB9', name: 'Trudy Butaine' },
                court_room_code: 'Xptwjenx',
                hearing: {
                    date: '11/29/2022',
                    start_time: '09:00',
                    type_code: 'Ryxo',
                    type: 'Vemvfqlbssp'
                },
                doc_id: '114-178-120 Pemdpmogg',
                docket_number: '114-178-120',
                case: { name: 'Plantiff v. Defendant', status: 'Pending', type: 'Civil' },
                litigant: {
                    entity_id: 'litigant_entity',
                    last_name: 'Found',
                    first_name: 'Sarah',
                    full_name: 'Sarah Found',
                    role: { code: '10', rank: '1', description: 'Summary description.' },
                    number: '0'
                },
                attorney: {
                    entity_id: 'attorney_entity',
                    last_name: 'Passings',
                    first_name: 'Bill',
                    suffix: '',
                    full_name: 'Bill Passings'
                },
                calendar_id: '91',
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            };

            const reminderDocument = {
                uid: eventDocument._id,
                number: eventDocument.docket_number,
                phone: randomPhoneNumber(),
                active: false
            };

            await initializeInstanceDao();
            await initializeDao();
            await EventDao.create(eventDocument);
            await ReminderDao.create(reminderDocument);
        })

        afterEach(async () => {
            await EventDao.remove({}).exec();
            await NotificationDao.remove({}).exec();
            await ReminderDao.remove({}).exec();
        })

        test('No notification document is created.', async () => {
            await sendReminders();
            const count = await NotificationDao.countDocuments().exec();
            expect(count).toBe(0);
        })

        test('The reminder is still not active.', async () => {
            await sendReminders();
            const reminders = await ReminderDao.find().exec();
            for (const reminder of reminders) {
                expect((<Reminder><unknown>reminder).active).toBe(false);
            }
        })
    })
})