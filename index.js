const Discord = require('discord.js')
const bot = new Discord.Client()
const config = require('./config.js')
const {initUser} = require('./src/data/user')
const {initGuild} = require('./src/data/guild')
const reactions = require('./src/reactions')
const replies = require('./src/replies')
const package = require('./package.json')

initUser(bot)
initGuild(bot)

console.log('Starting BananaBot v' + package.version)

const lastRepliesAndReactionsIntervalMax = 20 //minutes
const lastRepliesAndReactions = []
const commands = require('./src/commands')
const login = () => {
    bot.login(config.token);
}

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`)
})

bot.on('message', msg => {
    //ignore our own message
    if (msg.author.username === 'BananaBot')
        return

    if (!msg || !msg.content)
        return

    // check plain replies before commands
    Object.keys(replies).forEach(reply => {
        if (msg && msg.content && msg.content.toLocaleLowerCase().startsWith(reply)) {
            const response = replies[reply]
            if (lastRepliesAndReactions.indexOf(response) !== -1) return

            msg.channel.send(response).catch(e => { console.error('Failed to send message', e)})
            lastRepliesAndReactions.push(response)
        }
    })

    // check reactions before commands
    Object.keys(reactions).forEach(reaction => {
        if (msg && msg.content && msg.content.toLocaleLowerCase().indexOf(reaction) !== -1) {
            const response = reactions[reaction]
            if (lastRepliesAndReactions.indexOf(response) !== -1) return

            response.forEach(r => { msg.react(r) })
            lastRepliesAndReactions.push(response)
        }
    })

    if (msg && msg.content && msg.content.startsWith(config.prefix)) {
        console.log('Got command ' + msg.content)
        commands.parse(msg).then(resp => {
            // single message
            if (resp && resp.message) {
                msg.channel.send(resp.message).catch(e => { console.error('Failed to send message', e)})
            }

            // handle multiple
            if (resp && resp.messages) {
                resp.messages.forEach(message => {
                    msg.channel.send(message).catch(e => { console.error('Failed to send message', e)})
                })
            }

            if (resp && resp.embed) {
                msg.channel.send(resp.embed).catch(e => { console.error('Failed to send message', e)})
            }
        }).catch(e => {
            console.log('Error parsing command: ', e)
        })
    }
})

bot.on('disconnect', (errMsg, code) => {
    console.log(`Bot disconnected with code: ${code} for reason: ${errMsg}`)
    login()
})

const lastRepliesAndReactionsCleanup = () => {
    if (lastRepliesAndReactions.length > 0)
        lastRepliesAndReactions.shift()

    const randomMinutes = Math.floor(Math.random() * lastRepliesAndReactionsIntervalMax)
    setTimeout(lastRepliesAndReactionsCleanup.bind(this),
        randomMinutes * 60 * 1000)
}
lastRepliesAndReactionsCleanup()

login()