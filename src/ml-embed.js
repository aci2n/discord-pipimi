import { MessageEmbed } from 'discord.js';

const MAX_FIELDS = 6;
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_FIELD_LENGTH = 30;

function articleEmbed(message, article) {
    const { item, description } = article;
    console.log('creating embed', item.id);

    return new MessageEmbed()
        .setColor('#ffe600')
        .setTitle(item.title)
        .setURL(item.permalink)
        .setDescription(formatDisplayString(description.plain_text, MAX_DESCRIPTION_LENGTH))
        .addField('Precio', formatPrice(item.price, item.currency_id), false)
        .addFields(extractFields(item.attributes))
        .setTimestamp()
        .setThumbnail(item.secure_thumbnail)
        .setFooter(message.author.username, "https://static.mlstatic.com/org-img/homesnw/img/ml-logo.png?v=3.0");
}

const formatPrice = (function () {
    const formatters = new Map();
    formatters.set('ARS', Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }));

    return (price, currency) => {
        const formatter = formatters.get(currency);
        return formatter ? formatter.format(price) : `${currency} ${price}`;
    }
}());

function extractFields(attributes) {
    return [...attributes]
        .sort((a, _) => a.id === 'IS_GAMER' ? -1 : 0)
        .filter(attr => attr.name && attr.value_name)
        .slice(0, MAX_FIELDS)
        .map(attr => ({
            name: attr.id === 'IS_GAMER' ? "Es ｇａｍｅｒ" : attr.name,
            value: formatDisplayString(attr.value_name, MAX_FIELD_LENGTH),
            inline: true
        }));
}

function formatDisplayString(str, len) {
    const result = str.replace(/\s+/g, " ").trim();
    return result.length <= len ? result : result.substring(0, len).trim() + '…';
}

export { articleEmbed };