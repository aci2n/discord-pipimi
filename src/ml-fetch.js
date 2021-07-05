const axios = require('axios');

const extractors = [
    {
        regexp: /articulo\.mercadolibre\.com(?:\.\w{2,})?\/(\w+)-(\d+)/im,
        fetcher: match => getArticleFromItem(match[1] + match[2])
    },
    {
        regexp: /mercadolibre\.com(?:\.\w{2,})?\/.*?\/p\/(\w+)/im,
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
        .then(([item, description]) => ({item, description}));
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

exports.fetchArticle = fetchArticle;