const spec_emojis = {
    'warrior': {'arms': '<:AssaArms:635211969376419842>', 'fury': '<:Fury:635211979526635532>', 'protection': '<:ProtWar:635211990037561404>'},
    'rogue': {'assassination': '<:AssaArms:635211969376419842>', 'combat': '<:Combat:635212067581984789>', 'subtlety': '<:Sub:635212067619602436>'},
    'hunter': {'marksmanship': '<:MM:635212165711790100>', 'beast mastery': '<:BM:635212165544017955>', 'survival': '<:Survival:635212165690949647>'},
    'warlock': {'affliction': '<:Affli:635212015669084160>', 'demonology': '<:Demo:635212015631335424>', 'destruction': '<:Destro:635212015614558228>'},
    'mage': {'arcane': '<:Arcane:635212146246025226>', 'fire': '<:Fire:635212146199887882>', 'frost': '<:Frost:635212146283774013>'},
    'paladin': {'protection': '<:ProtPala:635212127598149655>', 'retribution': '<:Ret:635212127677710346>', 'holy': '<:Holy:635212095251808256>'},
    'priest': {'discipline': '<:Disc:635212095201214504>', 'holy': '<:Holy:635212095251808256>', 'shadow': '<:Shadow:635212095247351808>'},
    'shaman': {'elemental': '<:Ele:635212038020530197>', 'enhancement': '<:Enha:635212038192234501>', 'restoration': '<:RestoSham:635212038200885258>'},
    'druid': {'balance': '<:Moonkin:635212187258060833>', 'feral combat': '<:Feral:635212187253866496>', 'restoration': '<:RestoDruid:635212187283095552>'}
}

const class_emojis = {
    'warrior': '<:Warrior:638471462923010048>',
    'rogue': '<:Rogue:638471462751305750>',
    'hunter': '<:Hunter:638471462918946836>',
    'warlock': '<:Warlock:638471462927204379>',
    'mage': '<:Mage:638471462935855115>',
    'paladin': '<:Paladin:638471462914752512>',
    'priest': '<:Priest:638471462914883597>',
    'shaman': '<:Shaman:638471462910558219>',
    'druid': '<:Druid:638471462818414594>'
}

const role_emojis = {
    //'dps': '<:Dps:686182657738014738>',
    'dps' : ':crossed_swords:',
    //'healer': '<:Healer:686182658161508362>',
    'healer' : ':helmet_with_cross:',
    //'tank': '<:Tank:686182658065039384>'
    'tank' : ':shield:'
}

const getEmojiForClass = (emojiClass = '', spec = '') => {
    if (spec)
        return spec_emojis[emojiClass.toLowerCase()][spec.toLowerCase()]
    else
        return class_emojis[emojiClass.toLowerCase()]
}

const getEmojiForRole = (role = '') => {
    return role_emojis[role.toLowerCase()]
}

module.exports = {
    getEmojiForClass,
    getEmojiForRole
}