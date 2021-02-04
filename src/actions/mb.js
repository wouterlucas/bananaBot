const Discord = require('discord.js')

const {getGuildId} = require('../data/guild')
const {getType, types} = require('../data/types')
const {getChannelsForGuild} = require('../data/channel')
const db = require('../db')

const TABLENAME = 'memoryBank'

const getMbListResponse = (mbList, title = '') => {
    let name = { name: 'Name', inline: true, value: ''}
    let alts = { name: 'Alts', inline: true, value: ''}
    let reason = { name: 'Reason', inline: true, value: ''}

    mbList.forEach(entry => {
        name.value += entry.name + '\n'

        if (entry.alts && entry.alts.length > 0)
            alts.value += entry.alts.join(',') + '\n'
        else
            alts.value += '-\n'

        reason.value += entry.reason + '\n'
    })

    const mbEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(title)
        .setFooter('BananaBot 🍌')
        .setTimestamp()
        .addFields(
            { name: '\u200B', value: '\u200B' },
            name, alts, reason,
            { name: '\u200B', value: '\u200B' },
        )

    return mbEmbed
}

const getMbList = async (args, message) => {
    const guildId = getGuildId(message)

    const mbList = await db.get(guildId, TABLENAME)
    if (!mbList || mbList.length === 0)
        return { message : 'Memory bank is empty'}


    return { embed : getMbListResponse(mbList, 'Memory Bank') }
}

const addToMb = async (args, message) => {
    const guildId = getGuildId(message)
    const {type, id} = getType(args[2])
    const reason = args.splice(3, args.length-1).join(' ')

    if (type === types.channel || type === types.role)
        return { message: 'Please add by user, not role, channel or anything else'}


    let mbList = await db.get(guildId, TABLENAME)

    const data = {
        name: args[2],
        reason : reason ? reason : '',
        alts : []
    }

    if (!mbList)
        mbList = []

        mbList.push(data)

    await db.put(guildId, TABLENAME, mbList)
    return { message : 'Done!' }
}

const removeFromMb = async (args, message) => {
    const guildId = getGuildId(message)
    const name = args[2]

    let mbList = await db.get(guildId, TABLENAME)

    mbList = mbList.filter(entry => {
        if ( entry.name === name)
            return false
        if ( entry.alts && entry.alts.indexOf(name) !== -1)
            return false

        return true
    })

    await db.put(guildId, TABLENAME, mbList)
    return { message : 'Done!' }
}

const addAltToMb = async (args, message) => {
    const guildId = getGuildId(message)
    const name = args[2]
    const altname = args[3]

    let mbList = await db.get(guildId, TABLENAME)
    if (!mbList)
        return { message : 'No users in list, please add one first' }

    const newMbList = mbList.map(entry => {
        if (entry.name === name || (entry.alts && entry.alts.indexOf(name) !== -1) ) {
            if (!entry.alts)
                entry.alts = []

            entry.alts.push(altname)
        }

        return entry
    })

    await db.put(guildId, TABLENAME, newMbList)
    return { message : 'Done!' }
}

const searchMb = async (args, message) => {
    const guildId = getGuildId(message)
    const name = args[2]

    const mbList = await db.get(guildId, TABLENAME)
    if (!mbList)
        return { message : 'No users in list, please add one first' }

    const searchData = mbList.filter(entry => {
        if (entry.name === name)
            return true
        else if (entry.alts && entry.alts.indexOf(name) !== -1)
            return true

        return false
    })

    if (searchData.length === 0)
        return { message : 'Nothing found, im sorry. I might be broken, you might be broken. We\'re all broken' }

    return { embed: getMbListResponse(searchData, 'Search') }
}

const presenceCheckMb = async (args, message) => {
    const guildId = getGuildId(message)
    const name = args[2]

    const mbList = await db.get(guildId, TABLENAME)
    if (!mbList)
        return { message : 'No users in list, please add one first' }

    const flatMbList = []
    mbList.forEach(entry => {
        flatMbList.push(entry.name.toLowerCase())
        if (entry.alts && entry.alts.length > 0)
            entry.alts.forEach(alt => {
                flatMbList.push(alt.toLowerCase())
            })
    })

    if (flatMbList.length === 0)
        return { message: 'User not found' }

    let results = {}
    const channels = getChannelsForGuild(message)
    channels.forEach(channel => {
        const isVoice = (channel.type === 'voice')
        const channelName = channel.name
        if (channel.type === 'category')
            return

        channel.members.forEach(member => {
            if (flatMbList.indexOf(member.user.username.toLowerCase()) !== -1 ||
                flatMbList.indexOf(member.displayName.toLowerCase()) !== -1) {

                const memberName = member.user.username || member.displayName
                if (results[memberName] === undefined)
                    results[memberName] = {
                        name : memberName,
                        channels: [],
                        isInVoice : false
                    }

                results[memberName].channels.push(channelName)

                if (isVoice)
                    results[memberName].isInVoice = true
            }
        })
    })

    let resultName      = { name: 'Name', inline: true, value: ''}
    let resultChannels  = { name: 'Channels', inline: true, value: ''}
    let resultIsInVoice = { name: 'In Voice?', inline: true, value: ''}

    Object.keys(results).forEach(result => {
        const res = results[result]
        resultName.value += res.name + '\n'

        const channelCount = res.channels.length
        if (channelCount > 10)
            resultChannels.value += res.channels.slice(0, 3).join(',') + `... and ${channelCount} more\n`
        else
        resultChannels.value += res.channels.join(',') + '...\n'

        resultIsInVoice.value += (res.isInVoice ? 'Yes' : 'No') + '\n'
    })

    const presenceEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Memory bank presence check!`)
        .setFooter('BananaBot 🍌')
        .setDescription('Member list')
        .setTimestamp()
        .addFields(
            { name: '\u200B', value: '\u200B' },
            resultName, resultChannels, resultIsInVoice,
            { name: '\u200B', value: '\u200B' },
        )

    return { embed: presenceEmbed }
}

module.exports = {
    commandString : 'mb',
    subcommands : {
        'list' : getMbList,
        'add' : addToMb,
        'remove' : removeFromMb,
        'alt' : addAltToMb,
        'search' : searchMb,
        'presence' : presenceCheckMb
    },
    help : {
        'list'      : ['','List everyone in the memory bank'],
        'add'       : ['<name> <reason>','Add someone to the memory bank with a reason why'],
        'remove'    : ['<name in table>','Remove member from the memory bank'],
        'alt'       : ['<name> <altname>', 'Add an alias/alt name to someone in the memory bank'],
        'search'    : ['<name>', 'Name to search memory bank for'],
        'presence'  : ['[<name>]', 'Check if someone in the memory bank is in discord/voice']
    }
}
