
const types = {
    'channel' : '<#',
    'user'    : '<@',
    'nickname': '<@!',
    'role'    : '<@&',
    'unknown' : '????'
}

const getType = (string) => {
    let type = null, id
    if (string.startsWith(types.nickname))
        type = types.nickname
    else if (string.startsWith(types.role))
        type = types.role
    else if (string.startsWith(types.user))
        type = types.user
    else if (string.startsWith(types.channel))
        type = types.channel
    else
        type = types.unknown

    id = string.replace(type, '').replace('>', '')
    return { type, id }
}

module.exports = {
    types,
    getType
}
