const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
if (process.env.NODE_ENV === 'dev')
  AWS.config.update({region:'us-east-1'});

module.exports = new AWS.DynamoDB.DocumentClient();
