const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
if (process.env.NODE_ENV === 'dev')
    AWS.config.update({region:'us-east-1'});

let client = new AWS.DynamoDB.DocumentClient()

const get = (guildId, key) => {
    return new Promise( (resolve, reject) => {
        const params = {
            TableName: guildId,
            Key: {
                id: key
            }
        }

        dynamoDb.get(params, (error, result) => {
            if (error || (!result && !result.Item)) reject('Not found')
            resolve(result.Item)
        })
    })
}

const put = (guildId, key, item) => {
    return new Promise( (resolve, reject) => {
        const params = {
            TableName: guildId,
            Item: {
                id: key,
                ...item
            }
        }

        dynamoDb.put(params, (error) => {
            if (error) reject(error)
            resolve()
        })
    })
}


module.exports = {
  get,
  put,
  client
}
