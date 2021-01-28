const db = require('../db')
const config = require('../../config.js')

const getAccessList = async (guildId) => {
    return await db.get(guildId, 'accessList')
}

const addUser = async (guildId, userId) => {
    let accessList = await getAccessList(guildId)

    if (accessList.users !== undefined)
    accessList.users = []

    accessList.users.push(userId)
    await db.put(guildId, 'accessList', accessList)
}

const addRole = async (guildId, roleId) => {
    let accessList = await getAccessList(guildId)

    if (accessList.roles !== undefined)
        accessList.roles = []

    accessList.roles.push(roleId)
    await db.put(guildId, 'accessList', accessList)
}

const daddy = async () => {
    return config.ownerId
}

const owner = async (message) => {
    return message.guild.ownerID
}

const checkUserPermissions = async (message) => {
    const guild = message.guild; // Gets guild from the Message object
    if (!guild.available) return false

    const authorId = message.author.id

    if (authorId === message.guild.ownerID)
        return true

    //mooshots always gets access
    if (authorId === config.ownerId)
        return true

    //get access list for particular guild
    const accessList = await getAccessList(message.guild.id).catch(e => { /*noop*/ })

    if (!accessList)
        return false

    if (accessList.users.indexOf(authorId) !== -1)
        return true

    //last check, if the role of the author matches the allowed roles in the db
    return accessList.roles.filter(role => {
        //message.member.roles.find(role)
        if (message.author.roles.find(role)){
            return true
        }
    }).length !== 0
}

const setupGuild = async (guildId) => {
    return await db.createTable(guildId)
}

module.exports = {
    addUser,
    addRole,
    checkUserPermissions,
    daddy,
    getAccessList,
    owner,
    setupGuild,
}