const Discord = require('discord.js')

const { getEmojiForClass, getEmojiForRole } = require('../helpers/emoji')

const {getGuildId} = require('../data/guild')
const {getGuildRoles, getRoleById} = require('../data/roles')
const {getType, types} = require('../data/types')
const db = require('../db')

const MAX_ITEMS_PER_LIST = 40

const roleLookup = {
    'memberRole' : 'Members',
    'healerRole' : 'Healers',
    'tankRole' : 'Tanks',
    'rdpsRole' : 'Ranged DPS',
    'mdpsRole' : 'Melee DPS',
    'gearCheckRole' : 'Gear Checked Members',
    'progressionRaidRole' : 'Progression Raid Members'
}

const filterMembersByRole = (members, roleId, excludeRoleId = null) => {
    const resp = members.filter(member => {
        let hasExcludedRole = false
        const roles = member.roles._roles.filter(r => {
            if (r.id === excludeRoleId)
                hasExcludedRole = true

            if (r.id === roleId)
                return true
            return false
        })

        if (hasExcludedRole)
            return false

        if (roles.size > 0)
            return true
        return false
    })

    return resp
}

const getGuildList = async (args, message) => {
    const guildId = getGuildId(message)
    const guildRoles = getGuildRoles(message)

    const { memberRole, healerRole, tankRole, rDpsRole, mDpsRole, gearCheckRole, progressionRaidRole } = await getRoles(guildId)
    if (!memberRole)
        return { message: 'No guild role set, please use setGuildRole to assign a discord guild role'}

    // build guild list
    const guildMembers = guildRoles.filter(role => {
        if (role.id === memberRole)
            return true
        return false
    }).map(role => {
        return role.members
    })[0]

    const tanks = filterMembersByRole(guildMembers, tankRole)
    const heals = filterMembersByRole(guildMembers, healerRole)
    const rDps = filterMembersByRole(guildMembers, rDpsRole)
    const mDps = filterMembersByRole(guildMembers, mDpsRole)
    const gearChecked = filterMembersByRole(guildMembers, gearCheckRole)
    const progressionMembers = filterMembersByRole(guildMembers, progressionRaidRole)

    const guildTotals = [{
        'name' : 'Totals',
        'value': `Members: ${guildMembers.size}`,
    },
    {
        'name' : 'Roles',
        'value': `${getEmojiForRole('tank')} Tanks: ${tanks.size}`,
        'inline': true
    },{
        'name' : '\u200B',
        'value': `${getEmojiForRole('heals')} Healers: ${heals.size}`,
        'inline' : true
    },{
        'name': '\u200B',
        'value': '\u200B',
        'inline' : true
    },{
        'name' : '\u200B',
        'value': `${getEmojiForRole('rdps')} rDPS: ${rDps.size}`,
        'inline': true
    },{
        'name' : '\u200B',
        'value': `${getEmojiForRole('mdps')} mDPS: ${mDps.size}`,
        'inline': true,
    },{
        'name': '\u200B',
        'value': '\u200B',
        'inline' : true
    },
    {
        'name' : 'Raid stats',
        'value': `:white_check_mark: Gear check: ${gearChecked.size}`,
        'inline' : true
    },{
        'name' : '\u200B',
        'value': `:zap: Progression: ${progressionMembers.size}`,
        'inline' : true
    },{
        'name': '\u200B',
        'value': '\u200B',
        'inline' : true
    }]

    const instructions = [
        {
            'name': '\u200B',
            'value' : 'Use `bb guild <role>` to get list of members.\n E.g. `bb guild tanks`.\n\n To get all members, use `bb guild all`\n'
        }
    ]

    const guildEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${message.guild.name}`)
        .setFooter('BananaBot 🍌')
        .setDescription('Member list')
        .setTimestamp()
        .addFields(
            guildTotals,
            instructions
        )

    return { embed : guildEmbed }
}



const getMembers = async (args, message, type = 'guildMemberRole', exclude = null) => {
    const guildId = getGuildId(message)
    const guildRoles = getGuildRoles(message)

    const roles = await getRoles(guildId)

    // build guild list
    const guildMembers = guildRoles.filter(role => {
        if (role.id === roles.memberRole)
            return true
        return false
    }).map(role => {
        return role.members
    })[0]

    const includeRole = roles[type]
    const excludeRole = roles[exclude]
    const members = filterMembersByRole(guildMembers, includeRole, excludeRole)

    const membersList = members.map(member => {
        let displayName = '{{gearcheck}} ' + (member.displayName || member.name).replace(' ', '').substring(0, 12) + ' '

        let gearCheckComplete = false
        let foundRole = false
        member.roles._roles.forEach(role => {
            if (role.id === roles.gearCheckRole)
                gearCheckComplete = true
            if (role.id === roles.progressionRaidRole)
                displayName += getEmojiForRole('Progression')

            // only render roles when asking for "all"
            if (type !== 'memberRole')
                return

            // if we already found a role, skip it
            if (foundRole)
                return

            if (role.id === roles.healerRole) {
                displayName += getEmojiForRole('Heals') + ' '
                return foundRole = true
            }

            if (role.id === roles.tankRole) {
                displayName += getEmojiForRole('Tank') + ' '
                return foundRole = true
            }

            if (role.id === roles.rDpsRole) {
                displayName += getEmojiForRole('rdps') + ' '
                return foundRole = true
            }

            if (role.id === roles.mDpsRole) {
                displayName += getEmojiForRole('mdps') + ' '
                return foundRole = true
            }
        })

        displayName = displayName.replace('{{gearcheck}}', gearCheckComplete ? getEmojiForRole('gearcheck') : getEmojiForRole('nogearcheck'))
        return displayName
    })

    const embedType = roleLookup[ type ] || 'All members'
    const embedGuildName = message.guild.name

    if (membersList.length > MAX_ITEMS_PER_LIST) {
        let chunks = Math.ceil(membersList.length/MAX_ITEMS_PER_LIST)
        const chunkedMemberList = []
        while (chunks > 0) {
            chunkedMemberList.push( membersList.splice(0, MAX_ITEMS_PER_LIST) )
            chunks--
        }

        const total = chunkedMemberList.length
        const embeds = chunkedMemberList.map( (m, index) => {
            return generateMembersEmbed(embedGuildName, embedType, m, index, total)
        })

        return { embeds: embeds }
    }

    const membersEmbed = generateMembersEmbed(embedGuildName, embedType, membersList)
    return { embed : membersEmbed }
}

const generateMembersEmbed = (guildName, type, membersList, index, total) => {
    const entriesPerList = Math.ceil(membersList.length / 3)
    const firstValue = membersList.splice(0, entriesPerList).join('\n')
    const secondValue = membersList.splice(0, entriesPerList).join('\n')
    const thirdValue = membersList.splice(0, entriesPerList).join('\n')

    const membersEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${guildName}`)
        .setFooter('BananaBot 🍌')
        .setDescription(`${type} ${total ? ((index+1).toString() + '/' + total.toString()) : ''}`)
        .setTimestamp()
        .addFields(
            {
                name: '\u200B',
                value: firstValue || '\u200B',
                inline: true
            },
            {
                name: '\u200B',
                value: secondValue || '\u200B',
                inline: true,
            },
            {
                name: '\u200B',
                value: thirdValue || '\u200B',
                inline: true
            }
        )

    return membersEmbed
}

const setRole = async (args, message, dbType) => {
    const guildId = getGuildId(message)
    const {type, id} = getType(args[2])

    if (type !== types.role)
        return { message: 'Please provide valid discord role'}

    let roles = await db.get(guildId, 'guildRoleMapping')
    if (!roles) roles = {}
    roles[ dbType ] = id

    await db.put(guildId, 'guildRoleMapping', roles)
    return { message: `Saved ${id} as ${dbType} role`}
}

const getRoles = async (guildId) => {
    const roles = await db.get(guildId, 'guildRoleMapping')
    if (!roles) return {}

    return roles
}

const setGuildRole = async (args, message) => { setRole(args, message, 'memberRole') }
const setHealerRole = async (args, message) => { setRole(args, message, 'healerRole') }
const setTankRole = async (args, message) => { setRole(args, message, 'tankRole') }
const setRDpsRole = async (args, message) => { setRole(args, message, 'rdpsRole') }
const setMDpsRole = async (args, message) => { setRole(args, message, 'mdpsRole') }
const setGearCheckRole = async (args, message) => { setRole(args, message, 'gearCheckRole') }
const setProgressionRaidRole = async (args, message) => { setRole(args, message, 'progressionRaidRole') }

const getTanks = async (args, message) => { return getMembers(args, message, 'tankRole') }
const getHeals = async (args, message) => { return getMembers(args, message, 'healerRole') }
const getRdps = async (args, message) => { return getMembers(args, message, 'rdpsRole') }
const getMdps = async (args, message) => { return getMembers(args, message, 'mdpsRole') }
const getGearCheck = async (args, message) => { return getMembers(args, message, 'gearCheckRole') }
const getProgressionRaid = async (args, message) => { return getMembers(args, message, 'progressionRaidRole') }
const getAll = async (args, message) => { return getMembers(args, message, 'memberRole') }
const getToGearCheck = async (args, message) => { return getMembers(args, message, 'memberRole', 'gearCheckRole') }

module.exports = {
    commandString : 'guild',
    command: getGuildList,
    subcommands : {
        'list' : getGuildList,
        'setGuildRole' : setGuildRole,
        'setHealerRole' : setHealerRole,
        'setRDpsRole': setRDpsRole,
        'setMDpsRole' : setMDpsRole,
        'setTankRole' : setTankRole,
        'setGearCheckRole': setGearCheckRole,
        'setProgressionRaidRole': setProgressionRaidRole,
        'tanks': getTanks,
        'heals': getHeals,
        'rdps': getRdps,
        'mdps': getMdps,
        'gearcheck' : getGearCheck,
        'progression': getProgressionRaid,
        'nogearcheck' : getToGearCheck,
        'all': getAll,
    },
    help : {
        'list' : ['','Summary of the guild members'],
        'all' : ['','List all members in the guild'],
        'tank' : ['', 'List all tanks'],
        'heals' : ['', 'List all healers'],
        'rdps' : ['', 'List all Ranged DPS'],
        'mdps' : ['', 'List all Melee DPS'],
        'gearcheck' : ['', 'List all members that completed gear check'],
        'progression' : ['', 'List all progression raid members'],
        'toGearCheck' : ['', 'List all that did not complete a gear check'],
    }
}
