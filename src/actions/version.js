const package = require('../../package.json')
module.exports = {
    commandString : 'version',
    command: () => {
        return Promise.resolve({ message : `BananaBot v${package.version}` })
    },
    help : {
        'version' : ['', 'Returns the version']
    }
}
