const { describe, it } = require('mocha');
const { expect } = require('chai');
const Response = require('../src/response');

describe('response.js', () => {
  describe('constructor()', () => {
    let tests = {};
    tests[Symbol.iterator] = function* () {
      let testObject = { field: 'value' };
      let stringValue = 'unit-test-string';
      let bufferObject = Buffer.from(stringValue);
      yield {
        name: 'body is json string when null',
        params: [],
        expectedResultObject: {
          statusCode: 200,
          isBase64Encoded: false,
          multiValueHeaders: {
            'Access-Control-Allow-Origin': ['*']
          }
        }
      };

      yield {
        name: 'body is json string',
        params: [testObject],
        expectedResultObject: {
          body: JSON.stringify(testObject),
          statusCode: 200,
          isBase64Encoded: false,
          multiValueHeaders: {
            'Content-Type': ['application/links+json'],
            'Access-Control-Allow-Origin': ['*']
          }
        }
      };

      yield {
        name: 'body is binary',
        params: [bufferObject],
        expectedResultObject: {
          body: bufferObject,
          statusCode: 200,
          isBase64Encoded: false,
          multiValueHeaders: {
            'Content-Type': ['application/octet-stream'],
            'Access-Control-Allow-Origin': ['*']
          }
        }
      };

      yield {
        name: 'body is json full object is set as first parameter',
        params: [testObject, 201],
        expectedResultObject: {
          body: JSON.stringify(testObject),
          statusCode: 201,
          isBase64Encoded: false,
          multiValueHeaders: {
            'Content-Type': ['application/links+json'],
            'Access-Control-Allow-Origin': ['*']
          }
        }
      };

      yield {
        name: 'No body set with status code',
        params: [{
          statusCode: 400
        }],
        expectedResultObject: {
          statusCode: 400,
          isBase64Encoded: false,
          multiValueHeaders: {
            'Access-Control-Allow-Origin': ['*']
          }
        }
      };

      yield {
        name: 'No body set with headers',
        params: [{
          headers: {
            'Key': 'Value',
            'Content-Type': 'Override'
          }
        }],
        expectedResultObject: {
          statusCode: 200,
          isBase64Encoded: false,
          multiValueHeaders: {
            'Content-Type': ['Override'],
            'Key': ['Value'],
            'Access-Control-Allow-Origin': ['*']
          }
        }
      };

      yield {
        name: 'Headers have non string values',
        params: [{
          headers: {
            'Key': false,
            'Content-Type': 17,
            'X-Other': 0
          }
        }],
        expectedResultObject: {
          statusCode: 200,
          isBase64Encoded: false,
          multiValueHeaders: {
            'Content-Type': ['17'],
            'Key': ['false'],
            'X-Other': ['0'],
            'Access-Control-Allow-Origin': ['*']
          }
        }
      };

      yield {
        name: 'Remove allow origin header',
        params: [{
          headers: {
            'Key': 'Value',
            'Content-Type': 'Override',
            'Access-Control-Allow-Origin': undefined
          }
        }],
        expectedResultObject: {
          statusCode: 200,
          isBase64Encoded: false,
          multiValueHeaders: {
            'Content-Type': ['Override'],
            'Key': ['Value'],
            'Access-Control-Allow-Origin': []
          }
        }
      };
    };
    for (let test of tests) {
      it(test.name, () => {
        let response = new Response(...test.params);
        expect(response).to.eql(test.expectedResultObject);
      });
    }
  });
});
