const db = require('../db')
const config = require('../../config.js')
const {getRolesForUser} = require('../data/roles')

const getAccessList = async (guildId) => {
    return await db.get(guildId, 'accessList')
}

const addUser = async (guildId, userId) => {
    let accessList = await getAccessList(guildId).catch(e => {})

    if (!accessList)
        accessList = {
            users : [],
            roles : []
        }

    if (accessList.users === undefined)
        accessList.users = []

    accessList.users.push(userId)
    await db.put(guildId, 'accessList', accessList)
}

const removeUser = async (guildId, userId) => {
    let accessList = await getAccessList(guildId).catch(e => {})

    if (!accessList)
        return

    if (accessList.users === undefined)
        return

    const index = accessList.users.indexOf(userId)
    accessList.users.splice(index, 1)
    await db.put(guildId, 'accessList', accessList)
}

const addRole = async (guildId, roleId) => {
    let accessList = await getAccessList(guildId).catch(e => {})

    if (!accessList)
        accessList = {
            users : [],
            roles : []
        }

    if (accessList.roles === undefined)
        accessList.roles = []

    accessList.roles.push(roleId)
    return await db.put(guildId, 'accessList', accessList)
}

const removeRole = async (guildId, roleId) => {
    let accessList = await getAccessList(guildId).catch(e => {})

    if (!accessList)
        return

    if (accessList.roles === undefined)
        return

    const index = accessList.roles.indexOf(roleId)
    accessList.roles.splice(index, 1)
    return await db.put(guildId, 'accessList', accessList)
}

const daddy = async () => {
    return config.ownerId
}

const owner = async (message) => {
    return message.guild.ownerID
}

const checkUserPermissions = async (authorId, message) => {
    const guild = message.guild; // Gets guild from the Message object
    if (!guild.available) return false

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
    const roles = getRolesForUser(message, authorId)

    if (roles.length === 0)
        return false

    const res = roles.map(role => {
        if (role.id)
            return role.id
    }).filter(roleId => {
        if (accessList.roles.indexOf(roleId) !== -1)
            return true
    })

    return res.length !== 0
}

const setupGuild = async (guildId) => {
    return await db.createTable(guildId)
}

module.exports = {
    addUser,
    removeUser,
    addRole,
    removeRole,
    checkUserPermissions,
    daddy,
    getAccessList,
    owner,
    setupGuild,
}