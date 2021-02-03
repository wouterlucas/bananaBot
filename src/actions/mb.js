const {getGuildId} = require('../data/guild')
const {getType, types} = require('../data/types')
const {getChannelsForGuild} = require('../data/channel')
const db = require('../db')

const TABLENAME = 'memoryBank'

const multilineString = (str, maxLength) => {
    const stringArray = str.match(new RegExp('.{1,' + maxLength + '}', 'g'));
    return stringArray || []
}

const getMbListResponse = (mbList) => {
    let responseStr = '```| Name                 | Alts                                   | Reason                                                  |\n'
    responseStr       += '| ==================== | ====================================== | ======================================================= |\n'
    mbList.forEach(entry => {
        const nameLength = 20
        const altLength = 38
        const reasonLength = 55

        const name = multilineString(entry.name, nameLength)
        const alts = multilineString(entry.alts ? entry.alts.join(',') : '', altLength)
        const reason = multilineString(entry.reason, reasonLength)

        // write a multiline block
        let index = 0
        const createLineItem = (name, alts, reason, index) => {
            const nameLine = (name[index] ? name[index] : '').padEnd(nameLength, ' ')
            const altLine = (alts[index] ? alts[index] : '').padEnd(altLength, ' ')
            const reasonLine = (reason[index] ? reason[index]: '').padEnd(reasonLength, ' ')

            responseStr   += `| ${nameLine} | ${altLine} | ${reasonLine} |\n`

            index++
            if (name[index] || alts[index] || reason[index])
                createLineItem(name, alts, reason, index)
            else
                responseStr += '| -------------------- | -------------------------------------- | ------------------------------------------------------- |\n'
        }

        createLineItem(name, alts, reason, index)
    });

    responseStr += '```'
    return responseStr
}

const getMbList = async (args, message) => {
    const guildId = getGuildId(message)

    const mbList = await db.get(guildId, TABLENAME)
    if (!mbList)
        return { message : 'Memory bank is empty'}


    return { message : getMbListResponse(mbList) }
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

    return { message: getMbListResponse(searchData) }
}

const presenceCheckMb = async (args, message) => {
    const guildId = getGuildId(message)

    const mbList = await db.get(guildId, TABLENAME)
    if (!mbList)
        return { message : 'No users in list, please add one first' }

    const flatMbList = []
    mbList.forEach(entry => {
        flatMbList.push(entry.name.toLowerCase())
        if (entry.alts)
            entry.alts.forEach(alt => {
                flatMbList.push(alt.toLowerCase())
            })
    })

    let results = []
    const channels = getChannelsForGuild(message)
    channels.forEach(channel => {
        const isVoice = (channel.type === 'voice')
        const channelName = channel.name
        if (channel.type === 'category')
            return

        channel.members.forEach(member => {
            if (flatMbList.indexOf(member.user.username.toLowerCase()) !== -1 ||
                flatMbList.indexOf(member.displayName.toLowerCase()) !== -1) {
                results.push({
                    name: member.displayName || member.user.username,
                    isVoice : isVoice,
                    channel: channelName
                })
            }
        })
    })

    let responseStr = '```| Name                 | Channel                          | Voice?                   |\n'
    responseStr       += '| -------------------- | -------------------------------- | ------------------------ |\n'
    results.forEach(entry => {
        const name = entry.name.slice(0,19)
        const channel =entry.channel.slice(0, 31)
        const voice = entry.isVoice ? 'Yes' : 'No'
        responseStr   += `| ${name.padEnd(21, ' ')}| ${(channel).padEnd(32,' ')} | ${voice.padEnd(24, ' ')} |\n`
    });

    responseStr += '```'
    return { message: responseStr }
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
