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
    
    console.log(message);
    if (message.channel.name === 'bot_log' && message.content === 'embedme') {
        message.channel.send(mlEmbed.createEmbed({ todo: 'todo' }));
    }

    if (isMeliUrl(message.content)) {
        getItemInfo(extractItemId(message.content)).then(res =>
            message.channel.send(JSON.stringify(res.data).substring(0,200))
        );
    }
    
    // test ML embed item
    if (message.channel.name === 'bot_log' && message.content === 'embedme') {
        message.channel.send(mlEmbed.itemEmbed(require('./test-item.json')));
    }
});

const isMeliUrl = message => {
    return /articulo\.mercadolibre\.com\.ar/igm.test(message);
}

const extractItemId = url => {
    const splitted = url.replace('https://', '').split('/')[1].split('-');

    return splitted[0] + splitted[1];
}

const getItemInfo = itemId => {
    let res = axios({
        url: `https://api.mercadolibre.com/items/${itemId}`,
        method: 'get',
        timeout: 8000,
        headers: {
            'Content-Type': 'application/json',
        }
    })

    return res
};

client.login(API_KEY);
