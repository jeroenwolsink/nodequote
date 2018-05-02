const fs = require('fs');
const csv = require("fast-csv")

var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;
var router = express.Router();
var quotes = [];

router.get('/', function(req, res) {
    res.json({ message: 'Node quote initialized with ' + quotes.length + ' quotes.' });
});

router.get('/quote', function(req, res) {    
    var randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.json(randomQuote);
});

app.use('/api', router);

app.listen(port);

var stream = fs.createReadStream("quotes.csv");

csv
 .fromStream(stream, {headers : ["id", "content", "author"]})
 .on("data", function(data){
    quotes.push(data); 
 })
 .on("end", function(){
     console.log("Finished loading quotes from file");
 });

console.log('Node Quote RESTful API server started on: ' + port);