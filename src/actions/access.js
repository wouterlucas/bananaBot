const permission = require('../permissions/index.js')
const {user} = require('../data/user')

const getOwner = async (message) => {
    const owner = await user(await permission.owner(message))
    return { message : `Guild owner is ${owner.usershort}`}
}

const getDaddy = async (message) => {
    const daddy = await user(await permission.daddy(message))
    return { message : `Daddy is ${daddy.usershort}`}
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
