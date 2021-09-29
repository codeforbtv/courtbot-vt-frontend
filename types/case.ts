export type Case = {
  /** @member {String} A unique id for a case */
  uid: string;

  /** @member {String A number associated with a case like ticket or docket */
  number: string;

  /** @member {Date Date of when the case takes place */
  date: Date;

  /** @member {String Address of where the case takes place */
  address: String;
}