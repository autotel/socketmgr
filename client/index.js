var Wsock=require('./ClientWebSocket').default;
var host = window.document.location.host.replace(/:.*/, '');
var characters=require('./Characters');
//my own clientId, bint to server
var myClientId;
console.log(host);
/*
this is the same..
var wsock=new Wsock()
wsock.init('ws://' + host + ':8080');
...than this */
var wsock=new Wsock('ws://' + host + ':8080');

wsock.on("message",function(message){

  if(message.type=="chp"){
    // message.no
    // console.log("a",message);
    var remoteSprite=characters.remote(message.clientId);
    if(remoteSprite){
      remoteSprite.transform.rotation(remoteSprite.transform.position(message).getMovementDirection()* 180 / Math.PI);
    }else{
      console.warn("couldn't retrieve the corresponding sprite",message);
    }
    // characters.each(function(ch){
    //   ch.transform.rotation(ch.transform.position(message).getMovementDirection()* 180 / Math.PI);
    // });
  }else if(message.type=="remove"){
    //pendant:this should be inside
    var remoteSprite=characters.remote(message.clientId);
    if(remoteSprite){
      remoteSprite.remove();
    }else{
      console.warn("couldn't retrieve the corresponding sprite",message);
    }
  }else if(message.type=="newId"){
    myClientId=message.data;
    //console.log("new client Id",message);
    //new characters.Character({clientId:myClientId});
  }else if(message.type=="allStates"){

    var state=message.data;
    //for each state registry
    for(var a in state){
      //check if we already have a sprite for this remote object
      var dataOwner=characters.remote(state[a].clientId);
      if(dataOwner){
        //if we have it, will apply all the data to it. So far only position
        dataOwner.transform.position(state[a]);
      }else{
        //if we don't have it, we create it.
        new characters.Character({position:{x:state[a].x,y:state[a].y},clientId:state[a].clientId});
      }
    }
  }else if(message.type=="newClient"){
    console.log("new client",message);
    new characters.Character({clientId:message.clientId});
  }else{
    console.warn("unexpected message type:",message);
  }
});

document.addEventListener("mousemove",function(e){
  //what is "the way" to error handle?
  wsock.emit(JSON.stringify({type:"chp",clientId:myClientId,x:e.clientX,y:e.clientY}),function(err,pl){
    if(err){
      console.log("not sent",err);
    }else{
      //console.log(pl);
    }
  });
});




