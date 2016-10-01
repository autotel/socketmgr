var Wsock=require('./ClientWebSocket').default;
var host = window.document.location.host.replace(/:.*/, '');
console.log(host);
/*
this is the same..
var wsock=new Wsock()
wsock.init('ws://' + host + ':8080');
...than this */
var wsock=new Wsock('ws://' + host + ':8080');

wsock.on("message",function(message){
  if(message.type=="chp"){
    characters.each(function(ch){
      ch.transform.rotation(ch.transform.position(message).getMovementDirection()* 180 / Math.PI);
    });
  }
  //console.log(message);
  // document.getElementById('rss').innerHTML = memuse.rss;
  // document.getElementById('heapTotal').innerHTML = memuse.heapTotal;
  // document.getElementById('heapUsed').innerHTML = memuse.heapUsed;
});

document.addEventListener("mousemove",function(e){
  //what is "the way" to error handle?
  wsock.emit(JSON.stringify({type:"chp",x:e.clientX,y:e.clientY}),function(err,pl){
    if(err){
      console.log("not sent",err);
    }else{
      //console.log(pl);
    }
  });
});

var characters=require('./Characters');
new characters.Character();


