let a=require('./OnHandlers');
let interpreter=require('../shared/MessageInterpreter');
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
    let parent=this;
    //onHandlers.call(this);
    //pendant:make communication binary
    this.ws = new WebSocket(address);

    this.ws.binaryType='arraybuffer';//i actually would like to communicate by using arraybuffer

    //alias only for easier access
    let connection=this.ws;
    connection.onmessage = function (event) {
      let parsedMessage=interpreter.decode(event.data);
      if(parsedMessage.header=="ping"){
        parent.emit({header:"pong",pointer:0});
      }else{
            // console.log("event data ",parsedMessage);
            //question: is it secuer to json.parse server received data?
            // console.log(interpreter.decode(event.data));
            // try{
            //   reader.addEventListener("loadend", function() {
            //     console.log("reader end ",reader.result);
            //      // reader.result contains the contents of blob as a typed array
            //   });
            //   // reader.readAsArrayBuffer(event.data);
            //   reader.readAsText(event.data);
            // }
            // catch(error){
            //   console.log("readerError",error);
            // }


        parent.handle("message",parsedMessage);
      }
      // try{
      //   let data=JSON.parse(event.data);
      //   parent.handle("message",data);
      // }
      // catch(error){
      //   console.log(error,event);
      // }
    };
    connection.onopen = function (event) {
      // connection.send([42,45]);
      parent.handle("connectionOpened",event);
      //parent.emit("test");
    };
  }
  //pendant: this shoukld make thne work of encomdonf into binary, as shor as possible payloads aswell.
  //dont use json, too long.

  emit(payload,then){
    let connection=this.ws;
    let ret={};
    let encodedMessage=interpreter.encode(payload);
    // console.log("encodedecode",interpreter.decode(encodedMessage).data);

    try{
      connection.send(encodedMessage);
      this.handle("emit",encodedMessage);
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
