const Discord = require('discord.js');

const MAX_FIELDS = 9;
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_FIELD_LENGTH = 30;

function articleEmbed(message, article) {
    console.log('creating embed', article.item.id);
    const {item, description} = article;
    return new Discord.MessageEmbed()
        .setColor('#ffe600')
        .setTitle(item.title)
        .setURL(item.permalink)
        .setDescription(truncate(description.plain_text, MAX_DESCRIPTION_LENGTH))
        .addField('Precio', `${item.currency_id} ${item.price}`, false)
        .addFields(item.attributes.sort(isGamerSort).slice(0, MAX_FIELDS).map(attribute => mapAttribute(attribute)))
        .setTimestamp()
        .setThumbnail(item.secure_thumbnail)
        .setFooter(message.author.username, "https://static.mlstatic.com/org-img/homesnw/img/ml-logo.png?v=3.0");
}

function isGamerSort(a, b) {
    return a.id === 'IS_GAMER' ? -1 : 0;
}

function mapAttribute(attribute) {
    return {
        name: attribute.id === 'IS_GAMER' ? "Es ｇａｍｅｒ" : attribute.name,
        value: attribute.value_name === null ? 'No' : truncate(attribute.value_name, MAX_FIELD_LENGTH),
        inline: true
    }
}

function truncate(str, len) {
    if (str.length <= len) {
        return str;
    }
    return str.substring(0, len - 1) + '…';
}

exports.articleEmbed = articleEmbed;