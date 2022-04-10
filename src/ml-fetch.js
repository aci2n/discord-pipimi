import { argv, exit } from 'process';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { articleEmbed } from './ml-embed.js';
import { PipimiCommand, PipimiResponse } from './framework/command.js';

const extractors = [
    {
        regexp: /mercadolibre\.com(?:\.\w{2,})?\/(\w+)-(\d+)/im,
        fetcher: match => getArticleFromItem(match[1] + match[2])
    },
    {
        regexp: /mercadolibre\.com(?:\.\w{2,})?.*?\/p\/(\w+\d+)/im,
        fetcher: match => getArticleFromProduct(match[1])
    }
];

const getArticleFromProduct = productId => {
    console.log('fetching product', productId);
    return simpleGet(`https://api.mercadolibre.com/products/${productId}`)
        .then(product => getArticleFromItem(product.buy_box_winner.item_id));
};

const getArticleFromItem = itemId => {
    console.log('fetching item and description', itemId);
    const itemUrl = `https://api.mercadolibre.com/items/${itemId}`;
    return Promise.all([simpleGet(itemUrl), simpleGet(itemUrl + '/description')])
        .then(([item, description]) => ({ item, description }));
};

const simpleGet = url => {
    return axios({
        url,
        method: 'get',
        timeout: 5000,
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(res => res.data)
};

// let's call a {item+description} an article for clarity :D
const fetchArticle = content => {
    for (const extractor of extractors) {
        const match = content.match(extractor.regexp);
        if (match !== null) {
            console.log('found match', match, extractor);
            return extractor.fetcher(match);
        }
    }
    return null;
};

const checkUrl = () => {
    if (argv.length < 3) {
        console.error("Usage: node ml-fetch.js URL");
        exit(1);
    }

    const url = argv[2];
    const result = fetchArticle(url);

    if (result != null) {
        result.then(article => console.log('found article', article.item.id))
            .catch(error => console.log('error fetching article', JSON.stringify(error, null, 2)));
    } else {
        console.log('no match detected', url);
    }
};

/**
 * @type {PipimiCommand[]}
 */
const getMeliCommands = () => {
    return [new PipimiCommand("ml", async context => {
        const { message } = context;
        const articlePromise = fetchArticle(message.content);

        if (!articlePromise) {
            return PipimiResponse.empty();
        }

        const article = await articlePromise;
        const embed = articleEmbed(message, article);

        return PipimiResponse.compose(
            PipimiResponse.send(embed),
            PipimiResponse.delete());
    })];
};

if (argv[1] === fileURLToPath(import.meta.url)) {
    checkUrl();
}

export { getMeliCommands };