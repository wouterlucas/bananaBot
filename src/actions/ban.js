const dynamoDb = require('../db')

const command = 'ban'

const subcommands = ['add', 'alias', 'remove', 'list', 'lookup']
const commands = {
    'add' : addUserToBanList
}

const addUserToBanList = (table, user, banReason, bannedBy) => {
    
}


const action = (arguments) => {
    return new Promise( resolve => {
        resolve({
            message : 'pong!'
        })
    })
}

module.exports = {
    command,
    action
}
