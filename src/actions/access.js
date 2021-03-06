const permissions = require('../permissions/index.js')
const {getGuildId} = require('../data/guild')
const {getType, types} = require('../data/types')
const {getUser, getUserFromMessage} = require('../data/user')
const {getRolesById} = require('../data/roles')

const getOwner = async (args, message) => {
    const owner = await getUser(await permissions.owner(message))
    return { message : `Guild owner is ${owner.username}`}
}

const getDaddy = async (args, message) => {
    const daddy = await getUser(await permissions.daddy(message))
    return { message : `Daddy is ${daddy.username}`}
}

const getList = async (args, message) => {
    const guildId = getGuildId(message)
    const accessList = await permissions.getAccessList(guildId)

    if (!accessList)
        return { message: 'No access list configured' }

    let responseStr = 'Access list:\n'
    responseStr += '    Users: '
    accessList.users.forEach(u => {
        const _user = getUserFromMessage(message, u)
        responseStr += _user.displayName + ', '
    })
    responseStr += '\n'
    responseStr += '    Roles: '
    accessList.roles.forEach(r => {
        const _role = getRolesById(message, r)
        responseStr +=  _role.name + ', '
    })
    return { message: responseStr }
}

const add = async (args, message) => {
    const {type, id} = getType(args[2])
    const guildId = getGuildId(message)
    if (type === types.role) {
        await permissions.addRole(guildId, id)
    } else if (type === types.user || type === types.nickname) {
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
    },
    help : {
        'owner' : ['', 'Shows the owner of this guild and bot'],
        'daddy'  : ['', "Whos BananaBot's daddy?"],
        'list' : ['', 'List people who have access to the bot'],
        'add' : ['<@role> or <@user>', 'Add role or user to the bot access list'],
        'remove' : ['<@role> or <@user>', 'Remove role or access to the bot'],
        'check' : ['(optional) <@user>', 'Check if user has access. If no user provided checks message author']
    }
}
