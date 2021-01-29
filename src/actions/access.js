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
        return { message: 'Invalid user/role' }
    }

    return { message: 'Done!' }
}

const remove = async (args, message) => {
    const {type, id} = getType(args[2])
    const guildId = getGuildId(message)
    if (type === types.role) {
        await permissions.removeRole(guildId, id)
    } else if (type === types.user) {
        await permissions.removeUser(guildId, id)
    } else {
        return { message: 'Invalid user/role' }
    }

    return { message: 'Done!' }
}

const check = async (args, message) => {
    let byId = message.author.id
    if (args[2]) {
        const { type, id } = getType(args[2])
        byId = id
    }

    if (!byId)
        return { message : 'User not recognised'}

    const hasAccess = await permissions.checkUserPermissions(byId, message)
    return { message: `User ${byId} ${hasAccess === true ? 'has access' : 'do not have access'}` }
}

module.exports = {
    commandString : 'access',
    subcommands : {
        'owner' : getOwner,
        'daddy' : getDaddy,
        'list' : getList,
        'add' : add,
        'remove' : remove,
        'check' : check,
    }
}
