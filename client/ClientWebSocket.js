var a=require('./OnHandlers');
export default class ClientWebSocket {
  constructor(address){
    a.onHandlers.call(this);
    console.log("ClientWebSocket constructed!");
    if(address){
      this.init(address);
    }
    return this;
  }
  init (address){
    var parent=this;
    //onHandlers.call(this);
    //pendant:make communication binary
    this.ws = new WebSocket(address);
    //alias only for easier access
    var connection=this.ws;
    connection.onmessage = function (event) {
      //question: is it secuer to json.parse server received data?
      try{
        var data=JSON.parse(event.data);
        parent.handle("message",data);
      }
      catch(error){
        console.log(error,event);
      }
    };
    connection.onopen = function (event) {
      parent.handle("connectionOpened",event);
      //parent.emit("test");
    };
  }
  //pendant: this shoukld make thne work of encomdonf into binary, as shor as possible payloads aswell.
  //dont use json, too long.

  emit(payload,then){
    var connection=this.ws;
    var ret={};
    try{
      connection.send(payload); // Send the message 'Ping' to the server
      this.handle("emit",payload);
      if(then)
      then(null,payload);
    }
    catch(error){
      if(then){
        then(error);
      }else{
        throw error;
      }
    }
    return ret;
  }

}
