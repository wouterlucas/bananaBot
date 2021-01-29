const config = require('../../config.js')
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

let creds = new AWS.EC2MetadataCredentials();

const dev = process.env.dev || false
const awsRegion = process.env.AWS_REGION || false
const amazonRegion = process.env.AWS_REGION || false
const defaultRegion = 'us-east-2'

if (dev) {
    AWS.config.update({region:'us-east-2'});
    if (config.awsProfile)
        creds = new AWS.SharedIniFileCredentials({ profile: config.awsProfile })
} else {
    let region = awsRegion || amazonRegion
    if (!region) {
        region = defaultRegion
        console.log('No region received from AWS, using default')
    }

    console.log('AWS DB Using region', region)
    AWS.config.update({region:region});
}

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
