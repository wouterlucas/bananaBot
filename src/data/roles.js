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
            members: role.members,
            permissions: role.permissions
        }
    })
}

const getRolesForUser = (message, id) => {
    const user = getUserFromMessage(message, id)
    return user.roles.cache
}

const getRoleByName = (message, name) => {
    return getGuildRoles(message).filter(role =>{
        if (role.name === name)
            return true
    })[0]
}

const getRoleById = (message, id) => {
    return getGuildRoles(message).filter(role =>{
        if (role.id === id)
            return true
    })[0]
}

module.exports = {
    getGuildRoles,
    getRolesForUser,
    getRoleById,
    getRoleByName
}