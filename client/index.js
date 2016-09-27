//client-side index.js
// var socketController=require('./socketController').default;
// socketController=new socketController();
// console.log("loading");
// console.log(socketController.init());
//
// dom.innerHTML='<div>'+test.output()+'</div>';

var WebSocket = require('ws');
var ws = new WebSocket('localhost:3000');

ws.on('open', function open() {
  ws.send('something');
});

ws.on('message', function(data, flags) {
  // flags.binary will be set if a binary data is received.
  // flags.masked will be set if the data was masked.
});

