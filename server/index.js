var express= require('express');
var app = express();
var http = require('http').Server(app);

var port=3000;
app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});
http.listen(port, function(){
  console.log('listening on *:'+port);
});