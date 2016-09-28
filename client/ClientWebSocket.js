export default class ClientWebSocket {
  //should it init in construction, or require an init?
  constructor(){
    var a=require('./OnHandlers');
    a.onHandlers.call(this);
    var parent=this;
    //onHandlers.call(this);
    console.log("ClientWebSocket constructed!")
    var host = window.document.location.host.replace(/:.*/, '');
    this.ws = new WebSocket('ws://' + host + ':8080');
    this.ws.onmessage = function (event) {
      parent.handle("message",JSON.parse(event.data));
    };
  }
  init (){
  }
}
