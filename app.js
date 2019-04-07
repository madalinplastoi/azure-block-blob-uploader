'use strict';
var express = require('express'),
    bodyParser = require('body-parser'),
    app = express();
var path = require('path');

//use JSON parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


// Handler for internal server errors
function errorHandler(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500);
    res.render('error_template', {error: err});
}

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/', express.static(path.join(__dirname, 'public'), {index: 'index.html'}));

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Server has started and its listening on: 3000');