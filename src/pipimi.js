const Discord = require('discord.js');
const client = new Discord.Client();
const process = require('process');
const mlFetch = require('./ml-fetch');
const mlEmbed = require('./ml-embed');

const API_KEY_NAME = 'PIPIMI_API_KEY';
const API_KEY = process.env[API_KEY_NAME];

if (!API_KEY) {
    console.error(`should have a Discord API key in the ${API_KEY_NAME} environment variable`);
    process.exit(1);
}

client.on('message', message => {
    if (message.author.bot) return;
    processMeliArticle(message);
});

const processMeliArticle = message => {
    const result = mlFetch.fetchArticle(message.content);
    if (result !== null) {
        result.then(article => message.channel.send(mlEmbed.articleEmbed(message, article)))
              .then(_ => message.delete({timeout: 0, reason: "deleted by pipimi"}))
              .catch(err => console.error(err));
    }
};

client.login(API_KEY);
