import { Case } from './';

/**
 * Represents a case interface with static methods that need to be implemented
 * otherwise errors will be thrown
 */
export interface IInstanceMethods {
  /**
   * Url of the website where to find court cases
   * @return {String}
   */
  getWebsite():string;

  /**
   * generates a regex to use for testing case number inputs
   * @return {RegExp}
   */
  getNumberRegex():RegExp;

  /**
   * finds all the cases by a given number
   * @param {String} number A number associated with a case like ticket or docket
   * @param {Date} startDate A date that represents the lower bound of a case date
   * @param {Date} endDate A date that represents the upper bound of a case date
   * @return {Promise<Array.Case>}
   */
  findAll(obj:{ number?:string, startDate?:Date, endDate?:Date }): Promise<Case[]>;

  /**
   * generate a testcase for demo purposes where the date is set to sometime in X days
   * @param {Number} days Number of days in the future for the court date
   * @return {Case}
   */
  getTestCase(days:number):Case;

  /**
   * get a helper text to send to the user for instructions on how to use courtbot
   * @return {String}
   */
  getHelpText():string;

  /**
   * returns the timezone that the cases are in
   * @returns {String}
   */
  getTimezone():string;
}

/**
 * This function returns the instance implementation of ICase
 * @param {String} instance directory to use to get the ICase implementation
 * @returns {Promise<IInstanceMethods>}
 */
export async function getInstanceMethods(instance: string):Promise<IInstanceMethods> {
  return new (await import(`../instances/${instance}`)).InstanceMethods();
};