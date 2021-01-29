
let Client
const initUser = (c) => Client = c

const getUser = async (id) => {
    const user = await Client.users.fetch(id)
    return user
}

const getUserFromGuild = async (guild, id) => {
    const user = await guild.members.cache.get(id)
    return user
}

const getUserFromMessage = (message, id) => {
    return message.guild.members.cache.map(u => {
        if (u.id === id)
            return u
    }).filter(u => {
        if (u)
            return true
    })[0] || {}
}

const getUserByNickname = (message, nickname) => {
    return message.guild.members.cache.map(u => {
        if (u.nickname === nickname)
            return u
    }).filter(u => {
        if (u)
            return true
    })[0] || {}
}

module.exports = {
    initUser,
    getUser,
    getUserFromMessage,
    getUserByNickname,
    getUserFromGuild,
}