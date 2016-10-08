let Wsock=require('./ClientWebSocket').default;
let host = window.document.location.host.replace(/:.*/, '');
let characters=require('./Characters');
//my own clientId, bint to server
let myClientId;
//my own sprite instance.
let localSprite;
console.log(host);
document.addEventListener('DOMContentLoaded', function() {
  /*
  this is the same..
  let wsock=new Wsock()
  wsock.init('ws://' + host + ':8080');
  ...than this */
  let wsock=new Wsock('ws://' + host + ':9966');

  wsock.on("message",function(message){

    console.log("incoming message",message);
    if(message.header=="changeposition"){
      // message.no
      let remoteSprite=characters.remote(message.pointer);
      if(remoteSprite){
        remoteSprite.transform.rotation(remoteSprite.transform.position(message).getMovementDirection()* 180 / Math.PI);
      }else{
        console.warn("couldn't retrieve the corresponding sprite",message);
      }
      // characters.each(function(ch){
      //   ch.transform.rotation(ch.transform.position(message).getMovementDirection()* 180 / Math.PI);
      // });
    }else if(message.header=="remove"){
      //pendant:this should be inside
      let remoteSprite=characters.remote(message.pointer);
      if(remoteSprite){
        remoteSprite.remove();
      }else{
        console.warn("couldn't retrieve the corresponding sprite",message);
      }
    }else if(message.header=="newid"){
      myClientId=message.data;
      localSprite=new characters.Character({unique:myClientId});
      //console.log("new client Id",message);
    }else if(message.header=="allstates"){

      let state=message.data;
      //for each state registry
      for(let a in state){
        //check if we already have a sprite for this remote object
        let dataOwner=characters.remote(state[a].pointer);
        if(dataOwner){
          //if we have it, will apply all the data to it. So far only position
          dataOwner.transform.position(state[a]);
        }else{
          //if we don't have it, we create it.
          let newCharacter=new characters.Character({position:{x:state[a].x,y:state[a].y},unique:state[a].pointer});
          //if the character id is of my same server id, means that is the localSprite
          console.log("myclient",myClientId);
          if(message.pointer==myClientId){ localSprite=newCharacter; }
        }
      }
    }else if(message.header=="newclient"){
      // console.log("new client",message);
      new characters.Character({unique:message.pointer});
    }else{
      console.warn("unexpected message header:",message);
    }
  });

  document.addEventListener("mousemove",function(e){
    console.log("encodedecode",({header:"changeposition",pointer:myClientId,data:[e.clientX,e.clientY,0]}));
    //question: what is "the way" to error handle?
    wsock.emit({header:"changeposition",pointer:myClientId,data:[e.clientX,e.clientY,0]},function(err,pl){
      if(err){
        console.log("not sent",err);
      }else{
        //console.log(pl);
      }
    });
    if(localSprite){
      // console.log("clientid",myClientId,characters)
      // localSprite=characters.remote(myClientId);
      // console.log(localSprite);
      localSprite.transform.rotation(localSprite.transform.position({x:e.clientX,y:e.clientY}).getMovementDirection()* 180 / Math.PI);
    }
  });
});




