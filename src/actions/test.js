const {getUser, getUserFromMessage, getUserByNickname} = require('../data/user')
const {types, getType} = require('../data/types')

const user = async (args, message) => {
    let byId = message.author.id
    if (args[2]) {
        const {type, id} = getType(args[2])
        if (type === types.user || type == types.nickname)
            byId = id
        else
            byId = null //not recognised, causes error case below
    }

    if (!byId)
        return { message : 'User not recognised'}

    const userData = await getUser(byId)

    let returnStr = '**User Data:**\n'
    Object.keys(userData).map(k => {
        returnStr += `${k}: ${userData[k]}\n`
    })

    const userDataFromMessage = await getUserFromMessage(message, byId)

    returnStr += '\n**From message:**\n'
    Object.keys(userDataFromMessage).map(k => {
        returnStr += `${k}: ${userDataFromMessage[k]}\n`
    })

    return {
        message : returnStr
    }
}

const command = 'test'
const subcommands = {
    'user' : user
}

const action = (arguments, message) => {
    if (subcommands[ arguments[1] ] !== undefined)
        return subcommands[ arguments[1] ](arguments, message)
}

module.exports = {
    command,
    action
}
