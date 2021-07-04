const Discord = require('discord.js');

function itemEmbed(item) {
    // inside a command, event listener, etc.
    const embed = new Discord.MessageEmbed()
        .setColor('#ffe600')
        .setTitle(item.title)
        .setURL(item.permalink)
        // .setDescription(item.id)
        .addField('Precio', `${item.currency_id} ${item.price}`, false)
        .addFields(
            item.attributes.sort(isGamerSort).slice(0, 12).map(attribute => mapAttribute(attribute))
        )
        .setTimestamp()
        .setThumbnail(item.secure_thumbnail)
        .setFooter('discord-pipimi', "https://static.mlstatic.com/org-img/homesnw/img/ml-logo.png?v=3.0");

    // if (item.pictures.length > 0) {
    //     embed.setImage(item.pictures[Math.floor(Math.random() * item.pictures.length)].secure_url);
    // }

    return embed;
}

function isGamerSort(a, b) {
    return a.id === 'IS_GAMER' ? -1 : 0;
}

function mapAttribute(attribute) {
    return {
        name: attribute.id === 'IS_GAMER' ? "Es ｇａｍｅｒ" : attribute.name,
        value: attribute.value_name === null ? 'No' : attribute.value_name,
        inline: true
    }
}

exports.itemEmbed = itemEmbed;