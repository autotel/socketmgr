let WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express();

let clientsMan=require('./ClientsManager');
let interpreter=require('../shared/MessageInterpreter');
let ev = require('events');
let events = new ev.EventEmitter();

export default class socketServerManager {
  //there is only a constructor function here, because the socket functions must be appended to each client upon creation.
  constructor(port) {
    console.log("constructing socket server at port "+port);
    let parent=this;
    app.use(express.static('public'));
    let server = http.createServer(app);
    server.listen(port);
    let wss = new WebSocketServer({
      server: server
    });
    //pay attention that wss is the whole websocket while ws will be each socket instance
    wss.on('connection', function(ws) {
      //pendant: client should be prototype, so instead of newClient we call new Client()
      let client = new clientsMan.Client({
        ws: ws
      });
      // console.log("new client",client);
      //teach this client-identity how he is supposed to send data
      //pendant: make the client.send inside clientsManager, pass ws as paramenter on constructor
      client.send=function(data){
        // ws.send(new Uint32Array([42]),{binary:true,mask:true},function(e) {
        //   if (e) console.warn(e)
        // });
        ws.send(interpreter.encode(data), function(e) {
          if (e) console.warn(e)
        });
      }
      //send the client Id to the client
      client.send({
        header: "newid",
        pointer: client.unique
      });
      //send the current state of other clients to the client
      // client.send({
      //   header: "allStates",
      //   data: clientsMan.getAllStates()
      // });
      //pendant: this is a slower temporal replacement for allStates emission
      clientsMan.forEach(function(thisClient){
        for(let a in thisClient.currentState){
          client.send({
            header:[a],
            pointer:thisClient.unique,
            data:thisClient.currentState[a].data||[0,0,0]
          });
        }
      });

      //inform all the other clients about the nuew user
      client.broadcast({
        header: "newclient",//newClient
        pointer: client.unique
      });
      //inform whoever is seeing the console about the new client
      console.log('New client [' + client.unique + '] connected');
      //set some handlers to this client's websocket
      ws.on('close', function() {
        client.broadcast({
          header: "remove",//remove
          pointer: client.unique
        });
        console.log('stopping client'+client.unique);
        clientsMan.removeClient(client);
      });

      ws.on('message', function(a) {
        let parsedMessage = interpreter.decode(a);
        parsedMessage.pointer=client.unique;
        client.trackChange(parsedMessage);
        if(parsedMessage.header=="changeposition"){
          console.log("position",parsedMessage.data);
          client.broadcast(parsedMessage);
        }
      });
    });
  }



}