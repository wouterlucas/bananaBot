const { getMaxListeners } = require('process')
const db = require('../db')
const permission = require('../permissions/index.js')

const getOwner = async (message) => {
    const owner = await permission.owner(message)
    return { message : `Guild owner is ${owner}`}
}

const getDaddy = async (message) => {
    const daddy = await permission.daddy(message)
    return { message : `Daddy is ${daddy}`}
}

const getList = async (message) => {
    const accessList = await permission.getAccessList(message)
}

const action = (arguments, message) => {
    if (subcommands[ arguments[1] ] !== undefined)
        return subcommands[ arguments[1] ](message)
}

const command = 'access'
const subcommands = {
    'owner' : getOwner,
    'daddy' : getDaddy,
    'list' : getList,
}


module.exports = {
    command,
    action
}
