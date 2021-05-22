const Discord = require('discord.js')

const { getEmojiForClass, getEmojiForRole } = require('../helpers/emoji')

const {getGuildId} = require('../data/guild')
const {getType, types} = require('../data/types')
const {getUser, getUserFromMessage} = require('../data/user')
const db = require('../db')

const getGuildList = async (args, message) => {
    const guildId = getGuildId(message)

    const memberList = await db.get(guildId, 'guildMemberList')
    if (!memberList)
        return { message : 'No members added to guild list'}

    // build tank list
    const formattedMembers = memberList.map((member, index) => {
        const user = getUserFromMessage(message, member.id)

        let presence = '\u2716'
        if (user.presence && user.presence.status && user.presence.status !== 'offline')
            presence = (user.presence.status === 'online' ? '\u2705' : '\u2611')

        const emoji = getEmojiForClass(member.class, member.spec) || ''
        member.outputString = `${emoji ? emoji : ''} ${presence} ${member.name}`
        return member
    })

    const tankList = formattedMembers.filter(member => {
        if (member.role === 'tank')
            return true
    }).map(member => {
        return member.outputString
    }).join('\n')

    const tankEmbed = {
        name: `${getEmojiForRole('tank')} **_Tanks_**`,
        value: tankList !== '' ? tankList : '\u200B',
        inline: true
    }

    const dpsList = formattedMembers.filter(member => {
        if (member.role === 'dps')
            return true
    }).map(member => {
        return member.outputString
    }).join('\n')

    const dpsEmbed = {
        name: `${getEmojiForRole('dps')} **_DPS_**`,
        value: dpsList !== '' ? dpsList : '\u200B',
        inline: true
    }

    const healerList = formattedMembers.filter(member => {
        if (member.role === 'healer' || member.role === 'heals')
            return true
    }).map(member => {
        return member.outputString
    }).join('\n')

    const healerEmbed = {
        name: `${getEmojiForRole('healer')} **_Healers_**`,
        value: healerList !== '' ? healerList : '\u200B',
        inline: true
    }

    const unknownMembers = formattedMembers.filter(member => {
        const filtered = ['tank', 'healer', 'dps', 'heals']
        if (filtered.indexOf(member.role) === -1)
            return true
    }).map(member => {
        return member.outputString
    }).join('\n')

    const unkownEmbed = {
        name: `\u2753 **_Unknown_**`,
        value: unknownMembers !== '' ? unknownMembers : '\u200B',
        inline: true
    }

    const guildEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${message.guild.name}`)
        .setFooter('BananaBot 🍌')
        .setDescription('Member list')
        .setTimestamp()
        .addFields(
            tankEmbed, healerEmbed, dpsEmbed, unkownEmbed
        )

    return { embed : guildEmbed }
}

const addMemberToGuild = async (args, message) => {
    const guildId = getGuildId(message)
    const {type, id} = getType(args[2])

    if (type === types.channel || type === types.unknown || type === types.role)
        return { message: 'Please add by user, not role, channel or anything else'}

    const healEmoji = getEmojiForRole('healer')
    const dpsEmoji = getEmojiForRole('dps')
    const tankEmoji = getEmojiForRole('tank')

    const addMember = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Adding new member')
        .setFooter('BananaBot 🍌')
        .setDescription('Please select role on the reaction below')
        .setTimestamp()
        .addFields(
            {
                name: '**_Healer_**',
                value: healEmoji,
                inline: true
            },
            {
                name: '**_DPS_**',
                value: dpsEmoji,
                inline: true
            },
            {
                name: '**_Tank_**',
                value: tankEmoji,
                inline: true
            }
        )

    const addMemberResp = await message.channel.send({ embed: addMember })

    const reasonFilter = (reaction, user) => {
        return [dpsEmoji, healEmoji, tankEmoji].includes(reaction.emoji.name) && user.id === message.author.id;
    }

    if (!addMemberResp)
        return { message: 'Something went wrong. I\'m sorry' }

    await addMemberResp.react(tankEmoji)
    await addMemberResp.react(healEmoji)
    await addMemberResp.react(dpsEmoji)

    const collected = await addMember.awaitReactions(reasonFilter, { max: 1, time: 120000 }).catch(collected => {
        return { message : 'you reacted with neither a thumbs up, nor a thumbs down.' }
    })

    const reaction = collected.first();

    let role = 'unknown'
    if (reaction.emoji.name === tankEmoji) {
        role = 'tank'
    } else if (reaction.emoji.name === dpsEmoji) {
        role = 'dps'
    } else if (reaction.emoji.name === healEmoji) {
        role = 'heals'
    }

    const user = getUserFromMessage(message, id)
    const userServerData = await getUser(id)

    let memberList = await db.get(guildId, 'guildMemberList')

    const userData = {
        id: id,
        name: user.nickname ? user.nickname : userServerData.username,
        role: role
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
