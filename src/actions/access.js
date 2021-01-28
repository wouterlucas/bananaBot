const permissions = require('../permissions/index.js')
const {getGuild, getGuildId} = require('../data/guild')
const {getType, types} = require('../data/types')
const {user} = require('../data/user')

const getOwner = async (args, message) => {
    const owner = await user(await permissions.owner(message))
    return { message : `Guild owner is ${owner.usershort}`}
}

const getDaddy = async (args, message) => {
    const daddy = await user(await permissions.daddy(message))
    return { message : `Daddy is ${daddy.usershort}`}
}

const getList = async (args, message) => {
    const guildId = getGuildId(message)
    const accessList = await permissions.getAccessList(guildId)
    return { message: 'AccessList: ' + JSON.stringify(accessList) }
}

const add = async (args, message) => {
    const {type, id} = getType(args[2])
    const guildId = getGuildId(message)
    if (type === types.role) {
        await permissions.addRole(guildId, id)
    } else if (type === types.user) {
        await permissions.addUser(guildId, id)
    } else {
        return { message: 'Invalid role' }
    }
}

module.exports = {
    commandString : 'access',
    subcommands : {
        'owner' : getOwner,
        'daddy' : getDaddy,
        'list' : getList,
        'add' : add
    }
}
