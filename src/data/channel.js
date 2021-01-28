const parseChannel = (channel) => {
    return {
        client : channel.client,
        createdAt : channel.createdAt,
        createdTimestamp : channel.createdTimestamp,
        deletable : channel.deletable,
        deleted : channel.deleted,
        guild : channel.guild,
        id : channel.id,
        manageable: channel.manageable,
        members : channel.members,
        name : channel.name,
        parent : channel.parent,
        parentID : channel.parentID,
        permissionOverwrites : channel.permissionOverwrites,
        permissionsLocked : channel.permissionsLocked,
        position : channel.position,
        rawPosition : channel.rawPosition,
        type : channel.type,
        viewable : channel.viewable
    }
}

const getChannelById = (message, id) => {
    const channel = message.guild.channels.cache.map(channel => {
        return parseChannel(channel)
    }).filter(channel => {
        if (channel.id === id)
            return true
    })[0]

    return channel
}

const getChannelsForGuild = (message) => {
    return message.guild.channels.cache
}

module.exports = {
    parseChannel,
    getChannelsForGuild,
    getChannelById
}