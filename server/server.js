var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express();
var registry=require('./ClientRegistry');
//++console.log(__dirname);
//question: is this the best way to go here? with respect to file relative paths

app.use(express.static('public'));
var server = http.createServer(app);
server.listen(8080);
var wss = new WebSocketServer({server: server});
//pay attention that wss is the whole websocket while ws will be each socket instance
wss.on('connection', function(ws) {
  var thisClientId=registry.newClientId({ws:ws});
  //console.log(ws);
  //pendant: why each call needs a json parse? shoildnt that be handled by the function instead?
  //send the clientId to the client
  ws.send(JSON.stringify({type:"newId",data:""+thisClientId}), function(e) { if(e) console.warn(e) });
  //send the current state to the client
  ws.send(JSON.stringify({type:"allStates",data:registry.getAllStates()}), function(e) { if(e) console.warn(e) });
  //inform all the other clients about the nuew user
  broadcast(JSON.stringify({type:"newClient",clientId:thisClientId}),thisClientId);
  //inform whoever is seeing the console about the new client
  console.log('New client ['+thisClientId+'] connected');
  //set some handlers to this client's websocket
  ws.on('close', function() {
    broadcast(JSON.stringify({type:"remove",clientId:""+thisClientId},thisClientId), function(e) { if(e) console.warn(e) });
    console.log('stopping client interval');
    registry.removeClient(thisClientId);
  });
  ws.on('message',function(a){
    a.serverId=thisClientId;
    console.log(a);
    var parsedMessage;
    try{
      parsedMessage=JSON.parse(a);
    }
    catch(e){
      console.warn("recieved a message that could not be parsed in json: "+a);
      console.warn(e);
    }
    registry.clientEmitted(thisClientId,parsedMessage);
    broadcast(a,thisClientId);
    // ws.send(a);
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
var broadcast = function(data,except) {
  //data must be string, or ws dies
  data=data+"";
  registry.forEach(function(client){
    var d=true;
    if(except){
      if(client.clientId==except){
        //pendant: it has not been tested that this continue will effectively jump over this send.
        d=false;
      }
    }
    //ws was provided on connection event to each new client listing
    if(d){
      try{
        client.ws.send(data);
      }
      catch(e){
        console.warn("object "+client.clientId+" missed some data",data);
        console.warn(e);
      }
    }
  })
};
