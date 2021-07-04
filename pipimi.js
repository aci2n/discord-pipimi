const Discord = require('discord.js');
const client = new Discord.Client();
const process = require('process');
const mlEmbed = require('./ml-embed');
const axios = require('axios');

const API_KEY_NAME = 'PIPIMI_API_KEY';
const API_KEY = process.env[API_KEY_NAME];

if (!API_KEY) {
    console.error(`should have a Discord API key in the ${API_KEY_NAME} environment variable`);
    process.exit(1);
}

client.on('message', message => {
    if (message.author.bot) return;

    const meliId = extractMeliId(message.content);
    if (meliId != null) {
        getItemInfo(meliId)
            .then(res => message.channel.send(mlEmbed.itemEmbed(message, res.data)))
            .then(sent => message.delete({timeout: 1, reason: "deleted by pipimi"}))
            .catch(err => console.error(err));
    }
});

const extractMeliId = (function () {
    const matchers = [
        /articulo\.mercadolibre\.com(?:\.\w{2,})?\/(\w+)-(\d+)/im
        // /mercadolibre\.com(?:\.\w{2,})?\/.*?\/p\/(\w+)/im
    ];

    return content => {
        for (const matcher of matchers) {
            const match = content.match(matcher);
            if (match !== null) {
                return match[1] + match[2];
            }
        }
		return null;
    }
}());

const getItemInfo = itemId => {
    return axios({
        url: `https://api.mercadolibre.com/items/${itemId}`,
        method: 'get',
        timeout: 8000,
        headers: {
            'Content-Type': 'application/json',
        }
    })
};

client.login(API_KEY);
