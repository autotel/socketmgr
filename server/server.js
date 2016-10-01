var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express();
//++console.log(__dirname);
//question: is this the best way to go here? with respect to file relative paths

app.use(express.static('public'));
var server = http.createServer(app);
server.listen(8080);
var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
  var id = setInterval(function() {
    ws.send(JSON.stringify(process.memoryUsage()), function() { /* ignore errors */ });
  }, 100);
  console.log('started client interval');
  ws.on('close', function() {
    console.log('stopping client interval');
    clearInterval(id);
  });
  ws.on('message',function(a){
    console.log("han");
    console.log(JSON.stringify(a));
    ws.send(a);
  });
  /*
  this is other approach to handle message reception
  the parameter a will contain event data, which is a lot more of data
  ws.onmessage=function(a){
    console.log("han");
    console.log(a);
  }
  */
});
