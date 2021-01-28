const getGuild = (message) => {
    return message.guild
}

const getGuildId = (message) => {
    return message.guild.id
}

module.exports = {
    getGuild,
    getGuildId,
}