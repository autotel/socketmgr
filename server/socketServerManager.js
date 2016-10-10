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
    wss.binaryType = "arraybuffer";
    //timer for keepalive pendant: should be inside clientsMan
    let pingPongTimer=setInterval(function(){
      clientsMan.forEach(function(thisClient){
        if(thisClient.waitingPong){
          clientsMan.removeClient(thisClient);
          console.log('stopping client '+thisClient.unique+" from ping-pong death");
          thisClient.broadcast({
            header: "remove",
            pointer: thisClient.unique
          });
        }else{
          console.log("iter"+thisClient.unique);
          thisClient.send({header:"ping"});
          thisClient.waitingPong=true;
        }


      });
    },5000);
    //pay attention that wss is the whole websocket while ws will be each socket instance
    wss.on('connection', function(ws) {
      ws.binaryType = "arraybuffer";
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
        let out=data;
        if(!(data instanceof Buffer || data instanceof ArrayBuffer)){
          out=interpreter.encode(data);
        }
        ws.send(out, function(e) {
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
        console.log("sending current state of "+thisClient.unique);
        for(let a in thisClient.currentState){
          try{
            console.log("->"+a+":",thisClient.currentState[a]);
            var out={
              header:a,
              pointer:thisClient.unique
            };
            if(thisClient.currentState[a]){
              out.data=thisClient.currentState[a];
            }
            client.send(out);

          }catch(e){
            console.log(e);
            console.log(thisClient.currentState);
          }
        }
      });

      //inform all the other clients about the nuew user
      client.broadcast({
        header: "newclient",//newClient
        pointer: client.unique
      });
      //pendant: sort this
      client.trackChange({
        header: "newclient",
        pointer: client.unique
      });
      //inform whoever is seeing the console about the new client
      console.log('New client [' + client.unique + '] connected');
      //set some handlers to this client's websocket
      ws.on('close', function() {
        client.broadcast({
          header: "remove",
          pointer: client.unique
        });
        console.log('stopping client'+client.unique);
        clientsMan.removeClient(client);
      });

      ws.on('message', function(msg) {
        try{
          var arrbuf=new ArrayBuffer(20);
          var uint32=new Uint32Array(arrbuf);
          for(var a in uint32){
            uint32[a]=msg.readUInt32LE(4*a);
          }
          let parsedMessage = interpreter.decode(uint32);
          //clear the timer of death, set on pingpong
          if(parsedMessage.header=="pong"){
            client.waitingPong=false;
          }
          //pendant: this is not the right place for this mapping; something is still wrong with the dataviews on this side
          parsedMessage.data=[parsedMessage.data[2],parsedMessage.data[3],parsedMessage.data[4]];
          // parsedMessage.pointer=client.unique;
          client.trackChange(parsedMessage);
          if(parsedMessage.header=="changeposition"){
            console.log("position",parsedMessage);
            client.broadcast(msg);
          }
        }catch(e){
          console.warn("socketServerManager had a problem putting the message buffer together:",e);
          console.log("broken message was: ",msg);
        }

        // var b= new ArrayBuffer(20);
        // var dv=new Uint8Array(b);
        // for(var c in dv){
        //   if(a[c]) dv[c]=a[c];
        // }

        console.log(msg);
        // console.log("a instanceof Buffer=",a instanceof Buffer);
        //
      });
    });
  }



}