const Discord = require('discord.js')
const bot = new Discord.Client()
const config = require('./config.js')

const commands = require('./src/commands')

bot.login(config.token);

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`)
})

bot.on('message', msg => {
    console.log('onMessage: ', msg)

    if (msg && msg.content && msg.content.startsWith(config.prefix)) {
        console.log('Got message for BananaBot, resolving command!')
        commands.parse(msg).then(resp => {
            if (resp.message)
                msg.channel.send(resp.message)
        }).catch(e => {
            console.log('Error parsing command: ', e)
        })
    }
})
