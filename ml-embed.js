const Discord = require('discord.js');

function itemEmbed(item) {
    // inside a command, event listener, etc.
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(item.title)
        .setURL(item.permalink)
        .setDescription('Some description here')
        .addFields(
            { name: 'Regular field title', value: 'Some value here' },
            { name: '\u200B', value: '\u200B' },
            { name: 'Inline field title', value: 'Some value here', inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
        )
        .addField('Inline field title', 'Some value here', true)
        .setTimestamp()
        .setThumbnail(item.secure_thumbnail)
        .setFooter('discord-pipimi', "https://static.mlstatic.com/org-img/homesnw/img/ml-logo.png?v=3.0");

    if (item.pictures.length > 0) {
        embed.setImage(item.pictures[Math.floor(Math.random() * item.pictures.length)].secure_url);
    }

    return embed;
}

exports.itemEmbed = itemEmbed;