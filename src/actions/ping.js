const action = (arguments) => {
    return new Promise( resolve => {
        resolve({
            message : 'pong!'
        })
    })
}

module.exports = {
    commandString : 'ping',
    command : action
}
