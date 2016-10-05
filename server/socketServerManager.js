var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express();

var clientsMan=require('./ClientsManager');

var ev = require('events');
var events = new ev.EventEmitter();

export default class socketServerManager {
  //there is only a constructor function here, because the socket functions must be appended to each client upon creation.
  constructor(port) {
    console.log("constructing socket server at port "+port);
    var parent=this;
    app.use(express.static('public'));
    var server = http.createServer(app);
    server.listen(port);
    var wss = new WebSocketServer({
      server: server
    });
    //pay attention that wss is the whole websocket while ws will be each socket instance
    wss.on('connection', function(ws) {
      //pendant: client should be prototype, so instead of newClient we call new Client()
      var client = new clientsMan.Client({
        ws: ws
      });
      console.log("nc",client);
      //teach this client-identity how he is supposed to send data.
      client.send=function(data){
        ws.send(JSON.stringify(data), function(e) {
          if (e) console.warn(e)
        });
      }
      //send the client Id to the client
      client.send({
        type: "newId",
        data: "" + client.unique
      });
      //send the current state of other clients to the client
      client.send({
        type: "allStates",
        data: clientsMan.getAllStates()
      });
      //inform all the other clients about the nuew user
      client.broadcast({
        type: "newClient",
        unique: client.unique
      });
      //inform whoever is seeing the console about the new client
      console.log('New client [' + client.unique + '] connected');
      //set some handlers to this client's websocket
      ws.on('close', function() {
        client.broadcast({
          type: "remove",
          unique: "" + client.unique
        });
        console.log('stopping client interval');
        clientsMan.removeClient(client);
      });

      ws.on('message', function(a) {
        var parsedMessage;
        try {
          parsedMessage = JSON.parse(a);
          // parsedMessage.unique=client.unique;
          client.trackChange(parsedMessage);
          // clientsMan.clientEmitted(client, parsedMessage);
          client.broadcast(parsedMessage);
          // ws.send(a);
        } catch (e) {
          console.warn("recieved a message that could not be parsed in json: " + a);
          console.warn(e);
        }
      });
    });
  }



}