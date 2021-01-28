const Discord = require('discord.js')
const { connect } = require('http2')
const bot = new Discord.Client()
const config = require('./config.js')
const {initUser} = require('./src/data/user')

initUser(bot)

const commands = require('./src/commands')

const login = () => {
    bot.login(config.token);
}

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`)
})

bot.on('message', msg => {
    //easter egg
    if (msg && msg.content && msg.content.toLocaleLowerCase().startsWith('good bot'))
        return msg.channel.send('good hooman')

    if (msg && msg.content && msg.content.startsWith(config.prefix)) {
        console.log('Got message for BananaBot, resolving command!')
        commands.parse(msg).then(resp => {
            if (resp && resp.message)
                msg.channel.send(resp.message)
            else
                msg.channel.send('Command not found')
        }).catch(e => {
            console.log('Error parsing command: ', e)
        })
    }
})

bot.on('disconnect', (errMsg, code) => {
    console.log(`Bot disconnected with code: ${code} for reason: ${errMsg}`)
    login()
})

login()