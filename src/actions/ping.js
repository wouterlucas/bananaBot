const command = 'ping'
const action = (arguments) => {
    return new Promise( resolve => {
        resolve({
            message : 'pong!'
        })
    })
}

module.exports = {
    command,
    action
}
