let Client
const initGuild = (c) => Client = c

const getGuildById = async (id) => {
    const guild = await Client.guilds.cache.get(id)
    return guild
}

const getGuild = (message) => {
    return message.guild
}

const getGuildId = (message) => {
    return message.guild.id
}

module.exports = {
    initGuild,
    getGuild,
    getGuildId,
    getGuildById
}