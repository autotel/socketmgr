/*
this module contains the data for each client in a pool of websocket connections.
the idea is to be able to obtain the last state of each client side without
having necessarily to poll.
It also allows each client to have an 'unique' client ID, and know the client ID
of all the other clients that are connected to the server, and to attach the functions
to a client class, so we become able to call functions such as clientsManager.broadcast
and client.send.
*/
var clients={};
//uncomment to have access to the client list.
//should not be a problem as long as iandexes are not altered. Or maybe even if so
// exports.clients=clients;
var nextClientId=0;
//question: is this ok?
var thisClientsManager=exports;
var nextClientIdSearch=function(startingFrom){
  //you can either try to be economic with the client id, or just allocate one entry per connection
/*  var currentClientN=startingFrom;
  while(clients[currentClientN]){
    currentClientN++;
  }
  return currentClientN;*/
  nextClientId++;
  return nextClientId;
}
//new Client ID creates a space for a new client.
//custom data can be provided, such as the websocket handle
exports.Client=function(append){
  var append=append||{};
  var thisClient=this;
  //question: if timestamp is provided in append parameter, it will get overwritten. Is that ok?
  this.timestamp={created:Date.now()};
  this.currentState={};

  for(var a in append){
    this[a]=append[a];
  }

  //get a new id for distinction among clients on communications
  this.unique=nextClientIdSearch();
  //add this element to a ClientsManager global array;
  clients[this.unique]=this;
  this.getIndexInArray=function(){
    return this.unique;
  }
  //some functions to this client
  this.broadcast=function(data) {
    console.log("broadcast->");
    //execute send to all the clients exept this client
    var except=thisClient.unique;
    thisClientsManager.forEach(function(client) {
      console.log(" iterate client"+client.unique);
      var d = true;
      if (except) {
        if (client.unique == except) {
          //pendant: it has not been tested that this continue will effectively jump over this send.
          d = false;
        }
      }
      //ws was provided on connection event to each new client listing
      if (d) {
        try {
          client.send(data);
          console.log("client "+client.unique+" sent");
        } catch (e) {
          console.warn("object " + client.unique + " missed some data", data);
          console.warn(e);
        }
      }
    });
  };



  console.log("kk"+this.unique);
  this.id=this.unique;

  //keeps the record for current client's state, so each new client gets the older ones.
  this.trackChange=function(data){
    console.log(data.header+" of "+this.unique+" is "+data.data||false);
    this.currentState[data.header]=data.data||false;
    // for(var a in data){
    //   this.currentState[a]=data[a];
    // }
    this.timestamp.lastEmit=Date.now();
  }
  // return this;
}
//when a client emits data, you want to register it, so the registry will contain
//the latest state of each client
//pendant: should be renamed to trackChangeOf. is a trackChange with a search function
exports.clientEmitted=function(uniqueToGet,data){
  //update the client's current state from the data
  //it overwrites data with the same name, which gives sense to keeping track
  if(clients[uniqueToGet]){
    clients[uniqueToGet].trackChange(data);
  }else{
    console.warn("ClientRegistry at clientEmitted(): tried to access clients["+uniqueToGet+"], which does not exist");
  }
}
exports.forEach=function(callback){
  for(var a in clients){
    if(clients[a]!=null){
      callback(clients[a]);
    }
  }
}

exports.getAllStates=function(){

  let outGoing={header:"statebatch",pointer:0,data:[]};
  exports.forEach(function(thisClient){
    if(thisClient.currentState.changeposition){
      outGoing.data.push(thisClient.unique);
      for (let a in thisClient.currentState.changeposition){
        outGoing.data.push(thisClient.currentState.changeposition[a]);
      }
    }
    // console.log("sending current state of "+thisClient.unique);
    //generic approach:
    // for(let a in thisClient.currentState){
    //   try{
    //     console.log("->"+a+":",thisClient.currentState[a]);
    //     var out={
    //       header:a,
    //       pointer:thisClient.unique
    //     };
    //     if(thisClient.currentState[a]){
    //       out.data=thisClient.currentState[a];
    //     }
    //     client.send(out);
    //
    //   }catch(e){
    //     console.log(e);
    //     console.log(thisClient.currentState);
    //   }
    // }
  });
  console.log(outGoing);
  return outGoing;
  //json connection approach
  // var statuses={};
  // for(var a in clients){
  //   statuses[a]=clients[a].currentState;
  // }
  // return statuses;
}
exports.removeClient=function(client){
  // clients.splice(clients.indexOf(client),1);
  // clients[unique]=null;
  return delete clients[client.getIndexInArray()];
}