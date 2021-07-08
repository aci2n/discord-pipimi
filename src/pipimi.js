import { Client } from 'discord.js';
import { env, exit } from 'process';
import { fetchArticle } from './ml-fetch.js'
import { articleEmbed } from './ml-embed.js';

const client = new Client();
const API_KEY_NAME = 'PIPIMI_API_KEY';
const API_KEY = env[API_KEY_NAME];

if (!API_KEY) {
    console.error(`should have a Discord API key in the ${API_KEY_NAME} environment variable`);
    exit(1);
}

client.on('message', message => {
    if (message.author.bot) return;
    processMeliArticle(message);
});

const processMeliArticle = message => {
    const result = fetchArticle(message.content);
    if (result !== null) {
        result.then(article => message.channel.send(articleEmbed(message, article)))
            .then(_ => message.delete({ timeout: 0, reason: "deleted by pipimi" }))
            .catch(err => console.error(err));
    }
};

client.login(API_KEY);
