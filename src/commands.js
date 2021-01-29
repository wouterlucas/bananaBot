const config = require('../config.js')
const actions = require('./actions/index.js')
const {checkUserPermissions} = require('./permissions/index')

let commandsMap = {}
let commandsArray = []

const register = (commandString, command, subcommands) => {
    if (!commandsMap[commandString])
        commandsMap[ commandString ] = {
            command : command,
            subcommands : subcommands
        }

    //update actions list
    commandsArray = Object.keys(commandsMap)
}

Object.keys(actions).forEach(a => {
    register(actions[a].commandString, actions[a].command, actions[a].subcommands)
})

const isResolveable = (command) => {
    if (commandsArray.indexOf(command) !== -1)
        return true
    else
        return false
}

const getHelpMessage = (subcommand) => {
    let helpStr = "🍌 **Hi!** This is the *Squashed Banana's* Helper bot 🍌\n\n"

    if (subcommand) {
        if (commandsMap[subcommand] === undefined)
            return 'Command not found, try help\n'

        if (commandsMap[subcommand].subcommands === undefined)
            return `Command ${subcommand} does not have any additional options\n`

        helpStr += `Commands for ${subcommand}:\n`
        const subcommandList = Object.keys(commandsMap[subcommand].subcommands)
        subcommandList.forEach(command => {
            helpStr += `    \`${command}\` \n`
        })
    } else {
        helpStr += 'To interact with me please use:\n'
        helpStr += `\`${config.prefix} <command> [<subcommand>] [<arguments>]\``
        helpStr += '\n\n'

        helpStr += 'Available commands:\n'
        commandsArray.forEach(command => {
            helpStr += `   \`${command} \`\n`
        })

        helpStr += `\n please use \`${config.prefix} help <subcommand>\` to learn more`
    }

    return helpStr
}

const parse = async (msg) => {
    //strip prefix
    const cleanedMessage = msg.content.replace(config.prefix + ' ', '')
    //split by space
    const args = cleanedMessage.split(' ')
    const command = args[0]
    const subcommand = args[1]

    if (!command)
        return { message: 'Command not found' }

    const authorId = msg.author.id
    if (await checkUserPermissions(authorId, msg) === false)
        return

    if (command === 'help')
        return { message : getHelpMessage(subcommand) }

    //check if first argument resolves as a command
    if (!isResolveable( command ))
        return

    //check if module has subcommands
    if (subcommand !== undefined) {
        if (commandsMap[command].subcommands !== undefined && commandsMap[command].subcommands[subcommand] !== undefined) {
            return await commandsMap[command].subcommands[subcommand](args, msg)
        } else {
            return { message: 'Subcommand not found' }
        }
    }

    return await commandsMap[ command ].command(args, msg)
}

module.exports = {
    register,
    parse
}