import { Mutex } from "async-mutex";

interface IIndexSignature {
  [key: string]: any;
}

type SchemaConfiguration = {
  collection?: string;
  timestamps?: boolean;
} | undefined;

/**
 * Mocks features present in the Mongoose module for working with documents.
 * 
 */
class Document<Type> {
  protected fields: string[];
  constructor(params: IIndexSignature, model: Model<Type>) {
    const schema = model.getSchema();
    const configs = schema.getConfigs();
    const schemaFields = schema.getSchema();
    this.fields = Object.keys(schemaFields);

    for (const [key, fieldValue] of Object.entries(schemaFields)) {
      let propertyValue: any;
      let paramsValue: any = params[key];

      if (paramsValue !== undefined) {
        propertyValue = paramsValue;
      } else {
        propertyValue = fieldValue;
      }

      Object.defineProperty(this, key, {
        value: propertyValue,
        enumerable: true,
        writable: true
      })
    }
    if (configs !== undefined && configs.timestamps === true) {
      const currentTime = new Date(Date.now());
      Object.defineProperty(this, 'createdAt', {
        value: currentTime,
        enumerable: true,
        writable: true
      })
      Object.defineProperty(this, 'updatedAt', {
        value: currentTime,
        enumerable: true,
        writable: true
      })
    }
  }

  async updateOne(params: IIndexSignature) {
    for (const [key, value] of Object.entries(params)) {
      this[key as keyof typeof this] = value;
    }
  }

  toJSON() {
    const fields = {}
    for (const field of this.fields) {
      Object.defineProperty(fields, field, {
        value: this[field as keyof typeof this],
        enumerable: true,
        writable: true,
      })
    }
    return fields;
  }
}

/**
 * A mock of the Mongoose module's Schema definitions.
 * 
 */
class Schema<Type> {
  protected fields = {};
  protected configs: SchemaConfiguration;

  constructor(fields: Object, configs: SchemaConfiguration) {
    for (const [key, value] of Object.entries(fields)) {
      let propertyValue: any;
      if (Object.hasOwn(value, 'default')) {
        propertyValue = value.default;
      } else {
        propertyValue = undefined;
      }
      Object.defineProperty(this.fields, key, {
        value: propertyValue,
        enumerable: true,
        writable: true
      })
    }
    this.configs = configs;
  }

  document(params: IIndexSignature, model: Model<Type>) {
    let document = new Document<Type>(params, model);
    return document;
  }

  getSchema() {
    return this.fields;
  }

  getConfigs() {
    return this.configs;
  }
}

/**
 * A mock of the Mongoose module's Model definitions.
 * 
 */
class Model<Type> {
  protected data: Array<any> = [];
  protected mutex: Mutex = new Mutex();
  protected schema: Schema<Type>;

  constructor(schema: Schema<Type>) {
    this.schema = schema;
  }

  //eslint-disable-next-line @typescript-eslint/ban-types
  async create(params: Object) {
    await this.mutex.acquire();
    try {
      const document = this.schema.document(params, this);
      this.data.push(document);
    } finally {
      this.mutex.release();
    }    
  }

  //eslint-disable-next-line @typescript-eslint/ban-types
  countDocuments(params: typeof this.schema) {
    return {
      exec: async () => {
        const documents = await this.query(params);
        const count = documents.length;
        return count;
      }
    };
  }

  //eslint-disable-next-line @typescript-eslint/ban-types
  find(params: Object) {
    return { 
      exec: async () => { return this.query(params) },
      lean: () => { return { exec: async () => {
        return this.query(params) }}}
    };
  }

  findOne() {
    return {
      exec: async () => {
        await this.mutex.acquire();
        let document: any;
        try {
          if (this.data.length == 0) {
            document = undefined;
          } else {
            document = this.data[0];
          }
        } finally {
          this.mutex.release();
        }
        return document;
      }
    };
  }

  getSchema() {
    return this.schema;
  }

  /**
   * A mock of the Mongoose Query class housed within the Mongoose Model mock.
   * 
   * @param{Object} param A MongoDB filter.
   * @param{string} condition When possessing the string value 'filter', this method excludes elements that match the filter. When undefined, matching elements are returned.
   * @returns A list of documents from the collection that match or filter all documents in the collection.
   */
  //eslint-disable-next-line @typescript-eslint/ban-types
  async query(params: Object, condition?: string) {
    await this.mutex.acquire();
    let documents: Array<any>;
    try {
      let matchCondition = true;
      if (condition === 'filter') {
        matchCondition = false;
      }
      // If params, a MongoDB filter, is not empty,
      if (this.data.length != 0 && params !== undefined && Object.keys(params).length !== 0) {
        documents = this.data.filter((document) => {
          for (const [key, value] of Object.entries(params)) {
            const parameterValueProperties = Object.keys(value);
            const fieldValue = document[key as keyof typeof document];
            // If query operators are present
            if (parameterValueProperties.some(elem => ['$gt', '$in', '$lt'].includes(elem))) {
              // Evaluate each query operator
              for (const queryOperator of parameterValueProperties) {
                // Return a failing match condition if the evaluation fails.
                if (queryOperator === '$gt' && fieldValue < value['$gt']) {
                  return !matchCondition;
                } else if (queryOperator === '$in' && !value['$in'].includes(fieldValue)) {
                  return !matchCondition;
                } else if (queryOperator === '$lt' && fieldValue > value['$lt']) {
                  return !matchCondition;
                }
              }
              // Return a match if no evaluations fail.
              return matchCondition;
            } else if (fieldValue == value) {
              return matchCondition;
            } else {
              return !matchCondition;
            }
          }
        });
      } else {
        // When an empty parameter (MongoDB filter) is present,
        if (condition === 'filter') {
          // And the callee is an operation (e.g. remove())
          // that filters matches from the collection,
          // provide a list of no documents.
          documents = [];
        } else {
          // Else when the callee is an operation (e.g. find())
          // that would match all document when an empty MongoDB filter is present,
          // return all documents in the collection.
          documents = this.data;
        }
      }
    } finally {
      this.mutex.release();
    }
    return documents;
  }

  //eslint-disable-next-line @typescript-eslint/ban-types
  remove(params: Object) {
    return {
      exec: async () => {
        const documents = await this.query(params, 'filter');
        await this.mutex.acquire();
        try {
          this.data = documents;
        } finally {
          this.mutex.release();
        }
      }
    };
  }

}

const mongoose = {
  createConnection: jest.fn().mockImplementation(function (_args: any) {
    return {
      model: jest.fn().mockImplementation(function (_: any, schema: any) {
        return new Model(schema);
      }),
    };
  }),
  Connection: jest.fn(),
  Schema,
  Model,
};

module.exports = mongoose;
