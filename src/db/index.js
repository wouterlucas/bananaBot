const config = require('../../config.js')
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
if (process.env.NODE_ENV === 'dev')
    AWS.config.update({region:'us-east-1'});

let creds = 'default'
if (config.awsProfile)
    creds = new AWS.SharedIniFileCredentials({ profile: config.awsProfile })


const TABLENAME = 'BananaBot'

const client = new AWS.DynamoDB.DocumentClient({ credentials : creds})
const dynamoDb = new AWS.DynamoDB({ credentials : creds })

const get = (guildId, item) => {
    return new Promise( (resolve, reject) => {
        const params = {
            TableName: TABLENAME,
            Key: {
                guild: guildId
            }
        }

        client.get(params, (error, result) => {
            if (error) reject(error)

            if (result === null)
                return resolve({})

            resolve(result.Item && result.Item[ item ])
        })
    })
}

const put = (guildId, key, item) => {
    return new Promise( (resolve, reject) => {
        let params = {
            TableName: TABLENAME,
            Key: {
                guild: guildId,
            },
            UpdateExpression: `set ${key} = :r`,
            ExpressionAttributeValues : {
                ':r' : item
            }
        }

        client.update(params, (error) => {
            if (error) reject(error)
            resolve()
        })
    })
}



module.exports = {
  get,
  put,
  client: () => { return dynamoDb },
}
