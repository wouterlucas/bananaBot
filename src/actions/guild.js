const Discord = require('discord.js')

const {getGuildId} = require('../data/guild')
const {getType, types} = require('../data/types')
const {getUser, getUserFromMessage} = require('../data/user')
const db = require('../db')

const getGuildList = async (args, message) => {
    const guildId = getGuildId(message)

    const memberList = await db.get(guildId, 'guildMemberList')
    if (!memberList)
        return { message : 'No members added to guild list'}

    let members = { name: 'Member', inline: true, value: ''}
    let roles = { name: 'Role', inline: true, value: ''}
    let status = { name: 'Status', inline: true, value: ''}

    memberList.forEach(member => {
        const user = getUserFromMessage(message, member.id)
        members.value += member.name + '\n'
        roles.value += (member.role ? member.role : '') + '\n'
        status.value += (user.presence ? user.presence.status : 'not found') + '\n'
    })

    const guildEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Guild: ${message.guild.name}`)
        .setFooter('BananaBot 🍌')
        .setDescription('Member list')
        .setTimestamp()
        .addFields(
            { name: '\u200B', value: '\u200B' },
            members, roles, status,
            { name: '\u200B', value: '\u200B' },
        )

    return { embed : guildEmbed }
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
        if ( (type === types.user || type === types.nickname) && member.id === id)
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
