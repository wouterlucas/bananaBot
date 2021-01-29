const {getGuild, getGuildId} = require('../data/guild')
const {getType, types} = require('../data/types')
const {getUser, getUserFromMessage} = require('../data/user')
const db = require('../db')

const getGuildList = async (args, message) => {
    const guildId = getGuildId(message)

    const memberList = await db.get(guildId, 'guildMemberList')
    if (!memberList)
        return { message : 'No members added to guild list'}

    let responseStr = '```| Member           | Role        | status    |\n'
    responseStr       += '| ---------------- | ----------- | --------- |\n'
    memberList.forEach(member => {
        const user = getUserFromMessage(message, member.id)
        const memberName = member.name.slice(0, 15)
        responseStr   += `| ${memberName.padEnd(17, ' ')}| ${(member.role ? member.role : '').padEnd(11,' ')} | ${(user.presence.status).padEnd(9, ' ')} |\n`
    });

    responseStr += '```'

    return { message : responseStr }
}

const addMemberToGuild = async (args, message) => {
    const guildId = getGuildId(message)
    const {type, id} = getType(args[2])

    if (type === types.channel || type === types.unknown || type === types.role)
        return { message: 'Please add by user, not role, channel or anything else'}


    const user = getUserFromMessage(message, id)
    const userServerData = await getUser(id)

    let memberList = await db.get(guildId, 'guildMemberList')

    const userData = {
        id: id,
        name: user.nickname ? user.nickname : userServerData.username,
        role: args[3] ? args[3] : ''
    }

    if (!memberList)
        memberList = []

    memberList.push(userData)

    await db.put(guildId, 'guildMemberList', memberList)
    return { message : 'Done!' }
}

const removeMemberFromGuild = async (args, message) => {
    const guildId = getGuildId(message)
    const {type, id} = getType(args[2])

    let memberList = await db.get(guildId, 'guildMemberList')

    memberList = memberList.filter(member => {
        if (type === types.user && member.id === id)
            return false
        if (type === types.unknown && member.name === args[2])
            return false

        return true
    })

    await db.put(guildId, 'guildMemberList', memberList)
    return { message : 'Done!' }
}

module.exports = {
    commandString : 'guild',
    subcommands : {
        'list' : getGuildList,
        'add' : addMemberToGuild,
        'remove' : removeMemberFromGuild
    },
    help : {
        'list' : ['','List all members in the guild'],
        'add'  : ['<@mention> <role>','Add member to the guild'],
        'remove' : ['<name in table>','Remove member from the guild']
    }
}
