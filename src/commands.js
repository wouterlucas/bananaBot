const config = require('../config.js')
const actions = require('./actions/index.js')

let commandsMap = {}
let commandsArray = []

const register = (command, callback) => {
    if (!commandsMap[command])
        commandsMap[ command ] = callback

    //update actions list
    commandsArray = Object.keys(commandsMap)
}

Object.keys(actions).forEach(a => {
    register(actions[a].command, actions[a].action)
})

const isResolveable = (command) => {
    if (commandsArray.indexOf(command) !== -1)
        return true
    else
        return false
}

const getHelpMessage = () => {
    let helpStr = "Hi! This is the Squashed Banana's Helper bot \n"
    helpStr += 'Available commands: \n'
    commandsArray.forEach(command => {
        helpStr += `    ${command} \n`
    })
    return helpStr
}

const parse = (msg) => {
    return new Promise( (resolve, reject) => {
        //strip prefix
        const cleanedMessage = msg.content.replace(config.prefix + ' ', '')
        //split by space
        const arguments = cleanedMessage.split(' ')
        const command = arguments[0]

        if (!command)
            reject('Command not found')

        if (command === 'help')
            resolve({ message : getHelpMessage() })

        //check if first argument resolves as a command
        if (isResolveable( command ))
            commandsMap[ command ](arguments, msg).then(r => {
                resolve(r)
            })
    })
}

module.exports = {
    register,
    parse
}