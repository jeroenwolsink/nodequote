const fs = require('fs');
const csv = require('fast-csv');

const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const router = new express.Router();
const quotes = [];

router.get('/', function(req, res) {
    res.json({message: 'Node quote initialized with '
    + quotes.length + ' quotes.'});
});

router.get('/quote', function(req, res) {
    let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.json(randomQuote);
});

app.use('/api', router);

app.listen(port);

let stream = fs.createReadStream('quotes.csv');

csv
    .fromStream(stream, {headers: ['id', 'content', 'author']})
    .on('data', function(data) {
        quotes.push(data);
    })
    .on('end', function() {
        console.log('Finished loading quotes from file');
    });

console.log('Node Quote RESTful API server started on: ' + port);
