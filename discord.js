const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');

client.on('message', message => {
  if (message.author.bot) return;

  if (isMeliUrl(message.content)) {
    const itemId = extractItemId(message.content);
    getItemInfo(itemId).then(res =>
      message.channel.send(JSON.stringify(res.data).substring(0,200))
    );
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

client.login("NTA2MTI0ODY4MjAzNTc3MzQ1.W9XTgw.RhF1Eby100n695LkIwnUTjQBSO8");
