var express = require('express');
var app = express();

app.use(express.static(__dirname + '/../'));

var http = require('http');
var port = process.env.PORT || 3000;
http.createServer(app).listen(port, function() {
  console.log('listening on', port)
});
