const {getChannelsForGuild} = require('../data/channel')
const {getType, types} = require('../data/types')

const deleteMessages = async channel => {
    const messages = await channel.messages.fetch({ limit: 100 })

    if (!messages)
        return

    messages.forEach(message => {
        if (message.pinned)
            return

        message.delete()
    })

    return
}

const checkIfChannelHasMoreMessages = async channel => {
    const messages =  await channel.messages.fetch({ limit: 5 })
    console.log('checkIfChannelHasMoreMessages message length: ', messages.size)
    return messages.size !== 0
}

const cleanChannel = async (args, message) => {
    let channelId

    if (args[2]) {
        const {type, id } = getType(args[2])
        if (type !== types.channel)
            return { message: 'Please provide valid channel'}

        channelId = id
    } else {
        channelId = message.channel.id
    }

    const channels = getChannelsForGuild(message)
    const channel = channels.get(channelId)

    deleteMessages(channel)
}

module.exports = {
    commandString : 'channel',
    subcommands : {
        'clean' : cleanChannel
    },
    help : {
        'clean' : ['[<channel>]','Clean all messages in channel except pinned. If no channel name is provided will clean in current channel (including the command to start this)']
    }
}
