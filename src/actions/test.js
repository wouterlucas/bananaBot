const {getUser, getUserFromMessage, getUserByNickname} = require('../data/user')
const {getGuildRoles, getRolesForUser} = require('../data/roles')
const {getChannelById, getChannelsForGuild, parseChannel} = require('../data/channel')
const {types, getType} = require('../data/types')
const { get } = require('http')

const getId = (arg) => {
    if (arg) {
        const {type, id} = getType(arg)
        if (type === types.user || type == types.nickname)
            return id
        else
            return null //not recognised, causes error case below
    }
}

const user = async (args, message) => {
    let byId = message.author.id
    if (args[2]) {
        byId = getId(args[2])
    }

    if (!byId)
        return { message : 'User not recognised'}

    const userData = await getUser(byId)

    let returnStr = '**User Data:**\n'
    Object.keys(userData).map(k => {
        returnStr += `${k}: ${userData[k]}\n`
    })

    const userDataFromMessage = await getUserFromMessage(message, byId)

    returnStr += '\n**From message:**\n'
    Object.keys(userDataFromMessage).map(k => {
        returnStr += `${k}: ${userDataFromMessage[k]}\n`
    })

    return {
        message : returnStr
    }
}

const roles = async (args, message) => {
    let byId = message.author.id
    if (args[2]) {
        byId = getId(args[2])
    }

    if (!byId)
        return { message : 'User not recognised'}

    const guildRoles = getGuildRoles(message)
    const roleData = getRolesForUser(message, byId)

    let returnStr = '**Guild Roles:**\n'
    guildRoles.forEach(role => {
        if (role.name)
            returnStr += `${role.name} (${role.id}) \n`
    })

    returnStr += '\n**User roles:**\n'
    roleData.forEach(role => {
        returnStr += `${role.name} (${role.id}) \n`
    })

    return {
        message : returnStr
    }
}

const channel = async (args, message) => {
    let byId = message.channel.id
    if (args[2]) {
        const {type, id} = getType(args[2])
        if (type === types.channel)
            byId = id
    }

    if (!byId)
        return { message : 'Channel not recognised'}

    const guildChannels = getChannelsForGuild(message)
    let returnStr = '**Guild channels:**\n'
    guildChannels.forEach(channel => {
        returnStr += `${channel.name} \n`
    })

    const channelData = getChannelById(message, byId)
    returnStr += '**Channel info:**\n'
    Object.keys(channelData).map(k => {
        returnStr += `${k}: ${channelData[k]}\n`
    })

    return {
        message: returnStr
    }
}

module.exports = {
    commandString : 'test',
    subcommands : {
        'user' : user,
        'roles' : roles,
        'channel' : channel
    },
    help: {
        'sorry' : ['', 'This section is experimental and Mooshots is to lazy to write help messages for it. Learn to read code for this.']
    }
}
