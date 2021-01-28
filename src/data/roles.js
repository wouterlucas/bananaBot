const {getUserFromMessage} = require('./user')

const getGuildRoles = (message) => {
    return message.guild.roles.cache.map(role => {
        return {
            id : role.id,
            name: role.name,
            createdAt: role.createdAt,
            deleted: role.deleted,
            editable: role.editable,
            hexColor: role.hexColor,
            members: role.members.map(m => { return m.name }),
            permissions: role.permissions
        }
    })
}

const getRolesForUser = (message, id) => {
    const user = getUserFromMessage(message, id)
    return user.roles.cache
}

module.exports = {
    getGuildRoles,
    getRolesForUser
}