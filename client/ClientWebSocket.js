export default class ClientWebSocket {
  //should it init in construction, or require an init?
  constructor(){
    var parent=this;
    console.log("ClientWebSocket constructed!")
    var host = window.document.location.host.replace(/:.*/, '');
    this.ws = new WebSocket('ws://' + host + ':8080');
    this.onMessage=function(data){

      // updateStats(JSON.parse(event.data));
    }
    this.ws.onmessage = function (event) {
      parent.onMessage(JSON.parse(event.data));
    };
  }
  init (){
  }
}

