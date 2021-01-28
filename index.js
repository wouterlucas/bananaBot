const Discord = require('discord.js')
const { connect } = require('http2')
const bot = new Discord.Client()
const config = require('./config.js')
const {initUser} = require('./src/data/user')
const replies = require('./src/replies')

initUser(bot)

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
    Object.keys(replies).forEach(r => {
        if (msg.content.toLocaleLowerCase().startsWith(r))
            msg.channel.send(replies[r])
    })

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