# OpenAPI Factory (Javascript)

This is an open source project managed by the [Authress Engineering team](https://authress.io).

<p align="center">
    <a href="https://authress.io" alt="Authress Engineering">
      <img src="https://img.shields.io/static/v1?label=Authress+Engineering&message=OpenAPI%20Explorer&color=%23FBAF0B&logo=androidauto&logoColor=%23FBAF0B"></a>
    <a href="./LICENSE" alt="apache 2.0 license">
      <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg"></a>
    <a href="https://badge.fury.io/js/openapi-factory" alt="npm version">
        <img src="https://badge.fury.io/js/openapi-factory.svg"></a>
    <a href="https://authress.io/community" alt="npm version">
      <img src="https://img.shields.io/badge/community-Discord-purple.svg"></a>
</p>

Provides an simple event interceptor for AWS Lambda. Handles events tha come from API Gateway, SQS, EventBridge, and all other AWS services and routes them to appropriate lambda code. This enables you to have single AWS Lambda function for your whole service instead of needing tons of nano-ones to handle every route.

By merging your lambda functions together, you eliminate 99% of all cold starts, and simplify deployment to AWS Lambda.

## Partner libraries
Each of these usable completely independently. But both work together as well:

With the [aws-architect](https://www.npmjs.com/package/aws-architect) npm package, you can also develop your lambda locally, spinning up a full HTTP API to have quick development cycles.
* The **OpenAPI Factory** provides the production runtime wrapper to convert all the different AWS events into a simple format and processes the result
* The **AWS Architect** library, let's you build, test, and run locally your lambda. And when you are ready it automatically packages your lambda and publishes it in S3, making it ready to pull into your Infrastructure as Code solution as soon as you would like.

### Create an API

```js
const ApiFactory = require('openapi-factory');
const options = {
  requestMiddleware(request, context) {
    return request;
  },
  responseMiddleware(request, response) {
    return response;
  },
  errorMiddleware(request, error) {
    return { statusCode: 500, body: { message: 'Unexpected Error' } };
  }
};
const api = new ApiFactory(options);

api.get('/example', async request => {
  // Short hand for returning a JSON object
  return { value: 'test' };

  // Or explicitly return the whole response
  return {
    body: { value: 'testWithStatus' },
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
  };
});

// converts dynamic variables paths
api.get('/example/{id}/subpath', request => {
  const idFromPath = request.pathParameters.id;
  const stageVariable = request.stageVariables.VARIABLE_NAME;
  const query = request.queryStringParameters.QUERY_NAME;
  const headers = request.headers.HEADER_NAME;
});

api.setAuthorizer(request => {
  return 'valid-policy-document';
});

api.onEvent(event => {
  console.log('triggered by a direct invocation from a Lambda Event Source.');
// AWS Documentation: https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html
// Example payloads: https://lambda.101i.de/
});

api.onSchedule(data => {
  console.log('triggered by a CloudWatch Rule schedule');
});

api.get('/items/{itemid}', async request => {
  console.log(request.path.itemId);
  return {
    body: { value: 'testWithStatus' },
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
  };
});

// paths have an optional options object which has property "rawBody" to return the raw body only.
api.get('/items/{itemid}', { rawbody: true }, async request => {
  console.log('This is he raw body of the request: ', request.body);
  return { statusCode: 200 };
});

// Example: AWS Api Gateway magic string handling for CORS and 404 fallbacks.
api.options('/{proxy+}', () => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
      'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
      'Access-Control-Allow-Origin': '*'
    }
  };
});

api.any('/{proxy+}', () => {
  return {
    statusCode: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  };
});

```

### Default Headers
The default headers returned unless overwritten are:
* For a JSON Object: `{ 'Content-Type': 'application/links+json', 'Access-Control-Allow-Origin': '*' }`
* For a binary Object: `{ 'Content-Type': 'application/octet-stream', 'Access-Control-Allow-Origin': '*' }`

#### Custom PathResolver
It is possible that the default handling of REST routes does not match explicitly match your strategy for resolution. Since there is nothing more than string matching it is fairly easy to hoist this function.

```js
const ApiFactory = require('openapi-factory');
// The default path resolver is the one contained in the PathResolver.
// * It parses the registered paths, stores them in a dictionary, and then looks them up later when necessary.
options.pathResolver = new PathResolver();
const api = new ApiFactory(options);

// However this can be replaced by a custom implementation which includes storePath and resolvePath
class PathResolver {
  constructor() {
    this.currentPathDictionary = {
      GET: {},
      POST: {}
      // ...
    };
  }

  // will get in the current dictionary object as well, there is a specific dictionary for each verb
  // * the current path string
  // * the object associated with that path
  // and returns the updated dictionary
  storePath(currentVerbPathDictionary, dynamicPath, storageObject) {
    return new PathDictionary();
  }

  // Later resolvePath is called to get back the currentPathDictionary and raw path,
  // * and expect to return the pre-stored storageObject
  resolvePath(currentPathDictionary, resolvedPath) {
    return storageObject;
  }
}
```

## Lambda@Edge example
[See Example here](./lambda@edge-cloudfront-wrapper.md)
