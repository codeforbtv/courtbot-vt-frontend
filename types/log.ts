import { Case, Reminder } from "."

export type Log = {
  timestamp: Date;
  level: string;
  message: string;
  meta: {
    service: string;
    cookies: {
      cases: string;
      state: string;
      case: string;
      "[$]Domain": string;
      "[$]Version": string;
    };
    instance: string;
    input: string;
    phone: string;
    state: string;
    result: string;
    reminder: Reminder;
    case: Case;
  };
}