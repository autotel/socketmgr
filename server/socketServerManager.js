let eemiter=require('../shared/OnHandlers');
// pendant: change syntax to kind of import '../shared/MessageInterpreter' as interpreter;
let interpreter=require('../shared/MessageInterpreter');
let WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express();

export default class socketServerManager{
  constructor(port){
    eemiter.onHandlers.call(this);
    console.log("constructing socket server at port "+port);
    let parent=this;
    app.use(express.static('public'));
    let server = http.createServer(app);
    server.listen(port);
    let wss = new WebSocketServer({
      server: server
    });
    let thisWebSocketManager=this;

    wss.binaryType = "arraybuffer";

    wss.on('connection', function(ws) {
      ws.binaryType = "arraybuffer";
      parent.handle('connection',new thisWebSocketManager.WebSocketInstance(ws));
    });

    this.WebSocketInstance=function(ws){
      let thisWebSocketInstance=this;
      this.ws=ws;
      eemiter.onHandlers.call(this);
      this.ws.on('message', function(msg) {
        // console.log("wsman rcv msg"+msg);
        try{
          let arrbuf=new ArrayBuffer(20);
          let uint32=new Uint32Array(arrbuf);
          for(let a in uint32){
            uint32[a]=msg.readUInt32LE(4*a);
          }
          let parsedMessage =interpreter.decode(uint32);
          //pendant: this is not the right place for this mapping; something is still wrong with the dataviews on this side
          parsedMessage.data=[parsedMessage.data[2],parsedMessage.data[3],parsedMessage.data[4]];

          thisWebSocketInstance.handle('message',{parsedMessage:parsedMessage,rawMessage:msg});
          thisWebSocketManager.handle('socketMessage',{parsedMessage:parsedMessage,rawMessage:msg,socket:this.ws});

        }catch(e){
          console.warn("socketServerManager had a problem putting the message buffer together:",e);
          console.log("handling message as it came"+msg);
          thisWebSocketInstance.handle('message',{rawMessage:msg});
          thisWebSocketManager.handle('socketMessage',{rawMessage:msg,socket:this.ws});
        }
        // console.log(msg);
      });
      this.send=function(data){
        let out=data;
        if(!(data instanceof Buffer || data instanceof ArrayBuffer)){
          out=interpreter.encode(data);
        }
        this.ws.send(out, function(e) {
          if (e) console.warn(e)
        });
      }
      return this;
    }

  }
}